import { ROUTES } from '@/config/routes';

// Change wording here and it updates everywhere (header, footer, page titles).
export const SITE = {
  name: 'EaseXplore',
  edition: 'Pune Edition',
  tagline: 'Hyper-Local Transit & Discovery',
  description:
    'Multimodal navigation, food heritage discovery and a smart budget companion, built for the vibrant soul of Pune.',
  company: 'EaseXplore Technologies Private Limited',
  location: 'Shivajinagar • Pune, Maharashtra',
};

// Second column of the footer. Each topic links to the page that covers it.
export const FOOTER_TOPICS = [
  { label: 'Pune Metro Aqua & Purple Lines', to: ROUTES.transport.path },
  { label: 'PMPML bus information', to: ROUTES.transport.path },
  { label: 'Auto-rickshaw fare calculator', to: ROUTES.transport.path },
  { label: 'Historic Peth heritage walks', to: ROUTES.itinerary.path },
  { label: 'Misal and Irani cafe trail', to: ROUTES.recommendations.path },
];
