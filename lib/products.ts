import { createClient } from '@/lib/supabase/supabaseClient';
import type { Product, ProductCondition, ProductImage, ProductStatus } from '@/types/product';

const PRODUCT_BUCKET = 'product-images';

type CreateProductInput = {
  condition: ProductCondition;
  description: string;
  price: number;
  status: ProductStatus;
  title: string;
  userId: string;
};

type UpdateProductInput = {
  condition: ProductCondition;
  description: string;
  price: number;
  status: ProductStatus;
  title: string;
};

type UploadedImage = {
  path: string;
  sortOrder: number;
};

export type ProductDetail = {
  product: Product;
  images: ProductImage[];
};

export type FeaturedProduct = {
  id: string;
  title: string;
  price: number;
  status: ProductStatus;
  likes: number;
  comments: number;
  thumbnailUrl: string | null;
};

export type ProductSummary = {
  id: string;
  title: string;
  price: number;
  status: ProductStatus;
  condition: ProductCondition;
  likes: number;
  comments: number;
  thumbnailUrl: string | null;
};

export function getProductImageUrl(storagePath: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(storagePath);

  return publicUrl;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({
      condition: input.condition,
      description: input.description,
      price: input.price,
      status: input.status,
      title: input.title,
      user_id: input.userId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
): Promise<Product> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .update({
      condition: input.condition,
      description: input.description,
      price: input.price,
      status: input.status,
      title: input.title,
    })
    .eq('id', productId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProductStatus(
  productId: string,
  status: ProductStatus,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('products').update({ status }).eq('id', productId);

  if (error) {
    throw error;
  }
}

export async function deleteProductImages(
  images: Pick<ProductImage, 'id' | 'storage_path'>[],
): Promise<void> {
  if (images.length === 0) {
    return;
  }

  const supabase = createClient();
  const storagePaths = images.map((image) => image.storage_path);

  await supabase.storage.from(PRODUCT_BUCKET).remove(storagePaths);
  await supabase
    .from('product_images')
    .delete()
    .in('id', images.map((image) => image.id));
}

export async function removeProductImageFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  const supabase = createClient();
  await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
}

export async function uploadProductImages(
  userId: string,
  productId: string,
  files: File[],
): Promise<UploadedImage[]> {
  const supabase = createClient();
  const uploaded: UploadedImage[] = [];

  for (const [index, file] of files.entries()) {
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const fileName = `${index}-${crypto.randomUUID()}.${extension}`;
    const path = `${userId}/${productId}/${fileName}`;

    const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw Object.assign(error, { uploaded });
    }

    uploaded.push({
      path,
      sortOrder: index,
    });
  }

  return uploaded;
}

export async function createProductImages(
  productId: string,
  images: UploadedImage[],
): Promise<ProductImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_images')
    .insert(
      images.map((image) => ({
        product_id: productId,
        storage_path: image.path,
        sort_order: image.sortOrder,
      })),
    )
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}

export async function cleanupProductUpload(
  productId: string,
  uploadedPaths: string[],
): Promise<void> {
  const supabase = createClient();

  if (uploadedPaths.length > 0) {
    await supabase.storage.from(PRODUCT_BUCKET).remove(uploadedPaths);
  }

  await supabase.from('product_images').delete().eq('product_id', productId);
  await supabase.from('products').delete().eq('id', productId);
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = createClient();
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, title, price, status')
    .order('created_at', { ascending: false });

  if (productsError || !products || products.length === 0) {
    return [];
  }

  const productIds = products.map((product: Pick<Product, 'id'>) => product.id);

  const [
    { data: images, error: imagesError },
    { data: likes, error: likesError },
    { data: comments, error: commentsError },
  ] = await Promise.all([
    supabase
      .from('product_images')
      .select('product_id, storage_path, sort_order')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true }),
    supabase.from('likes').select('product_id').in('product_id', productIds),
    supabase.from('comments').select('product_id').in('product_id', productIds),
  ]);

  if (imagesError) {
    console.error('Failed to load product images', imagesError);
  }
  if (likesError) {
    console.error('Failed to load product likes', likesError);
  }
  if (commentsError) {
    console.error('Failed to load product comments', commentsError);
  }

  type ImageRow = Pick<ProductImage, 'product_id' | 'storage_path'>;
  type LikeRow = { product_id: string };
  type CommentRow = { product_id: string };

  return products.map((product: Pick<Product, 'id' | 'title' | 'price' | 'status'>) => {
    const thumbnailPath = (images as ImageRow[] | null)?.find(
      (image) => image.product_id === product.id,
    )?.storage_path;
    const likeCount =
      (likes as LikeRow[] | null)?.filter((like) => like.product_id === product.id).length ?? 0;
    const commentCount =
      (comments as CommentRow[] | null)?.filter((comment) => comment.product_id === product.id)
        .length ?? 0;

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      status: product.status,
      likes: likeCount,
      comments: commentCount,
      thumbnailUrl: thumbnailPath ? getProductImageUrl(thumbnailPath) : null,
    };
  });
}

