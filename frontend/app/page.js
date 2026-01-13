'use client';

import { Suspense } from 'react';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Metrics from '@/components/sections/Metrics';
import Partners from '@/components/sections/Partners';
import Advertisers from '@/components/sections/Advertisers';
import ContactForm from '@/components/sections/ContactForm';
import Team from '@/components/sections/Team';
import Conferences from '@/components/sections/Conferences';
import Testimonials from '@/components/sections/Testimonials';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/layout/Navbar';

// Force dynamic rendering to avoid useSearchParams prerendering issues
export const dynamic = 'force-dynamic';

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
