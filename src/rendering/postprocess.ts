/**
 * postprocess.ts — Post-Processing Effects
 * Vignette, time-of-day tinting, cartel barricades.
 */

export const POSTPROCESS_JS = `
// ============================================================
// POST-PROCESSING
// ============================================================

function renderPostProcess(ctx, env) {
  const isNight = env.isNight;
  const isDusk = env.isDusk;

  // Cartel barricades
  if (env.isCartelBase) {
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * (W / 2)) + W / 4;
      const y = Math.floor(Math.random() * (H / 2)) + H / 4;
      ctx.fillStyle = '#4a4336'; ctx.fillRect(x, y, 30, 8);
      ctx.fillStyle = '#3b352b'; ctx.fillRect(x + 2, y - 6, 26, 6);
    }
  }

  // Vignette
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H / 3, W / 2, H / 2, W * 0.9);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // Time-of-day tint
  if (isNight) {
    ctx.fillStyle = 'rgba(6, 12, 24, 0.4)';
    ctx.fillRect(0, 0, W, H);
  } else if (isDusk) {
    ctx.fillStyle = 'rgba(201, 164, 68, 0.2)';
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = 'rgba(139, 43, 34, 0.08)';
    ctx.fillRect(0, 0, W, H);
  }
}
`;
