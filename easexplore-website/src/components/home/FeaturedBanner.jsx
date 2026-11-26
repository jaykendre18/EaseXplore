import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import Photo from '@/components/ui/Photo';
import { FEATURED } from '@/data/home';

export default function FeaturedBanner() {
  const { image, alt, tag, kicker, title, description, planLink, transitLink } = FEATURED;

  return (
    <section className="pb-16" aria-labelledby="featured-title">
      <Container>
        <div className="group relative h-[420px] overflow-hidden rounded-3xl shadow-2xl sm:h-[480px] lg:h-[520px]">
          <Photo
            src={image}
            alt={alt}
            icon="fort"
            tone="dark"
            priority
            className="absolute inset-0"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Dark gradient keeps the white text readable on any photo */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
            aria-hidden="true"
          />

          <div className="absolute left-6 top-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/90 px-4 py-1.5 text-label-md font-bold uppercase tracking-wider text-on-surface shadow-md backdrop-blur-md">
              <Icon name="fort" size={18} className="text-primary" />
              {tag}
            </span>
          </div>

          <div className="absolute inset-x-6 bottom-6 flex flex-col items-start justify-between gap-4 sm:inset-x-8 md:flex-row md:items-end">
            <div className="max-w-xl text-white">
              <p className="mb-1 text-label-md font-semibold uppercase tracking-widest text-tertiary-fixed">
                {kicker}
              </p>
              <h2
                id="featured-title"
                className="mb-2 font-display text-2xl font-bold leading-tight tracking-wide sm:text-4xl"
              >
                {title}
              </h2>
              <p className="line-clamp-3 text-body-md text-white/90">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button to={planLink} variant="light" icon="route">
                Add to smart itinerary
              </Button>
              <Button to={transitLink} icon="near_me">
                Getting there
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
