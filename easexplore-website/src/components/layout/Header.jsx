import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { MAIN_NAV, ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';

function displayName(user) {
  return user.user_metadata?.full_name || user.email || 'Account';
}

/** Shows "Log in" when logged out, or the person's name and "Log out" when logged in. */
function AccountActions() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <span className="h-10 w-24 animate-pulse rounded-full bg-surface-container" aria-hidden="true" />;
  }

  if (!user) {
    return <Button to={ROUTES.login.path}>Log in</Button>;
  }

  const name = displayName(user);

  return (
    <>
      <Link
        to={ROUTES.dashboard.path}
        title={name}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-label-lg text-on-surface transition-colors hover:bg-surface-container"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-label-lg text-on-primary"
          aria-hidden="true"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[10rem] truncate">{name}</span>
      </Link>
      <Button variant="tonal" onClick={() => signOut().catch((error) => console.error('Log out failed', error))}>
        Log out
      </Button>
    </>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 print:hidden bg-surface-container-lowest/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Logo />

        {/* Full navigation shows from 1280px wide; narrower screens use the menu button. */}
        <nav aria-label="Main" className="hidden items-center gap-space-lg xl:flex">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.home.path}
              className={({ isActive }) =>
                `border-b-2 py-1 text-label-lg transition-colors ${
                  isActive
                    ? 'border-primary font-bold text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 xl:flex">
            <AccountActions />
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </Container>

      {open && (
        <div id="mobile-menu" className="border-t border-outline-variant/40 bg-surface-container-lowest xl:hidden">
          <Container className="flex flex-col gap-3 py-4">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {MAIN_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === ROUTES.home.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-title-md transition-colors ${
                      isActive
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'text-on-surface hover:bg-surface-container'
                    }`
                  }
                >
                  <Icon name={item.icon} size={22} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant/40 pt-4">
              <AccountActions />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
