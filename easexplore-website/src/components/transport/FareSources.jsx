import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { LAST_CHECKED, SOURCES } from '@/config/fares';
import { formatDate } from '@/utils/fares';

export default function FareSources() {
  return (
    <Card as="section" aria-labelledby="sources-title" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-high text-primary">
          <Icon name="fact_check" />
        </span>
        <h2 id="sources-title" className="text-headline-sm text-on-surface">
          Where these numbers come from
        </h2>
      </div>

      <p className="text-body-md text-on-surface-variant">
        Fares were last checked on <strong className="font-semibold text-on-surface">{formatDate(LAST_CHECKED)}</strong>.
        We could not find an official online page for the September 2026 auto-rickshaw tariff, so those figures come
        from news reports. Fares change, so if there is a dispute, the meter and the RTO&rsquo;s official tariff
        decide, not this page.
      </p>

      <ul className="grid gap-x-8 gap-y-3 text-body-sm sm:grid-cols-2">
        {SOURCES.map((source) => (
          <li key={source.url} className="flex flex-col">
            <span className="text-on-surface-variant">{source.topic}</span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary underline"
            >
              {source.name}
              <Icon name="open_in_new" size={14} />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
