import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';

/** Brand mark plus name. Used in the header and footer. */
export default function Logo({ edition = SITE.edition, showTagline = true, className = '' }) {
  return (
    <Link
      to={ROUTES.home.path}
      className={`group flex items-center gap-3 ${className}`}
      aria-label={`${SITE.name} home`}
    >
      <img
  src="/images/logo.png"
  alt=""
  aria-hidden="true"
  className="h-9 w-9 shrink-0 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
/>
      <span className="flex flex-col leading-tight">
        <span className="flex items-center gap-2">
          <span className="text-headline-sm text-on-surface">{SITE.name}</span>
          {edition && (
            <Badge tone="secondary" uppercase className="hidden sm:inline-flex">
              {edition}
            </Badge>
          )}
        </span>
        {showTagline && (
          <span className="hidden text-label-md text-on-surface-variant sm:block">{SITE.tagline}</span>
        )}
      </span>
    </Link>
  );
}
