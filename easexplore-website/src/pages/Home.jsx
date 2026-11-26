import CallToAction from '@/components/home/CallToAction';
import FeaturedBanner from '@/components/home/FeaturedBanner';
import HeroSearch from '@/components/home/HeroSearch';
import LandmarkGallery from '@/components/home/LandmarkGallery';
import Pillars from '@/components/home/Pillars';
import Playbook from '@/components/home/Playbook';

export default function Home() {
  return (
    <>
      <HeroSearch />
      <FeaturedBanner />
      <Pillars />
      <LandmarkGallery />
      <Playbook />
      <CallToAction />
    </>
  );
}
