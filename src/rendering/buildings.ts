/**
 * buildings.ts — Generic Procedural Building Rendering
 * 
 * Renders all procedurally generated buildings: ruins, concrete, glass,
 * vegas_gold, beach_house, pyramid. Includes windows, roofs, HVACs,
 * neon signs, antennas, rooftop features.
 */

export const BUILDINGS_JS = `
// ============================================================
// GENERIC BUILDING RENDERER
// ============================================================

function generateBuildings(env, rng) {
  const { grid, isRural, isVegas, isLA, isSafezone, isForest, isMountains } = env;
  const { rand, randInt, randChoice } = rng;
  const buildings = [];
  const nature = [];

  const buildingChance = isRural ? 0.05 : (isVegas || isLA ? 0.85 : 0.6);
  const natureChance = isForest ? 0.5 : (isMountains ? 0.35 : (isLA ? 0.04 : 0.02));

  const landmarks = env.location.landmarks || [];

  for (let by = 2; by < rows - 4; by++) {
    for (let bx = 2; bx < cols - 4; bx++) {
      let free = true;
      let w = randInt(isRural ? 2 : 3, isRural ? 4 : 6);
      let d = randInt(isRural ? 2 : 3, isRural ? 3 : 5);

      if (isLA) { w = randInt(3, 7); d = randInt(4, 7); }
      else if (isVegas) { w = randInt(5, 10); d = randInt(5, 9); }
      if (bx + w >= cols || by + d >= rows) continue;

      // Check if it overlaps with any landmark (give a 2-tile buffer around landmarks)
      for (const lm of landmarks) {
        if (bx + w > lm.gridX - 2 && bx < lm.gridX + 12 && by + d > lm.gridY - 2 && by < lm.gridY + 12) {
          free = false;
        }
      }

      for (let i = -1; i <= w; i++) {
        for (let j = -1; j <= d; j++) {
          if (bx + i >= 0 && bx + i < cols && by + j >= 0 && by + j < rows) {
            if (grid[bx + i][by + j] !== 0) free = false;
          }
        }
      }

      if (!free) continue;

      if (rand() < buildingChance) {
        for (let i = 0; i < w; i++) {
          for (let j = 0; j < d; j++) { grid[bx + i][by + j] = 2; }
        }
        const h = isRural ? randInt(1, 2) : (isVegas ? randInt(5, 14) : (isLA ? randInt(3, 10) : randInt(2, 6)));

        const litWindows = [];
        for (let wx = 0; wx < w; wx++) {
          for (let wy = 0; wy < h; wy++) {
            const litChance = isVegas ? 0.7 : (isLA ? 0.4 : (isSafezone ? 0.6 : 0.2));
            if (rand() < litChance) litWindows.push(wx + ',' + wy);
          }
        }

        let bStyle = 'ruin';
        let neonColor = undefined;
        if (isVegas) {
          const r = rand();
          if (r > 0.8) bStyle = 'vegas_gold';
          else if (r > 0.5) bStyle = 'glass';
          else if (r > 0.45 && w >= 6 && d >= 6) bStyle = 'pyramid';
          else bStyle = 'concrete';
          neonColor = randChoice(['#ff00ff', '#00ffcc', '#ff3333', '#ffff00']);
        } else if (isLA) {
          const r = rand();
          if (r > 0.8) bStyle = 'glass';
          else if (r > 0.4) bStyle = 'concrete';
          else if (rand() > 0.7 && env.locationId === 'la_venice') bStyle = 'beach_house';
          else bStyle = 'concrete_modern';
          neonColor = randChoice(['#ff3333', '#c9a444', '#00ccff']);
        }
        if (grid[bx][by] === 5 || (bx > 0 && grid[bx - 1][by] === 5)) bStyle = 'beach_house';

        buildings.push({ x: bx, y: by, w, d, h, litWindows, style: bStyle, neonColor });
      } else if (rand() < natureChance) {
        if (bx + 1 < cols && by + 1 < rows && grid[bx][by] === 0 && grid[bx + 1][by] === 0 && grid[bx][by + 1] === 0 && grid[bx + 1][by + 1] === 0) {
          grid[bx][by] = 3; grid[bx + 1][by] = 3; grid[bx][by + 1] = 3; grid[bx + 1][by + 1] = 3;
          nature.push({ x: bx, y: by, type: isForest ? 'tree' : (isLA ? 'palm' : 'rock'), size: randInt(1, 3) });
        }
      }
    }
  }
  return { buildings, nature };
}

function renderBuilding(ctx, b, env, rng) {
  const { rand, randInt, randChoice } = rng;
  const isNight = env.isNight;
  const isDusk = env.isDusk;

  const px = b.x * TILE;
  const py = b.y * TILE;
  const pw = b.w * TILE;
  const pd = b.d * TILE;
  const ph = b.h * TILE * 0.7;
  const roofY = py - ph;
  const wallY = py + pd - ph;

  // --- PYRAMID ---
  if (b.style === 'pyramid') {
    const peakX = px + pw / 2;
    const peakY = py + pd / 2 - ph * 1.5;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.moveTo(px + pw, py); ctx.lineTo(px + pw + ph * 1.5, py + ph * 0.5); ctx.lineTo(px + pw + ph * 1.5, py + pd + ph * 0.5); ctx.lineTo(px + pw, py + pd); ctx.fill();
    ctx.fillStyle = isNight ? '#0a0a0a' : '#1f1a14';
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + pd); ctx.lineTo(peakX, peakY); ctx.fill();
    const grad = ctx.createLinearGradient(px, py + pd, peakX, peakY);
    grad.addColorStop(0, isNight ? '#1f1b16' : '#2a241d'); grad.addColorStop(1, '#110f0c');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(px, py + pd); ctx.lineTo(px + pw, py + pd); ctx.lineTo(peakX, peakY); ctx.fill();
    const gradR = ctx.createLinearGradient(px + pw, py + pd, peakX, peakY);
    gradR.addColorStop(0, isNight ? '#14120e' : '#1c1813'); gradR.addColorStop(1, '#0a0806');
    ctx.fillStyle = gradR;
    ctx.beginPath(); ctx.moveTo(px + pw, py); ctx.lineTo(px + pw, py + pd); ctx.lineTo(peakX, peakY); ctx.fill();
    if (isNight && b.neonColor) {
      ctx.strokeStyle = b.neonColor; ctx.lineWidth = 1.5; ctx.shadowColor = b.neonColor; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.moveTo(px, py + pd); ctx.lineTo(peakX, peakY); ctx.lineTo(px + pw, py + pd); ctx.moveTo(px + pw, py + pd); ctx.lineTo(px + pw, py); ctx.lineTo(peakX, peakY); ctx.moveTo(px, py + pd); ctx.lineTo(px, py); ctx.lineTo(peakX, peakY); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(peakX, peakY, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    return;
  }

  // --- STANDARD BUILDING ---
  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.moveTo(px + pw, py); ctx.lineTo(px + pw + ph * 1.0, py + ph * 0.4); ctx.lineTo(px + pw + ph * 1.0, py + pd + ph * 0.4); ctx.lineTo(px + pw, py + pd); ctx.fill();

  // Wall color palette
  let wallTop = '#2a241d', wallBot = '#1a1612', roofTop = '#3d3228', roofBot = '#221f1a', unlitWin = '#0a0806', dayWin = '#426477', winFrame = '#1a1815';

  if (b.style === 'concrete' || b.style === 'concrete_modern') { wallTop = '#4a4a4a'; wallBot = '#232323'; roofTop = '#333333'; roofBot = '#111111'; }
  else if (b.style === 'glass') { wallTop = '#1a3b4d'; wallBot = '#051119'; roofTop = '#112233'; roofBot = '#051119'; unlitWin = '#051119'; dayWin = '#2a5b7d'; winFrame = '#0c1b24'; }
  else if (b.style === 'vegas_gold') { wallTop = '#664d1a'; wallBot = '#332100'; roofTop = '#4d3913'; roofBot = '#1f1604'; unlitWin = '#1f1604'; dayWin = '#806020'; winFrame = '#33260d'; }
  else if (b.style === 'beach_house') { wallTop = '#d1c4b2'; wallBot = '#9c9285'; roofTop = '#b5543c'; roofBot = '#803826'; winFrame = '#8c7e6c'; }

  // Front wall gradient
  const wallGrad = ctx.createLinearGradient(px, wallY, px, wallY + ph);
  wallGrad.addColorStop(0, wallTop); wallGrad.addColorStop(1, wallBot);
  ctx.fillStyle = wallGrad; ctx.fillRect(px, wallY, pw, ph);

  // Weathering streaks
  if (b.style !== 'glass' && b.style !== 'vegas_gold') {
    for (let w = 4; w < pw; w += 8) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(px + w, wallY, randInt(1, 3), ph);
    }
  }

  // Windows
  const winCols = b.w;
  const winRows = Math.floor(b.h * 0.7);
  const winWidth = 10;
  const winHeight = 12;

  for (let wx = 0; wx < winCols; wx++) {
    for (let wy = 0; wy < winRows; wy++) {
      const isLit = b.litWindows.includes(wx + ',' + wy);
      const winBaseX = px + wx * TILE + (TILE - winWidth) / 2;
      const winBaseY = wallY + wy * TILE + (TILE - winHeight) / 2 + 4;

      if (isLit && isNight) {
        let glowColor = randChoice(['#c9a444', '#f1c40f', '#e67e22', '#8b2b22']);
        if (b.style === 'glass') glowColor = randChoice(['#a8d5e5', '#f1c40f', '#c9a444', '#2980b9']);
        if (b.style === 'vegas_gold') glowColor = randChoice(['#ffeaa7', '#f1c40f', '#e67e22']);
        if (env.isVegas) glowColor = randChoice([glowColor, '#00ffcc', '#ff00ff', '#39ff14']);

        ctx.fillStyle = '#fff'; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight);
        ctx.fillStyle = glowColor; ctx.globalCompositeOperation = 'multiply'; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight); ctx.globalCompositeOperation = 'source-over';
        if (wy === winRows - 1) {
          ctx.fillStyle = glowColor; ctx.globalAlpha = b.style === 'glass' ? 0.25 : 0.12;
          ctx.beginPath(); ctx.moveTo(winBaseX, winBaseY + winHeight); ctx.lineTo(winBaseX + winWidth, winBaseY + winHeight); ctx.lineTo(winBaseX + winWidth + 10, py + pd + 20); ctx.lineTo(winBaseX - 10, py + pd + 20); ctx.fill(); ctx.globalAlpha = 1.0;
        }
      } else if (!isNight && isLit) {
        ctx.fillStyle = dayWin; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(winBaseX, winBaseY); ctx.lineTo(winBaseX + 5, winBaseY); ctx.lineTo(winBaseX, winBaseY + 5); ctx.fill();
      } else {
        ctx.fillStyle = unlitWin; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight);
        ctx.fillStyle = winFrame; ctx.fillRect(winBaseX, winBaseY, winWidth, 2);
        if (rand() > 0.5 && b.style !== 'glass' && b.style !== 'vegas_gold') {
          ctx.fillStyle = dayWin; ctx.globalAlpha = 0.5;
          ctx.beginPath(); ctx.moveTo(winBaseX, winBaseY + winHeight); ctx.lineTo(winBaseX + 3, winBaseY + winHeight); ctx.lineTo(winBaseX, winBaseY + winHeight - 3); ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }

  // Roof
  const roofGrad = ctx.createLinearGradient(px, roofY, px + pw, roofY + pd);
  roofGrad.addColorStop(0, roofTop); roofGrad.addColorStop(1, roofBot);
  ctx.fillStyle = roofGrad; ctx.fillRect(px, roofY, pw, pd);
  ctx.strokeStyle = winFrame; ctx.lineWidth = 3; ctx.strokeRect(px + 1.5, roofY + 1.5, pw - 3, pd - 3);
  ctx.strokeStyle = roofTop; ctx.lineWidth = 1; ctx.strokeRect(px, roofY, pw, pd);

  // Antenna on tall modern buildings
  if ((b.style === 'glass' || b.style === 'concrete_modern') && b.h >= 6) {
    ctx.fillStyle = '#1a1815'; ctx.fillRect(px + pw / 2 - 1, roofY - 20, 2, 20);
    if (isNight && rand() > 0.5) {
      ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(px + pw / 2, roofY - 20, 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // HVAC units
  const numHVAC = randInt(1, Math.max(1, Math.floor((b.w * b.d) / 5)));
  for (let i = 0; i < numHVAC; i++) {
    const hx = px + randInt(4, Math.max(5, pw - 16));
    const hy = roofY + randInt(4, Math.max(5, pd - 16));
    ctx.fillStyle = '#0a0806'; ctx.fillRect(hx, hy + 3, 12, 10);
    ctx.fillStyle = '#4a4c4d'; ctx.fillRect(hx, hy, 12, 10);
    ctx.fillStyle = '#0f0d0b'; ctx.beginPath(); ctx.arc(hx + 6, hy + 5, 4, 0, Math.PI * 2); ctx.fill();
    if (rand() > 0.5) {
      ctx.strokeStyle = '#1a1815'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(hx + 6, hy + 10); ctx.lineTo(hx + 6, hy + 10 + randInt(5, 15)); ctx.stroke();
    }
  }

  // Rooftop pool / helipad (Vegas/LA tall buildings)
  if (env.isVegas || env.isLA) {
    if (rand() > 0.6 && pw >= 90 && pd >= 90) {
      ctx.fillStyle = '#1a1612'; ctx.fillRect(px + pw / 2 - 22, roofY + pd / 2 - 22, 44, 44);
      ctx.fillStyle = isNight ? '#003344' : '#0099cc'; ctx.fillRect(px + pw / 2 - 20, roofY + pd / 2 - 20, 40, 40);
      if (isNight) { ctx.fillStyle = '#00ffff'; ctx.globalAlpha = 0.15; ctx.fillRect(px + pw / 2 - 20, roofY + pd / 2 - 20, 40, 40); ctx.globalAlpha = 1.0; }
    } else if (rand() > 0.7 && pw >= 70 && pd >= 70) {
      ctx.strokeStyle = '#c9a444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px + pw / 2, roofY + pd / 2, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#c9a444'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H', px + pw / 2, roofY + pd / 2);
    }
  }

  // Neon signage (night, Vegas/LA)
  if ((b.style === 'glass' || b.style === 'vegas_gold' || env.isVegas || env.isLA) && isNight && b.neonColor) {
    const signColor = b.neonColor;
    const signEdgeX = px + (rand() > 0.5 ? 0 : pw - 8);
    if ((b.style === 'glass' || b.style === 'vegas_gold') && rand() > 0.3) {
      ctx.strokeStyle = signColor; ctx.lineWidth = 2; ctx.shadowColor = signColor; ctx.shadowBlur = 10;
      ctx.strokeRect(px, wallY + ph * 0.2, pw, 2);
      if (b.h > 4) ctx.strokeRect(px, wallY + ph * 0.6, pw, 2);
      ctx.shadowBlur = 0;
    }
    if (rand() > 0.5) {
      ctx.fillStyle = '#111'; ctx.fillRect(signEdgeX, roofY + ph * 0.2, 8, ph * 0.6);
      ctx.fillStyle = signColor; ctx.shadowColor = signColor; ctx.shadowBlur = 10;
      for (let sy = roofY + ph * 0.25; sy < roofY + ph * 0.75; sy += 8) { ctx.fillRect(signEdgeX + 2, sy, 4, 4); }
      ctx.shadowBlur = 0;
    }
  }

  // Roof debris
  for (let i = 0; i < pw * pd / 120; i++) {
    ctx.fillStyle = randChoice(['#1a1612', '#0a0806']);
    ctx.fillRect(px + randInt(2, pw - 4), roofY + randInt(2, pd - 4), 2, 2);
  }
}
`;
