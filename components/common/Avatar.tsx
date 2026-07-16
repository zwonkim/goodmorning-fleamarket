'use client';

import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string | null;
  nickname: string;
  size?: AvatarSize;
  className?: string;
}

const containerSizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
};

const fallbackIconSizeStyles: Record<AvatarSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function Avatar({ src, nickname, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream',
        containerSizeStyles[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <img
          src="/assets/mascot/sun_12_thumbs.svg"
          alt={nickname}
          className={fallbackIconSizeStyles[size]}
        />
      )}
    </div>
  );
}
