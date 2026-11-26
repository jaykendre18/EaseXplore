import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';

/**
 * Temporary page body for pages that are not built yet.
 * Each page drops this when its own build step is finished.
 */
export default function PagePlaceholder({ title, step, builds = [] }) {
  return (
    <Container className="py-space-xl">
      <h1 className="font-display text-display-lg-mobile text-on-surface sm:text-display-lg">{title}</h1>
      <p className="mt-2 max-w-xl text-body-lg text-on-surface-variant">
        This page is a placeholder and gets built in Step {step}.
      </p>

      {builds.length > 0 && (
        <Card className="mt-space-lg max-w-xl">
          <h2 className="text-headline-sm text-on-surface">What goes here</h2>
          <ul className="mt-3 flex flex-col gap-2 text-body-md text-on-surface-variant">
            {builds.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Icon name="check_circle" size={18} className="mt-0.5 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Container>
  );
}
