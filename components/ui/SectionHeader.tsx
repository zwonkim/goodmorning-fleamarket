import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{title}</h1>
      {subtitle ? <p className="max-w-2xl text-base text-text-secondary">{subtitle}</p> : null}
    </div>
  );
}
