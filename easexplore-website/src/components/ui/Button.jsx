import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';

const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container',
  // Dark brown text on orange keeps contrast above 4.5:1. White on this orange is only about 2.7:1.
  accent: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim',
  tonal: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
  outline: 'border border-outline-variant bg-transparent text-primary hover:bg-surface-container-low',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-container',
  // For use on photos and dark gradients.
  light: 'bg-surface-container-lowest text-primary shadow-lg hover:bg-surface-container-low',
  glass: 'border-2 border-white/40 bg-white/10 text-white hover:bg-white/20',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-label-md',
  md: 'px-5 py-2.5 text-label-lg',
  lg: 'px-6 py-3.5 text-label-lg',
};

/**
 * Pill button.
 * - Pass `to` to render a router link, `href` for an external link, otherwise a real <button>.
 * - `icon` goes before the label, `iconRight` after it.
 * - `loading` shows a spinner and blocks clicks.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  to,
  href,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-200',
    'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <Icon name="progress_activity" size={18} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={18} />
      )}
      <span>{children}</span>
      {iconRight && !loading && <Icon name={iconRight} size={18} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
