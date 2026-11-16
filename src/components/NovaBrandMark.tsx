import React, { useState, useEffect } from 'react';

interface NovaBrandMarkProps {
  className?: string;
}

/**
 * Minimalist Vietnamese Lotus & Maternal Embrace emblem
 */
export const NovaBrandMark: React.FC<NovaBrandMarkProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M16 4.5C13.6 8.4 13.6 14 16 18C18.4 14 18.4 8.4 16 4.5Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 18C11.4 16.8 7.5 13 6.2 8.2C10.5 9.1 14 12.6 16 18Z"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 18C20.6 16.8 24.5 13 25.8 8.2C21.5 9.1 18 12.6 16 18Z"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 21.5C9.7 24.4 12.8 26 16 26C19.2 26 22.3 24.4 25 21.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="16" cy="21.5" r="1.35" fill="currentColor" />
  </svg>
);

/**
 * Subtle Vietnamese hairline divider inspired by Dong Son radial balance & lotus leaf
 */
export const NovaLotusDivider: React.FC<{ label?: string; className?: string }> = ({
  label,
  className = '',
}) => (
  <div className={`flex items-center gap-3 select-none ${className}`}>
    <div className="h-px flex-1 bg-nova-border" />
    <div className="flex items-center gap-2 text-nova-taupe">
      <svg viewBox="0 0 24 12" className="w-5 h-2.5" fill="none" aria-hidden="true">
        <path
          d="M12 1.5C10.6 4.2 10.6 7.8 12 10.5C13.4 7.8 13.4 4.2 12 1.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M12 10.2C8.8 9.6 6 7.3 5 4.2C8 4.8 10.5 7 12 10.2Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M12 10.2C15.2 9.6 18 7.3 19 4.2C16 4.8 13.5 7 12 10.2Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      {label && (
        <span className="text-[11px] font-medium tracking-wide text-nova-text-muted whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
    <div className="h-px flex-1 bg-nova-border" />
  </div>
);

interface NovaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

function normalizeImageSrc(rawSrc?: string): string | undefined {
  if (!rawSrc) return rawSrc;
  if (rawSrc.startsWith('/src/assets/images/')) {
    return rawSrc.replace('/src/assets/images/', '/images/');
  }
  return rawSrc;
}

/**
 * Zero-Broken-Image resilient media wrapper with warm linen lotus fallback
 */
export const NovaImage: React.FC<NovaImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  ...rest
}) => {
  const resolvedSrc = normalizeImageSrc(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || hasError) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle || 'Hình ảnh Nova'}
        className={`flex flex-col items-center justify-center bg-nova-bg-subtle text-nova-text-muted border border-nova-border p-4 text-center ${className}`}
      >
        <NovaBrandMark className="w-8 h-8 text-nova-accent/70 mb-1.5" />
        {(fallbackTitle || alt) && (
          <span className="text-xs font-medium line-clamp-2 max-w-[16rem] opacity-85">
            {fallbackTitle || alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || ''}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};

interface NovaEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const NovaEmptyState: React.FC<NovaEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => (
  <div className="rounded-2xl bg-nova-surface border border-nova-border p-6 sm:p-8 text-center flex flex-col items-center justify-center">
    <div className="w-12 h-12 rounded-2xl bg-nova-bg-subtle text-nova-accent flex items-center justify-center mb-3">
      {icon || <NovaBrandMark className="w-6 h-6" />}
    </div>
    <h4 className="font-editorial text-base sm:text-lg font-semibold text-nova-text">
      {title}
    </h4>
    <p className="text-xs sm:text-sm text-nova-text-muted mt-1.5 max-w-md leading-relaxed">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 px-5 py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
