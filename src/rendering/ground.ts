/**
 * ground.ts — Ground & Terrain Rendering
 * 
 * Renders all ground tiles: dirt, asphalt roads, ocean, sand,
 * road markings, street lamps with light cones, ground texture details.
 */

export const GROUND_JS = `
// ============================================================
// GROUND & TERRAIN RENDERER
// ============================================================

function renderGround(ctx, env, rng) {
  const { grid, hRoads, vRoads, isRural, isForest, isMountains, isLA, isVegas, isBeach } = env;
  const { rand, randInt, randChoice } = rng;
  const isNight = env.isNight;
  const isDusk = env.isDusk;

  // Base fill
  ctx.fillStyle = isNight ? '#0a0806' : '#14110e';
  ctx.fillRect(0, 0, W, H);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const px = x * TILE;
      const py = y * TILE;

      if (grid[x][y] === 4) {
        // --- OCEAN ---
        ctx.fillStyle = isNight ? '#031424' : '#1a4b66';
        ctx.fillRect(px, py, TILE, TILE);
        if (rand() > 0.75) {
          ctx.fillStyle = isNight ? '#072b4c' : '#297a99';
          ctx.fillRect(px + randInt(0, TILE - 4), py + randInt(0, TILE - 2), randInt(3, 6), 2);
        }
        // Foam near shore
        if (x >= 12 && x <= 14 && rand() > 0.6) {
          ctx.fillStyle = isNight ? '#1a3344' : '#8acbdb';
          ctx.globalAlpha = 0.4;
          ctx.fillRect(px + randInt(0, TILE - 6), py + randInt(0, TILE - 2), randInt(4, 8), 2);
          ctx.globalAlpha = 1.0;
        }

      } else if (grid[x][y] === 5) {
        // --- SAND ---
        ctx.fillStyle = isNight ? '#1e1c15' : '#d1bd94';
        ctx.fillRect(px, py, TILE, TILE);
        for (let k = 0; k < 3; k++) {
          if (rand() > 0.6) {
            ctx.fillStyle = isNight ? '#2b291f' : '#b29c72';
            ctx.fillRect(px + randInt(0, TILE - 2), py + randInt(0, TILE - 2), 2, 2);
          }
        }
        // Occasional shell/debris
        if (rand() > 0.95) {
          ctx.fillStyle = isNight ? '#3d3228' : '#e8d5b8';
          ctx.beginPath();
          ctx.arc(px + randInt(4, TILE - 4), py + randInt(4, TILE - 4), randInt(1, 3), 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (grid[x][y] === 1) {
        // --- ROAD ---
        if (isRural) {
          ctx.fillStyle = isNight ? '#14110e' : '#2a241d';
          ctx.fillRect(px, py, TILE, TILE);
          // Dirt texture
          for (let k = 0; k < 2; k++) {
            if (rand() < 0.4) {
              ctx.fillStyle = randChoice(['#1a1612', '#3d3228']);
              ctx.fillRect(px + randInt(0, TILE - 2), py + randInt(0, TILE - 2), randInt(1, 3), randInt(1, 2));
            }
          }
        } else {
          // Asphalt
          ctx.fillStyle = isNight ? '#0f0d0b' : '#1a1815';
          ctx.fillRect(px, py, TILE, TILE);
          // Cracks
          for (let k = 0; k < 2; k++) {
            if (rand() < 0.3) {
              ctx.fillStyle = '#0a0907';
              ctx.fillRect(px + randInt(0, TILE - 2), py + randInt(0, TILE - 2), randInt(1, 3), randInt(1, 3));
            }
          }
          // Center road markings
          if (hRoads.some(ry => ry + 1 === y) && (x % 2 === 0)) {
            ctx.fillStyle = isNight ? '#4a3d1b' : '#c9a444';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(px + TILE / 4, py + TILE / 2 - 1, TILE / 2, 2);
            ctx.globalAlpha = 1.0;
          }
          if (vRoads.some(rx => rx + 1 === x) && (y % 2 === 0)) {
            ctx.fillStyle = isNight ? '#4a3d1b' : '#c9a444';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(px + TILE / 2 - 1, py + TILE / 4, 2, TILE / 2);
            ctx.globalAlpha = 1.0;
          }
          // Street lamps
          if (x % 6 === 0 && y % 6 === 0 && rand() > 0.4) {
            // Pole
            ctx.fillStyle = '#1a1815';
            ctx.fillRect(px + TILE / 2, py + TILE / 2 - 2, 2, 10);
            // Lamp head
            ctx.fillStyle = '#2a241d';
            ctx.fillRect(px + TILE / 2 - 3, py + TILE / 2 - 4, 8, 3);

            const lampColor = (isVegas || isLA) ? '#f1c40f' : '#c9a444';
            if (isNight || isDusk) {
              // Light cone
              ctx.fillStyle = lampColor;
              ctx.globalAlpha = isNight ? 0.25 : 0.08;
              ctx.beginPath();
              ctx.arc(px + TILE / 2, py + TILE / 2 + 8, TILE * 2.0, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;
              // Bulb
              ctx.fillStyle = '#fffae0';
              ctx.beginPath();
              ctx.arc(px + TILE / 2 + 1, py + TILE / 2 - 2, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

      } else if (grid[x][y] === 0 || grid[x][y] === 3 || grid[x][y] === 2) {
        // --- GROUND / DIRT ---
        if (isForest) ctx.fillStyle = isNight ? '#0c120a' : '#182414';
        else if (isMountains) ctx.fillStyle = isNight ? '#110c08' : '#261c14';
        else ctx.fillStyle = isNight ? '#13110e' : '#221f1a';
        ctx.fillRect(px, py, TILE, TILE);

        // Ground texture
        for (let k = 0; k < 3; k++) {
          if (rand() < 0.5) {
            if (isForest) ctx.fillStyle = randChoice(['#1e2b17', '#101a0d', '#2d4c1e']);
            else if (isMountains) ctx.fillStyle = randChoice(['#3b2f21', '#1c140d', '#4a3927']);
            else ctx.fillStyle = randChoice(['#2a241d', '#3d3228', '#1a1612']);
            const size = randInt(1, 4);
            ctx.fillRect(px + randInt(0, TILE - size), py + randInt(0, TILE - size), size, size);
          }
        }

        // Occasional grass blades in forest
        if (isForest && rand() > 0.85) {
          ctx.strokeStyle = isNight ? '#1a2e14' : '#3d6b2d';
          ctx.lineWidth = 1;
          const gx = px + randInt(2, TILE - 2);
          const gy = py + TILE;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + randInt(-3, 3), gy - randInt(4, 8));
          ctx.stroke();
        }
      }
    }
  }
}
`;
