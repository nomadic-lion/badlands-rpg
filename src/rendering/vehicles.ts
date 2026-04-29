/**
 * vehicles.ts — Vehicle Rendering
 * 
 * Renders wrecked/abandoned cars on streets, plus parked vehicles
 * near landmarks (pickups, SUVs, lowriders, motorcycles).
 */

export const VEHICLES_JS = `
// ============================================================
// VEHICLE RENDERER
// ============================================================

function renderWreckedCars(ctx, env, rng) {
  const { grid } = env;
  const { rand, randInt, randChoice } = rng;

  const numCars = randInt(12, 24);
  for (let c = 0; c < numCars; c++) {
    const cx = randInt(2, cols - 3);
    const cy = randInt(2, rows - 3);
    if (grid[cx][cy] !== 1) continue;

    ctx.save();
    ctx.translate(cx * TILE + TILE / 2, cy * TILE + TILE / 2);
    ctx.rotate(rand() * Math.PI * 2);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-13, -5, 26, 14);

    // Chassis
    const carColor = randChoice(['#8b2b22', '#2a241d', '#3d3228', '#426477', '#1a3322', '#4a3d1b']);
    ctx.fillStyle = carColor;
    ctx.fillRect(-12, -6, 24, 12);

    // Cabin/Windows
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(-4, -5, 10, 10);

    // Headlight (front)
    ctx.fillStyle = '#c9a444';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(10, -3, 2, 2);
    ctx.fillRect(10, 1, 2, 2);
    ctx.globalAlpha = 1.0;

    // Taillight (back)
    ctx.fillStyle = '#8b2b22';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(-12, -3, 2, 2);
    ctx.fillRect(-12, 1, 2, 2);
    ctx.globalAlpha = 1.0;

    // Tire marks / damage
    if (rand() > 0.6) {
      ctx.fillStyle = '#0a0806';
      ctx.fillRect(randInt(-10, 6), randInt(-4, 2), randInt(3, 8), 2);
    }

    ctx.restore();
  }
}

function drawParkedPickup(ctx, px, py, color, isNight, facingLeft) {
  const dir = facingLeft ? -1 : 1;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(px - 2, py + 2, 48, 18);
  // Body
  ctx.fillStyle = isNight ? darken(color) : color;
  ctx.fillRect(px, py, 46, 16);
  // Cab
  ctx.fillStyle = isNight ? '#0a0806' : '#1a1815';
  ctx.fillRect(px + (facingLeft ? 6 : 26), py + 2, 14, 12);
  // Bed
  ctx.fillStyle = darken(color);
  ctx.fillRect(px + (facingLeft ? 24 : 2), py + 2, 20, 12);
  // Wheels
  ctx.fillStyle = '#0a0806';
  ctx.fillRect(px + 6, py + 14, 8, 4);
  ctx.fillRect(px + 32, py + 14, 8, 4);
  // Headlights
  ctx.fillStyle = '#c9a444';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(px + (facingLeft ? 0 : 44), py + 3, 2, 3);
  ctx.fillRect(px + (facingLeft ? 0 : 44), py + 10, 2, 3);
  ctx.globalAlpha = 1.0;
}

function drawParkedSUV(ctx, px, py, color, isNight) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(px - 2, py + 2, 44, 20);
  ctx.fillStyle = isNight ? darken(color) : color;
  ctx.fillRect(px, py, 42, 18);
  // Windows
  ctx.fillStyle = isNight ? '#0a0806' : '#1c3040';
  ctx.fillRect(px + 8, py + 2, 10, 10);
  ctx.fillRect(px + 22, py + 2, 10, 10);
  // Wheels
  ctx.fillStyle = '#0a0806';
  ctx.fillRect(px + 4, py + 16, 8, 4);
  ctx.fillRect(px + 30, py + 16, 8, 4);
  // Chrome bumper
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(px, py + 14, 42, 2);
}

function drawMotorcycle(ctx, px, py, isNight) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(px + 10, py + 14, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Frame
  ctx.fillStyle = isNight ? '#1a1612' : '#3d3228';
  ctx.fillRect(px + 4, py + 4, 14, 6);
  // Wheels
  ctx.fillStyle = '#0a0806';
  ctx.beginPath(); ctx.arc(px + 4, py + 12, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 18, py + 12, 4, 0, Math.PI * 2); ctx.fill();
  // Handlebar
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 16, py + 2); ctx.lineTo(px + 20, py); ctx.stroke();
  // Seat
  ctx.fillStyle = isNight ? '#1a1208' : '#2a1a10';
  ctx.fillRect(px + 6, py + 2, 8, 3);
}

function drawLowrider(ctx, px, py, color, isNight) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(px - 2, py + 2, 50, 16);
  // Long low body
  ctx.fillStyle = isNight ? darken(color) : color;
  ctx.fillRect(px, py + 2, 48, 12);
  // Chrome trim line
  ctx.fillStyle = '#c9a444';
  ctx.fillRect(px, py + 8, 48, 1);
  // Windows
  ctx.fillStyle = isNight ? '#0a0806' : '#1c3040';
  ctx.fillRect(px + 12, py + 3, 8, 6);
  ctx.fillRect(px + 24, py + 3, 8, 6);
  // Wheels (smaller, lowered)
  ctx.fillStyle = '#0a0806';
  ctx.fillRect(px + 6, py + 13, 6, 3);
  ctx.fillRect(px + 36, py + 13, 6, 3);
  // Chrome hub caps
  ctx.fillStyle = '#c9a444';
  ctx.fillRect(px + 8, py + 14, 2, 1);
  ctx.fillRect(px + 38, py + 14, 2, 1);
}

function darken(hex) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40);
  return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}
`;
