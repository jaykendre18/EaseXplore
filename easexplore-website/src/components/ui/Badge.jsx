import Icon from '@/components/ui/Icon';

const TONES = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed',
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  neutral: 'bg-surface-container-high text-on-surface',
  error: 'bg-error-container text-on-error-container',
  inverse: 'bg-inverse-surface text-inverse-on-surface',
};

/** Small pill label, for example "Fastest", "Heritage Gem" or "Est. 1935". */
export default function Badge({ tone = 'primary', icon, uppercase = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm ${
        uppercase ? 'uppercase' : ''
      } ${TONES[tone]} ${className}`}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
