'use client';

import dynamic from 'next/dynamic';
import PinGate from '@/components/PinGate';

const MosqueApp = dynamic(() => import('@/components/MosqueApp'), {
  ssr: false,
});

export default function Home() {
  return (
    <PinGate>
      <MosqueApp />
    </PinGate>
  );
}
