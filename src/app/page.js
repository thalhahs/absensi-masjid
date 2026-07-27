'use client';

import dynamic from 'next/dynamic';

const MosqueApp = dynamic(() => import('@/components/MosqueApp'), {
  ssr: false,
});

export default function Home() {
  return <MosqueApp />;
}
