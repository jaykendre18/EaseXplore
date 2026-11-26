# EaseXplore

Local Pune travel companion: compare metro, bus and auto fares, plan your day, track your budget and find local food and stays.

**Stack:** React 18, Vite, Tailwind CSS 3, React Router 6, Supabase.

## Run it locally

You need Node 18 or newer.

```bash
npm install
npm run dev
```

The app opens at http://localhost:5173. To make a production build, run `npm run build`. The output goes to `dist/`.

## Connect Supabase (needed for login)

The site runs without Supabase, but login stays off. Follow **SUPABASE_SETUP.md** for the step-by-step guide.

In short: create a free project at https://supabase.com, copy `.env.example` to `.env`, paste in your Project URL and publishable key, and restart `npm run dev`. Never put the `secret` or `service_role` key in this project. `.env` is already listed in `.gitignore`.

**Before launch:** Supabase's built-in email only reaches your own team members. Connect a custom email sender (SMTP) or customers will not receive confirmation and password-reset emails. Details are in SUPABASE_SETUP.md.

## Project structure

```
public/              Static files (favicon)
  images/            Your photos. See the README.txt inside for the exact file names
src/
  components/
    ui/              Reusable pieces: Button, Badge, Card, Chip, TextField, Icon, Photo, Container, SectionHeading
    layout/          Header, Footer, Logo and the page Layout
    home/            Sections of the Home page
    auth/            PasswordField and ProtectedRoute (login guard)
    transport/       Fare comparison, auto meter calculator, metro and bus guides
    itinerary/       Planner form, day timeline, summary, saved plans
    budget/          Budget summary, expense form and list, category chart, bill splitter
    recommendations/ Search and filters, place cards, favourite hearts, trails, where-to-stay guides
  config/            routes.js (pages and nav), site.js (name, tagline, footer text),
                     fares.js (ALL fare rules, dates, contacts and sources),
                     itinerary.js (vibes, time slots, budget limits, meal times),
                     budget.js (expense categories, limits, quick-add buttons),
                     recommendations.js (food filters, favourites limit)
  context/           AuthContext (who is logged in), BudgetContext (expenses and daily budget)
                     and FavouritesContext (favourite places)
  data/              Page content. home.js = Home wording; places.js = the place catalogue (used by the
                     planner AND the Food page); recommendations.js = areas, food trails, stay guides
  pages/             One file per page
  services/          All API calls. supabase.js is the single connection; auth.js has sign up, log in, reset
  utils/             Small helpers: form validation and fare calculations
supabase/            Database setup files (run once in the Supabase SQL Editor)
tests/               Automated tests for fares, the itinerary planner and the budget maths (npm test)
start-site.bat       Windows: double-click to start the site
  App.jsx            Router
  index.css          Tailwind layers and base styles
tailwind.config.js   Design tokens (colours, type scale, spacing)
```

Import from `src` with the `@` alias, for example `import Button from '@/components/ui/Button'`.

## Updating fares

All fare rules live in **`src/config/fares.js`**: auto-rickshaw tariff, PMPML fares and passes, the Pune Metro fare chart, RTO contacts, and the list of sources shown on the Transit page.

When a fare changes:
1. Edit the numbers in `src/config/fares.js`.
2. Update `LAST_CHECKED` to today's date.
3. Run `npm test`. The tests check the calculator against published example fares, so a wrong edit shows up immediately. If a number really changed, update the expected values in `tests/fares.test.js` as well.

## Before launch: confirm these fares and contacts

Items marked `CONFIRM` in `src/config/fares.js` came from a single news source. Check them against an official page:
- Auto-rickshaw **night, waiting and luggage** rules (the Rs 30 first 1.5 km and Rs 20 per km are confirmed by several news outlets, but no official page was found online)
- **RTO complaint contacts** (WhatsApp, phone, email)
- **Pune Metro fare chart** and discounts (sources disagree; the table used is the best supported one)
- **Planner place details** (`src/data/places.js`): the `spend` estimates, business names (for example "Bedekar Tea Stall"), which places close in the afternoon, and the approximate coordinates
- **Run `supabase/001_itineraries.sql`, `002_budget.sql` and `003_favourites.sql`** in your live Supabase project (see SUPABASE_SETUP.md, Parts 6, 7 and 8)
- **Food & Stays content** (`src/data/places.js`, `src/data/recommendations.js`): the dishes, tips and area descriptions, and the Metro station notes in the stay guides. Check they are still accurate
- **PMPML fares beyond 15 km** (not included, because they were not confirmed)

## Adding or editing places for the planner

Open **`src/data/places.js`**. Each place has a comment block at the top explaining every field. The important ones:
- `afternoon`: `'open'` (open through the afternoon) or `'break'` (likely closed 1 PM to 4 PM). The planner never schedules a `'break'` place in that window.
- `from` / `to`: a cautious daily window the planner uses to avoid silly times. These are **not** official hours and are never shown to visitors.
- `spend`: a rough per-person estimate in rupees.

After editing, run `npm test`. The tests check every combination of vibe, time slot, budget and group size against the planner's rules.

## How the budget works

- Money is stored and calculated in **paise** (100 paise = Rs 1) as whole numbers, so there are no decimal rounding errors. Only the screen shows rupees.
- **Logged in:** expenses and the daily budget are saved to the person's account.
- **Not logged in:** the page works, but everything is kept in memory only and is lost on refresh. A notice on the page says so.
- To change categories, edit `src/config/budget.js` **and** the category list in `supabase/002_budget.sql`, because the database rejects unknown categories.
- The Smart Itinerary starts from the person's daily budget (rounded down to the planner's step, kept inside its range). If they move the planner's budget slider, their choice wins, and a button offers to switch back.
- The bill splitter divides a bill equally and produces text to copy or share on WhatsApp. It does not move money or create payment links.

## How Food & Stays works

- **Food spots** are the places in `src/data/places.js` that have a `signature` dish. The planner uses the same list, so the two always agree. To add a food place, add it there (see "Adding or editing places for the planner").
- **Search and filters** (area, good for, price, open through the afternoon, saved) combine, and every word in the search must match. The logic is in `src/utils/recommendations.js` and is tested.
- **Favourites:** logged-in people save them to their account; guests can try the hearts but nothing is kept after a refresh.
- **Food trails** (`TRAILS` in `src/data/recommendations.js`) open the Smart Itinerary with a vibe, time slot and up to 3 places already chosen. `npm test` checks that every trail still builds a plan that includes all its places, so a change to the catalogue that breaks a trail is caught.
- **Where to stay** is a set of area guides with a Google Maps search for each. It deliberately does not list individual hotels, prices or ratings, because those cannot be kept accurate. To list real stays later, add them in a new data file with details you have verified yourself.
- Any page can open the planner with `/itinerary?pins=place-id` (up to 3 comma-separated ids), `&vibe=food` and `&window=full`.
- Place photos go in `public/images/places/` (see the README.txt inside).

## Design tokens

Colours, spacing and type sizes live in `tailwind.config.js`. Use token names in markup, such as `bg-primary`, `text-on-surface-variant` and `text-headline-md`, instead of raw hex values or pixel sizes.

## Build progress

- [x] Step 1: Foundation (setup, routing, design tokens)
- [x] Step 2: Shared UI and services (header, footer, components, Supabase connection)
- [x] Step 3: Home
- [x] Step 4: Login, auth and Dashboard
- [x] Step 5: Transport
- [x] Step 6: Itinerary
- [x] Step 7: Budget
- [x] Step 8: Recommendations (Food & Stays)
- [ ] Step 9: Polish and handover
