import { forwardRef, useId } from 'react';
import Icon from '@/components/ui/Icon';

/**
 * Labelled input. The label is always visible and linked to the input,
 * and error or hint text is announced by screen readers.
 * `trailing` places a small control (for example a show/hide button) inside the right edge.
 */
const TextField = forwardRef(function TextField(
  { label, hint, error, icon, trailing, id, className = '', ...inputProps },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-label-lg text-on-surface">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-2xl bg-surface-container-low text-body-lg text-on-surface outline-none transition placeholder:text-on-surface-variant/80 focus:bg-surface-container-lowest focus:ring-2 ${
            icon ? 'pl-12' : 'pl-4'
          } ${trailing ? 'pr-12' : 'pr-4'} ${
            error ? 'ring-2 ring-error focus:ring-error' : 'ring-0 focus:ring-primary-container'
          }`}
          {...inputProps}
        />
        {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className="text-body-sm text-error">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-body-sm text-on-surface-variant">
          {hint}
        </p>
      )}
    </div>
  );
});

export default TextField;
