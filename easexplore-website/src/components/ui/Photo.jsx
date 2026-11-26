import { useState } from 'react';
import Icon from '@/components/ui/Icon';

const PLACEHOLDER_TONES = {
  light: 'bg-gradient-to-br from-primary-fixed via-surface-container-high to-secondary-fixed text-primary',
  dark: 'bg-gradient-to-br from-primary-container via-primary to-inverse-surface text-on-primary-container',
};

/**
 * Image that falls back to a tidy placeholder panel when the file is missing.
 * Drop the real photo into `public/images/` with the expected file name and it
 * appears automatically, with no code change.
 *
 * `className` is applied to both the image and the placeholder, so size and
 * position it from the outside (for example "absolute inset-0" or "h-full w-full").
 */
export default function Photo({
  src,
  alt,
  icon = 'image',
  tone = 'light',
  priority = false,
  className = '',
  imgClassName = '',
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center ${PLACEHOLDER_TONES[tone]} ${className}`}
      >
        <Icon name={icon} size={56} className="opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${imgClassName} ${className}`}
    />
  );
}
