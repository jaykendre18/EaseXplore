/**
 * Material Symbols icon. Browse names at https://fonts.google.com/icons
 * Icons are decorative by default. Pass `label` when an icon stands alone
 * and needs a text description for screen readers.
 */
export default function Icon({ name, size = 24, filled = false, label, className = '' }) {
  const style = { fontSize: size };
  if (filled) {
    style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
  }

  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' };

  return (
    <span className={`material-symbols-outlined ${className}`} style={style} {...a11y}>
      {name}
    </span>
  );
}
