/**
 * nature.ts — Natural Feature Rendering
 * 
 * Trees (deciduous, pine), palm trees, rocks/boulders.
 * Each with shadow, layered detail, and night/day variants.
 */

export const NATURE_JS = `
// ============================================================
// NATURE RENDERER — Trees, Palms, Rocks
// ============================================================

function renderNatureEntity(ctx, n, env, rng) {
  const { rand, randInt } = rng;
  const isNight = env.isNight;
  const px = n.x * TILE;
  const py = n.y * TILE;

  if (n.type === 'tree') {
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(px + TILE, py + TILE * 1.5, TILE * 1.1, TILE * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Trunk
    ctx.fillStyle = isNight ? '#1a1208' : '#261b12';
    ctx.fillRect(px + TILE - 4, py + TILE - 2, 8, TILE + 2);
    // Trunk bark detail
    ctx.fillStyle = isNight ? '#140e06' : '#1e1510';
    ctx.fillRect(px + TILE - 2, py + TILE + 2, 2, 6);
    ctx.fillRect(px + TILE + 2, py + TILE + 6, 3, 4);
    // Canopy layers
    const base = isNight ? '#0b160a' : '#1e3816';
    const mid = isNight ? '#122610' : '#2b5220';
    const top = isNight ? '#193616' : '#3d732d';
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.arc(px + TILE, py + TILE - n.size * 4, TILE * 1.3 + n.size * 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = mid;
    ctx.beginPath(); ctx.arc(px + TILE, py + TILE - n.size * 6 - 4, TILE + n.size * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = top;
    ctx.beginPath(); ctx.arc(px + TILE - 3, py + TILE - n.size * 8 - 8, TILE * 0.7, 0, Math.PI * 2); ctx.fill();
    // Highlight on top
    ctx.fillStyle = isNight ? '#1f4018' : '#4d8a36';
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(px + TILE - 5, py + TILE - n.size * 9 - 10, TILE * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;

  } else if (n.type === 'palm') {
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(px + TILE, py + TILE * 1.5, TILE * 0.6, TILE * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Trunk (slightly curved)
    ctx.fillStyle = isNight ? '#1e1610' : '#3a2d21';
    ctx.beginPath();
    ctx.moveTo(px + TILE - 2, py + TILE * 1.5);
    ctx.lineTo(px + TILE + 2, py + TILE * 1.5);
    ctx.lineTo(px + TILE + 1, py - TILE);
    ctx.lineTo(px + TILE - 1, py - TILE);
    ctx.fill();
    // Trunk rings
    ctx.strokeStyle = isNight ? '#140e08' : '#2e2118';
    ctx.lineWidth = 1;
    for (let r = 0; r < 4; r++) {
      const ry = py + TILE * 0.5 + r * 8;
      ctx.beginPath(); ctx.moveTo(px + TILE - 2, ry); ctx.lineTo(px + TILE + 2, ry); ctx.stroke();
    }
    // Fronds
    const palmColor = isNight ? '#0f2411' : '#326639';
    const palmHighlight = isNight ? '#163818' : '#4a8a4a';
    ctx.fillStyle = palmColor;
    for (let f = 0; f < 6; f++) {
      ctx.save();
      ctx.translate(px + TILE, py - TILE);
      ctx.rotate((Math.PI * 2 / 6) * f + (n.size * 0.3));
      ctx.beginPath();
      ctx.ellipse(0, TILE * 0.6, 3, TILE * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Frond center vein
      ctx.strokeStyle = palmHighlight;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, TILE * 0.8); ctx.stroke();
      ctx.restore();
    }
    // Coconuts
    if (n.size >= 2) {
      ctx.fillStyle = isNight ? '#1a1208' : '#5c4020';
      for (let c = 0; c < 2; c++) {
        ctx.beginPath();
        ctx.arc(px + TILE - 2 + c * 4, py - TILE + 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

  } else {
    // --- ROCK/BOULDER ---
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(px + TILE, py + TILE * 1.5, TILE * 1.2, TILE * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Main rock body
    ctx.fillStyle = isNight ? '#141414' : '#2e2b29';
    ctx.beginPath();
    ctx.moveTo(px, py + TILE * 1.5);
    ctx.lineTo(px + TILE * 0.5, py + TILE - n.size * 6);
    ctx.lineTo(px + TILE * 1.5, py + TILE * 0.5 - n.size * 8);
    ctx.lineTo(px + TILE * 2, py + TILE * 1.5);
    ctx.fill();
    // Highlight face
    ctx.fillStyle = isNight ? '#1f1f1f' : '#4a4642';
    ctx.beginPath();
    ctx.moveTo(px + TILE * 0.5, py + TILE * 1.3);
    ctx.lineTo(px + TILE * 0.8, py + TILE - n.size * 4);
    ctx.lineTo(px + TILE * 1.3, py + TILE * 0.8 - n.size * 6);
    ctx.lineTo(px + TILE * 1.5, py + TILE * 1.5);
    ctx.fill();
    // Moss/lichen on mountains
    if (env.isMountains && n.size >= 2) {
      ctx.fillStyle = isNight ? '#0c1a0a' : '#3d5c2d';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(px + TILE * 0.8, py + TILE * 0.9, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }
}
`;
