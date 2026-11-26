import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes';
import { SEARCH_SUGGESTIONS } from '@/data/home';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputId = useId();
  const listId = useId();

  const handleSubmit = (event) => {
    event.preventDefault();
    const place = query.trim();
    navigate(place ? `${ROUTES.itinerary.path}?query=${encodeURIComponent(place)}` : ROUTES.itinerary.path);
  };

  return (
    <section className="relative overflow-hidden pb-12 pt-10 sm:pt-14">
      {/* Soft background glows */}
      <div
        className="pointer-events-none absolute -top-24 right-10 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 top-40 h-80 w-80 rounded-full bg-secondary-fixed/30 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative flex flex-col items-center text-center">
        <h1 className="max-w-5xl font-display text-4xl font-bold leading-tight text-on-surface sm:text-5xl lg:text-7xl">
          <span lang="mr">संस्कृतीचा अभिमान, पेशव्यांची शान</span>
        </h1>
        <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">
          Plan your day, compare fares and eat like a Punekar, all in one place.
        </p>

        <form
          role="search"
          onSubmit={handleSubmit}
          className="mt-8 flex w-full max-w-3xl flex-col items-center gap-2 rounded-3xl bg-surface-container-lowest p-2.5 shadow-xl focus-within:ring-2 focus-within:ring-primary-container sm:flex-row sm:rounded-full"
        >
          <label htmlFor={inputId} className="sr-only">
            Search for a landmark or area in Pune
          </label>
          <div className="flex w-full items-center gap-3 pl-4">
            <Icon name="explore" className="text-primary" />
            <input
              id={inputId}
              list={listId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search landmarks: Shaniwar Wada, FC Road, Vetal Tekdi…"
              autoComplete="off"
              className="w-full bg-transparent py-3 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/80"
            />
            <datalist id={listId}>
              {SEARCH_SUGGESTIONS.map((place) => (
                <option key={place} value={place} />
              ))}
            </datalist>
          </div>
          <Button type="submit" size="lg" iconRight="arrow_forward" className="w-full sm:w-auto">
            Find route
          </Button>
        </form>
      </Container>
    </section>
  );
}
