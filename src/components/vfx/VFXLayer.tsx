'use client';

import { ParticleField } from './ParticleField';
import { AmbientGlow } from './AmbientGlow';
import { GridDepth } from './GridDepth';

export function VFXLayer() {
  return (
    <>
      <ParticleField />
      <AmbientGlow />
      <GridDepth />
      <div className="vfx-vignette" aria-hidden="true" />
      <div className="vfx-light-streak" aria-hidden="true" />
      <div className="vfx-scanline" aria-hidden="true" />
    </>
  );
}
