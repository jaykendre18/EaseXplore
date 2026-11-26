import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { VIBES, WINDOWS } from '@/config/itinerary';
import { PLACES } from '@/data/places';
import { TRAILS, trailUrl } from '@/data/recommendations';

const nameOf = (id) => PLACES.find((place) => place.id === id)?.name ?? id;

/** Ready-made trails. Each opens the Smart Itinerary with its places and time slot already chosen. */
export default function TrailCards() {
  return (
    <section id="trails" aria-labelledby="trails-title" className="scroll-mt-28">
      <SectionHeading
        id="trails-title"
        eyebrow="Ready-made trails"
        title="Food trails"
        description="Pick a trail and the Smart Itinerary builds the day around it, with timings, costs and the afternoon break worked out."
        className="mb-6"
      />
      <div className="grid gap-6 md:grid-cols-3">
        {TRAILS.map((trail) => {
          const vibe = VIBES.find((item) => item.id === trail.vibe);
          const win = WINDOWS.find((item) => item.id === trail.windowId);
          return (
            <Card key={trail.id} as="article" padding="none" hoverable className="flex flex-col gap-4 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-fixed text-on-secondary-fixed">
                <Icon name={trail.icon} />
              </span>
              <div>
                <h3 className="text-headline-sm text-on-surface">{trail.title}</h3>
                <p className="mt-1 text-body-md text-on-surface-variant">{trail.blurb}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-body-sm text-on-surface">
                {trail.pinned.map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <Icon name="place" size={16} className="shrink-0 text-primary" />
                    {nameOf(id)}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {win && <Badge tone="neutral" icon="schedule">{win.label}</Badge>}
                {vibe && <Badge tone="neutral" icon={vibe.icon}>{vibe.label}</Badge>}
              </div>
              <Button to={trailUrl(trail)} icon="route" iconRight="arrow_forward" className="mt-auto self-start">
                Plan this trail
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
