'use client';

import { useSearchParams } from 'next/navigation';

export default function ContactFormSearchParams({
  children,
}) {
  const searchParams = useSearchParams();
  return children(searchParams);
}
