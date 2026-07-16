'use client';

import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ImagePreviewItem = {
  id: string;
  file?: File;
  previewUrl: string;
};

interface ImageUploaderProps {
  disabled?: boolean;
  error?: string;
  images: ImagePreviewItem[];
  maxImages?: number;
  onAddImages: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
}

export function ImageUploader({
  disabled = false,
  error,
  images,
  maxImages = 10,
  onAddImages,
  onRemoveImage,
}: ImageUploaderProps) {
  const remainingCount = Math.max(maxImages - images.length, 0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      onAddImages(files);
    }

    event.target.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-[1rem] border border-border bg-cream"
          >
            <img
              src={image.previewUrl}
              alt={`상품 이미지 ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              disabled={disabled}
              aria-label="이미지 삭제"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-40"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {remainingCount > 0 ? (
          <label
            className={cn(
              'relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[1rem] border border-dashed border-border bg-cream/70 text-text-secondary transition hover:bg-cream',
              disabled ? 'cursor-not-allowed opacity-60' : '',
            )}
          >
            <img
              src="/assets/mascot/sun_06_camera.svg"
              alt="사진 추가"
              className="h-13 w-13"
            />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sunny text-text-primary shadow-soft">
              <Plus className="h-3 w-3" />
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={disabled}
              onChange={handleChange}
              className="hidden"
            />
          </label>
        ) : null}
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
