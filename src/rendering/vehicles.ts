/**
 * vehicles.ts — Detailed Top-Down Vehicle Rendering
 * 
 * Renders abandoned wrecks with random rotations and parked vehicles
 * aligned to sidewalks using high-resolution paths and dynamic lighting.
 */

export const VEHICLES_JS = `
// ============================================================
// VEHICLE & STREET PROP RENDERER
// ============================================================

function renderWreckedCars(ctx, env, rng) {
  const { grid } = env;
  const { rand, randInt, randChoice } = rng;
  const isMichoacan = env.locationId.includes('michoacan');

  const numCars = randInt(8, 16);
  for (let c = 0; c < numCars; c++) {
    const cx = randInt(2, cols - 3);
    const cy = randInt(2, rows - 3);
    if (grid[cx][cy] !== 1) continue;

    const px = cx * TILE + TILE/2;
    const py = cy * TILE + TILE/2;
    
    // Rusted, dark palettes for abandoned wrecks
    const carColor = randChoice(['#2a1f1d', '#1a1815', '#1c1f21', '#211711']);
    const angle = rand() * Math.PI * 2;
    
    drawCarTopDown(ctx, px, py, randChoice(['sedan', 'pickup', 'suv']), carColor, angle, false, rng);
    
    // Add wreck details (scorch marks / rust)
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(randInt(-10, 10), randInt(-6, 0), randInt(4, 10), randInt(4, 8));
    if (rand() > 0.5) {
      ctx.fillStyle = '#4a2516'; // rust
      ctx.fillRect(randInt(-15, 15), randInt(-4, 2), randInt(4, 8), randInt(2, 4));
    }
    // Shattered glass
    if (rand() > 0.3) {
      ctx.fillStyle = 'rgba(200,255,255,0.4)';
      for(let i=0; i<5; i++) ctx.fillRect(randInt(6, 12), randInt(-6, 6), 1, 1);
    }
    ctx.restore();
  }
}

function renderStreetProps(ctx, env, rng) {
  const { grid, hRoads, vRoads, isRural } = env;
  const { rand, randInt, randChoice } = rng;
  const isCity = env.locationId.includes('la_') || env.locationId.includes('vegas');

  if (isRural) return; // Cities and checkpoints get street props

  // Horizontal roads (Sidewalks)
  for (const ry of hRoads) {
    for (let rx = 2; rx < cols - 2; rx += randInt(8, 14)) {
      if (grid[rx][ry] === 1 && grid[rx][ry-1] !== 1) { // Top sidewalk
        const px = rx * TILE;
        const py = ry * TILE;
        if (rand() > 0.4) {
          drawPole(ctx, px, py - 4, false);
        } else if (rand() > 0.3) {
          const color = isCity ? randChoice(['#111', '#8b2b22', '#2a4020', '#426477', '#c9a444', '#fff']) : randChoice(['#222', '#333', '#111', '#444']);
          // Parked facing right (0) or left (PI)
          const angle = rand() > 0.5 ? 0 : Math.PI;
          drawCarTopDown(ctx, px, py + 8, randChoice(['sedan', 'suv', 'pickup', 'lowrider']), color, angle, false, rng);
        }
      }
    }
  }

  // Vertical roads (Sidewalks)
  for (const rx of vRoads) {
    for (let ry = 2; ry < rows - 2; ry += randInt(8, 14)) {
      if (grid[rx][ry] === 1 && grid[rx-1][ry] !== 1) { // Left sidewalk
        const px = rx * TILE;
        const py = ry * TILE + TILE / 2;
        if (rand() > 0.6) {
          drawPole(ctx, px - 8, py, false);
        } else if (rand() > 0.4) {
          const color = isCity ? randChoice(['#111', '#8b2b22', '#2a4020', '#426477', '#c9a444', '#fff']) : randChoice(['#222', '#333', '#111', '#444']);
          // Parked facing down (PI/2) or up (-PI/2)
          const angle = rand() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
          drawCarTopDown(ctx, px + 8, py, randChoice(['sedan', 'suv', 'pickup', 'lowrider']), color, angle, false, rng);
        }
      }
    }
  }
}
`;
