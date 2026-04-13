'use client';

import { PBLContent } from '@/components/pbl/pbl-content';
import { PBLBackground } from '@/components/pbl/pbl-background';

export default function PBLPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      <PBLBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        <PBLContent />
      </div>
    </main>
  );
}
