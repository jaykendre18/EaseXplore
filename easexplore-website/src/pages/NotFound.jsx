import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-space-xl text-center">
      <Icon name="explore_off" size={48} className="text-primary" />
      <h1 className="font-display text-headline-lg-mobile text-on-surface sm:text-headline-lg">
        We couldn’t find that page
      </h1>
      <p className="max-w-md text-body-lg text-on-surface-variant">
        The link may be old or mistyped. Head back to the home page to keep exploring Pune.
      </p>
      <Button to={ROUTES.home.path} size="lg">
        Go to home page
      </Button>
    </Container>
  );
}
