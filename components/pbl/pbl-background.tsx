'use client';

export function PBLBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base dark gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-blue-900 to-slate-900" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-50/40 via-transparent to-cyan-50/40" />

      {/* Animated blobs - Top left */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />

      {/* Animated blobs - Top right */}
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

      {/* Animated blobs - Bottom left */}
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      {/* Animated blobs - Bottom right */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000" />

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(68, 68, 68, .05) 25%, rgba(68, 68, 68, .05) 26%, transparent 27%, transparent 74%, rgba(68, 68, 68, .05) 75%, rgba(68, 68, 68, .05) 76%, transparent 77%, transparent),
                            linear-gradient(90deg, transparent 24%, rgba(68, 68, 68, .05) 25%, rgba(68, 68, 68, .05) 26%, transparent 27%, transparent 74%, rgba(68, 68, 68, .05) 75%, rgba(68, 68, 68, .05) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette effect - darker edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
    </div>
  );
}
