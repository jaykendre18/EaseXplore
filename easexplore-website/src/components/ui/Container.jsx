/** Centres content and applies the site-wide side margins (max width 1280px). */
export default function Container({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`mx-auto w-full max-w-7xl px-6 lg:px-12 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
