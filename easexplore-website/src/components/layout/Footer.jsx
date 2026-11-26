import { Link } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { MAIN_NAV } from '@/config/routes';
import { FOOTER_TOPICS, SITE } from '@/config/site';

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-space-sm">
      <h2 className="text-label-lg font-bold uppercase tracking-wider text-on-surface">{title}</h2>
      <ul className="flex flex-col gap-space-sm text-body-sm text-on-surface-variant">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to ?? link.path} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-space-xl bg-surface-container-low print:hidden">
      <Container className="py-space-xl">
        <div className="grid grid-cols-1 gap-space-xl pb-space-lg md:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-space-md lg:col-span-2">
            <Logo edition="Pune City Guide" showTagline={false} />
            <p className="max-w-sm text-body-md text-on-surface-variant">{SITE.description}</p>
          </div>

          <FooterColumn title="Explore" links={MAIN_NAV} />
          <FooterColumn title="Transit & heritage" links={FOOTER_TOPICS} />

          <div className="flex flex-col gap-space-sm">
            <h2 className="text-label-lg font-bold uppercase tracking-wider text-on-surface">Get EaseXplore</h2>
            <p className="text-body-sm text-on-surface-variant">
              Mobile apps for Android and iOS are coming soon. For now, use the website on your phone.
            </p>
            <div className="flex flex-col gap-space-sm pt-space-xs">
              <Button variant="tonal" size="sm" icon="download" disabled fullWidth>
                App Store · coming soon
              </Button>
              <Button variant="tonal" size="sm" icon="shop" disabled fullWidth>
                Google Play · coming soon
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-md border-t border-outline-variant/40 pt-space-lg text-body-sm text-on-surface-variant sm:flex-row">
          <p className="flex items-center gap-space-xs">
            <Icon name="location_on" size={18} className="text-primary" />
            <span>Handcrafted with pride in {SITE.location}</span>
          </p>
          <p>
            © {year} {SITE.company}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
