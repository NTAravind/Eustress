import React from 'react';
import { HeroSection, PhilosophySection, WorkshopsSection, CoachSection, GallerySection, FooterSection} from '../(clientside)/components/homeclient'
import { GetActiveWorkshops } from './actions/workshops';

// Image configuration
export const images = {
  coach: '/images/IMG-20250726-WA0056.jpg',
  training: '/images/IMG-20250901-WA0034.jpg',
  kettlebell: '/images/IMG-20250901-WA0032.jpg',
  gallery1: '/images/IMG-20250726-WA0059.jpg',
  gallery2: '/images/IMG-20250726-WA0060.jpg',
};

export default async function EustressLanding() {
  // Fetch open workshops from the server
  const workshops = await GetActiveWorkshops();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      <HeroSection />
      <PhilosophySection />
      <WorkshopsSection workshops={workshops} />
      <CoachSection image={images.coach} />
      <GallerySection images={[images.kettlebell, images.gallery1, images.gallery2, images.training]} />
      <FooterSection />
    </div>
  );
}