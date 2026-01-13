'use client';

import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Metrics from '@/components/sections/Metrics';
import Partners from '@/components/sections/Partners';
import Advertisers from '@/components/sections/Advertisers';
import Team from '@/components/sections/Team';
import Conferences from '@/components/sections/Conferences';
import Testimonials from '@/components/sections/Testimonials';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/layout/Navbar';

// Force dynamic rendering to prevent prerendering issues with useSearchParams
export const dynamic = 'force-dynamic';

// Dynamically import ContactForm to prevent SSR issues with useSearchParams
const ContactForm = dynamicImport(() => import('@/components/sections/ContactForm'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Metrics />
        <Partners />
        <Advertisers />
        <Testimonials />
        <Conferences />
        <Team />
        <Suspense fallback={<div>Loading...</div>}>
          <ContactForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
