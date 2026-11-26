import Alert from '@/components/ui/Alert';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { BUS, METRO } from '@/config/fares';
import { formatRupees } from '@/utils/fares';

// Line colours follow the real route colours. The line name is always written out too.
const LINE_COLOURS = { aqua: '#0f9aa8', purple: '#7b3fa0' };

function FareTable({ caption, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-surface-container-low">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-label-md uppercase tracking-wider text-on-surface-variant">
            <th scope="col" className="px-4 py-3 font-semibold">
              Distance
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Fare
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-outline-variant/40">
              <th scope="row" className="px-4 py-2.5 font-normal text-on-surface">
                {row.label}
              </th>
              <td className="px-4 py-2.5 text-right font-semibold text-on-surface">{row.fare}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <Icon name="check_circle" size={18} className="mt-0.5 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}

export default function PublicTransportGuide() {
  const busRows = [
    ...BUS.slabs.map((slab, index) => {
      const from = index === 0 ? 0 : BUS.slabs[index - 1].upToKm;
      return { label: index === 0 ? `Up to ${slab.upToKm} km` : `${from} to ${slab.upToKm} km`, fare: formatRupees(slab.fare) };
    }),
    { label: `Over ${BUS.coveredUpToKm} km`, fare: 'See PMPML chart' },
  ];

  return (
    <section aria-labelledby="public-title">
      <SectionHeading
        id="public-title"
        eyebrow="Public transport"
        title="Metro and bus basics"
        description="How the fares work on Pune Metro and PMPML buses."
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="metro-fares" className="flex scroll-mt-28 flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed">
              <Icon name="directions_subway" />
            </span>
            <h3 className="text-headline-sm text-on-surface">Pune Metro</h3>
          </div>

          <ul className="flex flex-col gap-2" aria-label="Metro lines">
            {METRO.lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3">
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: LINE_COLOURS[line.id] }}
                  aria-hidden="true"
                />
                <span className="text-body-md text-on-surface">
                  <strong className="font-bold">{line.name}</strong>: {line.route}, {line.stations} stations
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-body-md text-on-surface-variant">
            <Icon name="sync_alt" size={18} className="mt-0.5 shrink-0 text-primary" />
            <span>
              Change between the two lines at <strong className="font-semibold text-on-surface">{METRO.interchange}</strong>.
            </span>
          </p>

          <FareTable caption="Pune Metro fare by distance travelled" rows={METRO.slabs.map((slab) => ({ label: slab.label, fare: formatRupees(slab.fare) }))} />

          <ul className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
            <Bullet>Smart card and e-ticket users are reported to get about 10% off on weekdays and 30% off at weekends.</Bullet>
            <Bullet>Students with the One Pune Vidyarthi Pass are reported to get 30% off.</Bullet>
            <Bullet>Travelling without a valid ticket is reported to carry a {formatRupees(METRO.noTicketFine)} fine.</Bullet>
          </ul>

          <Alert tone="info">
            This chart comes from a site that mirrors the official one. For the exact fare and today&rsquo;s first and
            last trains, check the Pune Metro app.
          </Alert>
        </Card>

        <Card id="bus-fares" className="flex scroll-mt-28 flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed">
              <Icon name="directions_bus" />
            </span>
            <h3 className="text-headline-sm text-on-surface">PMPML buses</h3>
          </div>

          <p className="text-body-md text-on-surface-variant">
            Bus fares work in stages. AC and non-AC buses cost the same.
          </p>

          <FareTable caption="PMPML single ticket fare by distance" rows={busRows} />

          <ul className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
            <Bullet>
              <strong className="font-semibold text-on-surface">Day pass {formatRupees(BUS.dayPass)}</strong> for
              unlimited rides across Pune and Pimpri-Chinchwad. It pays off once your single tickets would add up to
              more than {formatRupees(BUS.dayPass)}.
            </Bullet>
            <Bullet>Monthly pass {formatRupees(BUS.monthlyPass)} for both cities. PMRDA day pass {formatRupees(BUS.dayPassPmrda)}.</Bullet>
            <Bullet>
              Passengers aged 60 and over get 50% off, including a day pass for {formatRupees(BUS.seniorDayPass)}.
            </Bullet>
          </ul>
        </Card>
      </div>
    </section>
  );
}
