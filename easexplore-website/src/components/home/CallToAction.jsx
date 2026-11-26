import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { ROUTES } from '@/config/routes';

export default function CallToAction() {
  return (
    <section className="bg-surface-container py-16" aria-labelledby="cta-title">
      <Container>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-container to-secondary p-8 text-center text-on-primary shadow-2xl sm:p-12">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-label-sm font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              Experience Pune seamlessly
            </span>
            <h2
              id="cta-title"
              className="mb-4 font-display text-3xl font-bold leading-tight tracking-wide text-white sm:text-5xl"
            >
              Ready to explore Pune like a seasoned Punekar?
            </h2>
            <p className="mb-8 max-w-xl text-body-md text-white/90">
              Plan a day, compare fares and find the crispiest misal pav without signing up. Log in when you want
              to save your plans and budget.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button to={ROUTES.itinerary.path} variant="light" size="lg">
                Plan smart itinerary
              </Button>
              <Button to={ROUTES.transport.path} variant="glass" size="lg">
                Transit finder & meter
              </Button>
              <Button to={ROUTES.recommendations.path} variant="glass" size="lg">
                Famous food trails
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