async function toProductSummaries(
  productRows: Pick<Product, 'id' | 'title' | 'price' | 'condition' | 'status'>[],
): Promise<ProductSummary[]> {
  if (productRows.length === 0) {
    return [];
  }

  const supabase = createClient();
  const productIds = productRows.map((product) => product.id);

  const [
    { data: images, error: imagesError },
    { data: likes, error: likesError },
    { data: comments, error: commentsError },
  ] = await Promise.all([
    supabase
      .from('product_images')
      .select('product_id, storage_path, sort_order')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true }),
    supabase.from('likes').select('product_id').in('product_id', productIds),
    supabase.from('comments').select('product_id').in('product_id', productIds),
  ]);

  if (imagesError) {
    console.error('Failed to load product images', imagesError);
  }
  if (likesError) {
    console.error('Failed to load product likes', likesError);
  }
  if (commentsError) {
    console.error('Failed to load product comments', commentsError);
  }

  type ImageRow = Pick<ProductImage, 'product_id' | 'storage_path'>;
  type LikeRow = { product_id: string };
  type CommentRow = { product_id: string };

  return productRows.map((product) => {
    const thumbnailPath = (images as ImageRow[] | null)?.find(
      (image) => image.product_id === product.id,
    )?.storage_path;
    const likeCount =
      (likes as LikeRow[] | null)?.filter((like) => like.product_id === product.id).length ?? 0;
    const commentCount =
      (comments as CommentRow[] | null)?.filter((comment) => comment.product_id === product.id)
        .length ?? 0;

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      status: product.status,
      condition: product.condition,
      likes: likeCount,
      comments: commentCount,
      thumbnailUrl: thumbnailPath ? getProductImageUrl(thumbnailPath) : null,
    };
  });
}

export async function getProductsByUser(userId: string): Promise<ProductSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, condition, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return toProductSummaries(data);
}

export async function getLikedProducts(userId: string): Promise<ProductSummary[]> {
  const supabase = createClient();
  const { data: likeRows, error: likeError } = await supabase
    .from('likes')
    .select('product_id')
    .eq('user_id', userId);

  if (likeError || !likeRows || likeRows.length === 0) {
    return [];
  }

  const productIds = likeRows.map((row: { product_id: string }) => row.product_id);

  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, condition, status')
    .in('id', productIds);

  if (error || !data) {
    return [];
  }

  return toProductSummaries(data);
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = createClient();

  const { data: images } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', productId);

  const storagePaths = (images as Pick<ProductImage, 'storage_path'>[] | null)?.map(
    (image) => image.storage_path,
  ) ?? [];

  if (storagePaths.length > 0) {
    await supabase.storage.from(PRODUCT_BUCKET).remove(storagePaths);
  }

  await supabase.from('product_images').delete().eq('product_id', productId);
  await supabase.from('products').delete().eq('id', productId);
}

export async function getProductDetail(
  productId: string,
): Promise<ProductDetail | null> {
  const supabase = createClient();
  const [{ data: product, error: productError }, { data: images, error: imagesError }] =
    await Promise.all([
      supabase.from('products').select('*').eq('id', productId).single(),
      supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true }),
    ]);

  if (productError || imagesError || !product) {
    return null;
  }

  return {
    product,
    images: images ?? [],
  };
}
