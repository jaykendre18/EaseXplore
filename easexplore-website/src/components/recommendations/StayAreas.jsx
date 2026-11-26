import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { STAY_AREAS, mapsSearchUrl } from '@/data/recommendations';

/** Where to stay, by area. General guidance only: no individual hotels, prices or ratings. */
export default function StayAreas() {
  return (
    <section id="stays" aria-labelledby="stays-title" className="scroll-mt-28">
      <SectionHeading
        id="stays-title"
        eyebrow="Where to stay"
        title="Choose an area first"
        description="Where you stay shapes your trip. Here is what each area is like, and how to find places to stay there."
        className="mb-6"
      />

      <Alert tone="info" title="We do not list or rate individual hotels" className="mb-6">
        Prices, quality and availability change all the time. Use the search buttons to see current options, then check
        reviews, prices and cancellation rules on the booking site before you pay.
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {STAY_AREAS.map((area) => (
          <Card key={area.id} as="article" padding="none" className="flex flex-col gap-4 p-6">
            <div className="flex flex-col items-start gap-2">
              <h3 className="text-headline-sm text-on-surface">{area.name}</h3>
              <Badge tone="tertiary" icon="thumb_up">
                {area.goodFor}
              </Badge>
            </div>
            <p className="text-body-md text-on-surface-variant">{area.feel}</p>
            <ul className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <Icon name="directions_subway" size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{area.gettingAround}</span>
              </li>
              {area.watchOut && (
                <li className="flex items-start gap-2">
                  <Icon name="info" size={16} className="mt-0.5 shrink-0 text-secondary" />
                  <span>{area.watchOut}</span>
                </li>
              )}
            </ul>
            <Button
              href={mapsSearchUrl(area.mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              icon="search"
              iconRight="open_in_new"
              className="mt-auto self-start"
              aria-label={`Search places to stay in ${area.name} on Google Maps`}
            >
              Search stays here
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
