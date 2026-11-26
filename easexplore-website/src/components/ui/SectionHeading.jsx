const EYEBROW_TONES = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
};

/** Standard heading block used at the top of each page section. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'primary',
  id,
  className = '',
}) {
  const centered = align === 'center';

  return (
    <div className={`flex flex-col gap-2 ${centered ? 'mx-auto items-center text-center' : ''} ${className}`}>
      {eyebrow && (
        <p className={`text-label-lg font-bold uppercase tracking-wider ${EYEBROW_TONES[tone]}`}>{eyebrow}</p>
      )}
      <h2 id={id} className="font-display text-3xl font-bold text-on-surface sm:text-4xl">
        {title}
      </h2>
      {description && <p className="max-w-2xl text-body-md text-on-surface-variant">{description}</p>}
    </div>
  );
}
