import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoMeterCalculator from '@/components/transport/AutoMeterCalculator';
import FareComparison from '@/components/transport/FareComparison';
import FareSources from '@/components/transport/FareSources';
import OverchargeHelp from '@/components/transport/OverchargeHelp';
import PublicTransportGuide from '@/components/transport/PublicTransportGuide';
import TripInput from '@/components/transport/TripInput';
import Badge from '@/components/ui/Badge';
import Container from '@/components/ui/Container';
import { LAST_CHECKED } from '@/config/fares';
import { formatDate, isValidDistance } from '@/utils/fares';

export default function Transport() {
  // The distance is kept as text so people can type freely ("1." or an empty box)
  // while the rest of the page only ever sees a valid number or null.
  const [searchParams] = useSearchParams();
  const [distanceText, setDistanceText] = useState(() => {
    // Links from the itinerary look like /transport?km=3.4
    const fromLink = parseFloat(searchParams.get('km'));
    return isValidDistance(fromLink) ? String(fromLink) : '5';
  });
  const parsed = parseFloat(distanceText);
  const distanceValid = isValidDistance(parsed);
  const distanceKm = distanceValid ? parsed : null;

  return (
    <>
      <Container className="flex flex-col gap-space-xl py-space-xl">
        <header className="flex flex-col gap-3">
          <Badge tone="primary" icon="fact_check" className="self-start">
            Fares checked {formatDate(LAST_CHECKED)}
          </Badge>
          <h1 className="font-display text-display-lg-mobile text-on-surface sm:text-display-lg">
            Transit Finder &amp; RTO Meter
          </h1>
          <p className="max-w-3xl text-body-lg text-on-surface-variant">
            Compare what a trip costs by auto, bus, metro and cab, and check the legal auto-rickshaw fare before you
            board.
          </p>
        </header>

        <TripInput
          distanceText={distanceText}
          onDistanceChange={setDistanceText}
          distanceValid={distanceValid}
        />
        <FareComparison distanceKm={distanceKm} />
      </Container>

      <div className="bg-surface-container-low py-12">
        <Container className="grid gap-space-xl">
          <AutoMeterCalculator distanceKm={distanceKm} />
          <OverchargeHelp />
        </Container>
      </div>

      <Container className="flex flex-col gap-space-xl py-12">
        <PublicTransportGuide />
        <FareSources />
      </Container>
    </>
  );
}
