const PADDING = {
  none: '',
  md: 'p-5',
  lg: 'p-6 lg:p-8',
};

/** White rounded surface. Use `as="article"` (or any tag) to change the element. */
export default function Card({
  as: Tag = 'div',
  padding = 'lg',
  hoverable = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`rounded-3xl bg-surface-container-lowest shadow-sm ${PADDING[padding]} ${
        hoverable ? 'transition-shadow hover:shadow-md' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
