'use client';

export function AmbientGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }} aria-hidden="true">
      <div
        className="vfx-orb vfx-orb-gold"
        style={{ width: '600px', height: '600px', top: '10%', left: '15%' }}
      />
      <div
        className="vfx-orb vfx-orb-teal"
        style={{ width: '500px', height: '500px', top: '60%', right: '10%' }}
      />
      <div
        className="vfx-orb vfx-orb-white"
        style={{ width: '400px', height: '400px', top: '30%', right: '30%' }}
      />
      <div
        className="vfx-orb vfx-orb-blue"
        style={{ width: '700px', height: '700px', bottom: '5%', left: '40%' }}
      />
    </div>
  );
}
