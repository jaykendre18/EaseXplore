import Icon from '@/components/ui/Icon';

/**
 * Filter chip that can be switched on and off.
 * `selected` drives both the look and aria-pressed for screen readers.
 */
export default function Chip({ selected = false, icon, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-label-md transition-colors ${
        selected
          ? 'bg-primary text-on-primary shadow-sm'
          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
      } ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}
