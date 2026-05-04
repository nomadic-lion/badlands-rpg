/**
 * postprocess.ts — Post-Processing Effects
 * High-res vignette, region-specific shading (Day, Afternoon, Dark).
 */

export const POSTPROCESS_JS = `
// ============================================================
// POST-PROCESSING — Regional Shading
// ============================================================

function renderPostProcess(ctx, env) {
  const loc = env.locationId;
  const isCity = loc.includes('la_') || loc.includes('vegas');
  const isBeach = loc.includes('venice');
  const isMichoacan = loc.includes('michoacan');

  // Cartel barricades
  if (env.isCartelBase) {
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * (W / 2)) + W / 4;
      const y = Math.floor(Math.random() * (H / 2)) + H / 4;
      ctx.fillStyle = '#4a4336'; ctx.fillRect(x, y, 30, 8);
      ctx.fillStyle = '#3b352b'; ctx.fillRect(x + 2, y - 6, 26, 6);
    }
  }

  // Deep Vignette for AAA feel
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H / 3, W / 2, H / 2, W * 0.9);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // Region-Specific Shade
  if (isMichoacan) {
    // Dark, gritty, scary shade
    ctx.fillStyle = 'rgba(6, 12, 24, 0.5)';
    ctx.fillRect(0, 0, W, H);
  } else if (isCity || isBeach) {
    // Early Evening / Golden Hour Dusk - Darker for window light pop
    ctx.fillStyle = 'rgba(12, 18, 38, 0.45)'; // Deep evening blue/indigo
    ctx.fillRect(0, 0, W, H);
    
    // Slight warm sunset horizon glow
    const sunset = ctx.createLinearGradient(0, 0, 0, H);
    sunset.addColorStop(0, 'rgba(201, 164, 68, 0.2)');
    sunset.addColorStop(0.4, 'rgba(0,0,0,0)');
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Default Day shade - slightly dusty/gritty
    ctx.fillStyle = 'rgba(139, 43, 34, 0.08)';
    ctx.fillRect(0, 0, W, H);
  }
}
`;
