import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { PILLARS } from '@/data/home';

const TONES = {
  primary: { tile: 'bg-primary-fixed text-on-primary-fixed', text: 'text-primary' },
  secondary: { tile: 'bg-secondary-fixed text-on-secondary-fixed', text: 'text-secondary' },
  tertiary: { tile: 'bg-tertiary-fixed text-on-tertiary-fixed', text: 'text-tertiary' },
  neutral: { tile: 'bg-surface-container-highest text-primary', text: 'text-primary' },
};

export default function Pillars() {
  return (
    <section className="bg-surface-container-low py-12" aria-labelledby="pillars-title">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="pillars-title"
            eyebrow="Built for everyday Punekars & travellers"
            title="The 4 pillars of effortless Pune commuting"
            className="max-w-2xl"
          />
          <p className="max-w-md text-body-md text-on-surface-variant">
            Say goodbye to overpriced auto fares, missed buses and shuttered afternoon shops. Designed with real
            street wisdom.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, index) => {
            const tone = TONES[pillar.tone];
            return (
              <Card
                key={pillar.title}
                as="article"
                padding="none"
                hoverable
                className="group flex flex-col justify-between p-6"
              >
                <div>
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${tone.tile}`}
                  >
                    <Icon name={pillar.icon} />
                  </div>
                  <p className={`mb-1 text-label-sm font-bold uppercase tracking-widest ${tone.text}`}>
                    Pillar {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mb-3 text-headline-sm text-on-surface">{pillar.title}</h3>
                  <p className="text-body-sm leading-relaxed text-on-surface-variant">{pillar.text}</p>
                </div>
                <Link
                  to={pillar.to}
                  className={`mt-6 inline-flex items-center gap-1 text-label-md font-bold transition-all group-hover:gap-2 ${tone.text}`}
                >
                  {pillar.cta}
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
