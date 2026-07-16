'use client';

import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  ErrorState,
  ImageUploader,
  Input,
  LoadingState,
  Select,
  TextArea,
} from '@/components/common';
import {
  createProductImages,
  deleteProductImages,
  getProductDetail,
  getProductImageUrl,
  removeProductImageFiles,
  updateProduct,
  uploadProductImages,
} from '@/lib/products';
import { createClient } from '@/lib/supabase/supabaseClient';
import type { ProductCondition, ProductImage, ProductStatus } from '@/types/product';

const MAX_IMAGES = 10;
const MIN_IMAGES = 1;
const DESCRIPTION_MAX_LENGTH = 500;

type FormState = {
  condition: ProductCondition | '';
  description: string;
  price: string;
  title: string;
};

type FieldErrors = Partial<Record<'images' | keyof FormState, string>>;

type EditImageItem =
  | { kind: 'existing'; id: string; storagePath: string; previewUrl: string }
  | { kind: 'new'; id: string; file: File; previewUrl: string };

export default function EditProductPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fatalError, setFatalError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalImages, setOriginalImages] = useState<ProductImage[]>([]);
  const [imageItems, setImageItems] = useState<EditImageItem[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const imageUrlsRef = useRef<string[]>([]);
  const [status, setStatus] = useState<ProductStatus>('for_sale');
  const [form, setForm] = useState<FormState>({
    condition: '',
    description: '',
    price: '',
    title: '',
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setNotFound(false);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (sessionError) {
        setFatalError('인증 정보를 확인하지 못했습니다. 다시 로그인해주세요.');
        setLoading(false);
        return;
      }

      const currentUserId = sessionData.session?.user.id ?? null;

      if (!currentUserId) {
        router.replace('/login');
        return;
      }

      const detail = await getProductDetail(productId);

      if (!mounted) {
        return;
      }

      if (!detail) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (detail.product.user_id !== currentUserId) {
        router.replace(`/products/${productId}`);
        return;
      }

      setForm({
        condition: detail.product.condition,
        description: detail.product.description,
        price: String(detail.product.price),
        title: detail.product.title,
      });
      setStatus(detail.product.status);
      setOriginalImages(detail.images);
      setImageItems(
        detail.images.map((image) => ({
          kind: 'existing',
          id: image.id,
          storagePath: image.storage_path,
          previewUrl: getProductImageUrl(image.storage_path),
        })),
      );
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [productId, router, supabase.auth]);

  useEffect(() => {
    imageUrlsRef.current = imageItems.map((image) => image.previewUrl);
  }, [imageItems]);

  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const canSubmit = useMemo(() => !loading && !isSubmitting, [loading, isSubmitting]);

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError('');
  };

  const handleAddImages = (files: File[]) => {
    setSubmitError('');
    setFieldErrors((current) => ({ ...current, images: undefined }));

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const remaining = MAX_IMAGES - imageItems.length;
    const nextFiles = imageFiles.slice(0, remaining);

    const nextItems: EditImageItem[] = nextFiles.map((file) => ({
      kind: 'new',
      file,
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      previewUrl: URL.createObjectURL(file),
    }));

    setImageItems((current) => [...current, ...nextItems]);
  };

  const handleRemoveImage = (index: number) => {
    setImageItems((current) => {
      const target = current[index];
      if (target?.kind === 'new') {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
    setFieldErrors((current) => ({ ...current, images: undefined }));
    setSubmitError('');
  };

  const validateForm = (): FieldErrors => {
    const nextErrors: FieldErrors = {};
    const priceNumber = Number(form.price);

    if (imageItems.length < MIN_IMAGES) {
      nextErrors.images = `사진을 최소 ${MIN_IMAGES}장 등록해주세요.`;
    } else if (imageItems.length > MAX_IMAGES) {
      nextErrors.images = `이미지는 최대 ${MAX_IMAGES}장까지 등록할 수 있어요.`;
    }

    if (!form.title.trim()) {
      nextErrors.title = '상품명을 입력해주세요.';
    }

    if (!form.price.trim()) {
      nextErrors.price = '가격을 입력해주세요.';
    } else if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      nextErrors.price = '가격은 0보다 큰 숫자로 입력해주세요.';
    }

    if (!form.condition) {
      nextErrors.condition = '상품 상태를 선택해주세요.';
    }

    if (!form.description.trim()) {
      nextErrors.description = '설명을 입력해주세요.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id ?? null;

    if (!userId) {
      router.replace('/login');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess('');

    const newItems = imageItems.filter(
      (item): item is Extract<EditImageItem, { kind: 'new' }> => item.kind === 'new',
    );
    let uploadedPaths: string[] = [];

    try {
      await updateProduct(productId, {
        condition: form.condition as ProductCondition,
        description: form.description.trim(),
        price: Number(form.price),
        status,
        title: form.title.trim(),
      });

      const removedImages = originalImages.filter(
        (original) =>
          !imageItems.some((item) => item.kind === 'existing' && item.id === original.id),
      );

      if (removedImages.length > 0) {
        await deleteProductImages(removedImages);
      }

      if (newItems.length > 0) {
        const remainingSortOrders = originalImages
          .filter((original) =>
            imageItems.some((item) => item.kind === 'existing' && item.id === original.id),
          )
          .map((image) => image.sort_order);
        const startOrder =
          remainingSortOrders.length > 0 ? Math.max(...remainingSortOrders) + 1 : 0;

        const uploadedImages = await uploadProductImages(
          userId,
          productId,
          newItems.map((item) => item.file),
        );
        uploadedPaths = uploadedImages.map((image) => image.path);

        await createProductImages(
          productId,
          uploadedImages.map((image, index) => ({
            ...image,
            sortOrder: startOrder + index,
          })),
        );
      }

      setSubmitSuccess('상품 정보를 수정했어요. 상세 페이지로 이동합니다.');
      router.replace(`/products/${productId}`);
    } catch (error) {
      const uploadedFromError =
        typeof error === 'object' &&
        error !== null &&
        'uploaded' in error &&
        Array.isArray(error.uploaded)
          ? error.uploaded.map((image) => image.path as string)
          : [];

      if (uploadedFromError.length > 0) {
        uploadedPaths = uploadedFromError;
      }

      if (uploadedPaths.length > 0) {
        await removeProductImageFiles(uploadedPaths);
      }

      const message =
        error instanceof Error
          ? error.message
          : '상품 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <LoadingState message="상품 정보를 불러오는 중이에요…" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <ErrorState
          title="상품을 찾을 수 없어요"
          description="삭제되었거나 존재하지 않는 상품이에요."
          actionLabel="홈으로"
          onRetry={() => router.replace('/')}
        />
      </main>
    );
  }

  if (fatalError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <ErrorState
          title="수정 화면을 열 수 없어요"
          description={fatalError}
          actionLabel="다시 시도"
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-text-primary">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">상품 수정</h1>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold">
            사진 등록 (최소 {MIN_IMAGES}장)
          </label>
          <ImageUploader
            images={imageItems}
            maxImages={MAX_IMAGES}
            disabled={isSubmitting}
            error={fieldErrors.images}
            onAddImages={handleAddImages}
            onRemoveImage={handleRemoveImage}
          />
        </div>

        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-semibold">
            제목
          </label>
          <Input
            id="title"
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            placeholder="예: 우리집 원목 사이드 테이블"
            disabled={isSubmitting}
          />
          {fieldErrors.title ? (
            <p className="mt-2 text-xs text-danger">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-semibold">
            가격
          </label>
          <div className="relative">
            <Input
              id="price"
              inputMode="numeric"
              value={form.price}
              onChange={(event) => updateForm('price', event.target.value)}
              placeholder="예: 25,000"
              disabled={isSubmitting}
              className="pr-10"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
              원
            </span>
          </div>
          {fieldErrors.price ? (
            <p className="mt-2 text-xs text-danger">{fieldErrors.price}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="condition" className="mb-2 block text-sm font-semibold">
            사용감
          </label>
          <Select
            id="condition"
            value={form.condition}
            onChange={(event) => updateForm('condition', event.target.value)}
            disabled={isSubmitting}
          >
            <option value="">사용감을 선택해주세요</option>
            <option value="new">새 상품</option>
            <option value="lightly_used">사용감 적음</option>
            <option value="used">사용감 있음</option>
          </Select>
          {fieldErrors.condition ? (
            <p className="mt-2 text-xs text-danger">{fieldErrors.condition}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold">
            설명
          </label>
          <TextArea
            id="description"
            value={form.description}
            onChange={(event) => updateForm('description', event.target.value)}
            placeholder="구매 시기, 사용감, 전달 방법 등을 적어주세요."
            disabled={isSubmitting}
            maxLength={DESCRIPTION_MAX_LENGTH}
          />
          <div className="mt-2 flex items-center justify-between">
            {fieldErrors.description ? (
              <p className="text-xs text-danger">{fieldErrors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-text-secondary">
              {form.description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
        </div>

        {submitError ? (
          <div className="rounded-[1rem] bg-danger/10 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        ) : null}

        {submitSuccess ? (
          <div className="rounded-[1rem] bg-success/10 px-4 py-3 text-sm text-success">
            {submitSuccess}
          </div>
        ) : null}

        <Button type="submit" disabled={!canSubmit} className="w-full">
          {isSubmitting ? '수정 중…' : '수정하기'}
        </Button>
      </form>
    </main>
  );
}
