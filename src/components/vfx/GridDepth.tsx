'use client';

export function GridDepth() {
  return (
    <div className="vfx-grid-container" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        style={{ opacity: 0.5 }}
      >
        <defs>
          <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(212, 175, 55, 0.15)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0.05)" />
          </linearGradient>
        </defs>
        <g stroke="url(#grid-fade)" strokeWidth="0.5" fill="none">
          {Array.from({ length: 20 }, (_, i) => {
            const x = (i / 19) * 1200;
            return (
              <line key={`v-${i}`} x1={x} y1="0" x2={600} y2="400" />
            );
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const y = 100 + (i / 11) * 300;
            const spread = (y / 400) * 600;
            return (
              <line key={`h-${i}`} x1={600 - spread} y1={y} x2={600 + spread} y2={y} />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
