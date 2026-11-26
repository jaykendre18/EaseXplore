import Icon from '@/components/ui/Icon';

const TONES = {
  error: { box: 'bg-error-container text-on-error-container', icon: 'error', role: 'alert' },
  success: { box: 'bg-primary-fixed text-on-primary-fixed', icon: 'check_circle', role: 'status' },
  info: { box: 'bg-surface-container text-on-surface', icon: 'info', role: 'status' },
};

/** Message box. Errors are announced immediately by screen readers; the others politely. */
export default function Alert({ tone = 'info', title, children, className = '' }) {
  const { box, icon, role } = TONES[tone];

  return (
    <div role={role} className={`flex items-start gap-3 rounded-2xl p-4 text-body-md ${box} ${className}`}>
      <Icon name={icon} size={20} className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        {title && <p className="text-label-lg font-bold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
