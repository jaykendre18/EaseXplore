import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import Photo from '@/components/ui/Photo';
import SectionHeading from '@/components/ui/SectionHeading';
import { LANDMARKS, LANDMARK_FILTERS } from '@/data/home';

const TONE_TEXT = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
};

export default function LandmarkGallery() {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? LANDMARKS : LANDMARKS.filter((item) => item.category === filter);

  return (
    <section className="py-16" aria-labelledby="gallery-title">
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            id="gallery-title"
            eyebrow="Pune visual directory"
            title="Iconic landmarks & rapid transit"
          />
          <div role="group" aria-label="Filter highlights" className="flex flex-wrap items-center gap-2">
            {LANDMARK_FILTERS.map((item) => (
              <Chip key={item.id} selected={filter === item.id} onClick={() => setFilter(item.id)}>
                {item.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Announces filter results to screen reader users */}
        <p className="sr-only" role="status">
          Showing {visible.length} {visible.length === 1 ? 'highlight' : 'highlights'}
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <Card
              key={item.id}
              as="article"
              padding="none"
              hoverable
              className="group flex flex-col overflow-hidden shadow-md hover:shadow-xl"
            >
              <div className="relative h-60 overflow-hidden">
                <Photo
                  src={item.image}
                  alt={item.alt}
                  icon={item.icon}
                  imgClassName="transition-transform duration-500 group-hover:scale-105"
                  className="h-full w-full"
                />
                <span
                  className={`absolute left-4 top-4 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-label-sm font-bold uppercase tracking-wider backdrop-blur-md ${TONE_TEXT[item.tone]}`}
                >
                  {item.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className={`mb-1 text-label-sm font-semibold ${TONE_TEXT[item.tone]}`}>{item.meta}</p>
                  <h3 className="mb-2 text-headline-md text-on-surface">{item.title}</h3>
                  <p className="mb-4 text-body-sm leading-relaxed text-on-surface-variant">{item.text}</p>
                </div>
                <div className="flex items-center justify-end border-t border-surface-container-high pt-4">
                  <Link
                    to={item.to}
                    className={`inline-flex items-center gap-1 text-label-md font-bold hover:underline ${TONE_TEXT[item.tone]}`}
                  >
                    {item.cta}
                    <Icon name="chevron_right" size={16} />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
