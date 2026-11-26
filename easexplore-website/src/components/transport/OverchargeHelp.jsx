import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { RTO_CONTACT } from '@/config/fares';

const STEPS = [
  'Ask the driver to start the meter before you set off.',
  'Note the vehicle number (MH-12 for Pune, MH-14 for Pimpri-Chinchwad), the time and the place. Take a photo of the meter.',
  'Report it to the RTO with those details.',
];

export default function OverchargeHelp() {
  return (
    <Card as="aside" aria-labelledby="overcharge-title" className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-fixed text-on-secondary-fixed">
          <Icon name="shield" />
        </span>
        <h3 id="overcharge-title" className="text-headline-sm text-on-surface">
          Charged more than the meter?
        </h3>
      </div>

      <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-md text-on-surface-variant marker:font-bold marker:text-primary">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Button
          href={`https://wa.me/91${RTO_CONTACT.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="tonal"
          icon="chat"
        >
          WhatsApp the RTO
        </Button>
        <Button href={`tel:${RTO_CONTACT.phone.replace(/-/g, '')}`} variant="tonal" icon="call">
          Call {RTO_CONTACT.phone}
        </Button>
        <Button href={`mailto:${RTO_CONTACT.email}`} variant="tonal" icon="mail">
          Email
        </Button>
      </div>

      <p className="text-body-sm text-on-surface-variant">
        If you feel unsafe, leave first and call 112. Contact details were taken from a local news site in
        September 2026, so please{' '}
        <a
          className="font-semibold text-primary underline"
          href={RTO_CONTACT.officesUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          confirm them on the official RTO page
        </a>
        .
      </p>
    </Card>
  );
}
