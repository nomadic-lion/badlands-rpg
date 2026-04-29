/**
 * landmarks.ts — 5 Unique Landmark Building Renderers
 * Each building is a hand-crafted pixel art function with extreme detail.
 */

export const LANDMARKS_JS = `
// ============================================================
// LANDMARK BUILDINGS — Unique Hand-Crafted Pixel Art
// ============================================================

// Stored landmark hit areas for click detection
const landmarkHitAreas = [];

function renderSingleLandmark(ctx, lm, env, rng) {
  const isNight = env.isNight;
  const px = lm.gridX * TILE;
  const py = lm.gridY * TILE;
  
  switch (lm.type) {
    case 'drug_lab': drawDrugLab(ctx, px, py, isNight, rng); break;
    case 'cartel_ranch': drawCartelRanch(ctx, px, py, isNight, rng); break;
    case 'casino': drawCasino(ctx, px, py, isNight, rng); break;
    case 'gang_hq': drawGangHQ(ctx, px, py, isNight, rng); break;
    case 'rooster_pit': drawRoosterPit(ctx, px, py, isNight, rng); break;
  }
  
  // Add to hit areas if not already there
  if (!landmarkHitAreas.find(h => h.id === lm.id)) {
    landmarkHitAreas.push({ id: lm.id, name: lm.name, desc: lm.description, x: px, y: py - 80, w: 240, h: 200 });
  }
}

// ---- 1. DRUG LABORATORY (Michoacán) ----
function drawDrugLab(ctx, px, py, isNight, rng) {
  const { rand, randInt, randChoice } = rng;
  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(px - 4, py + 4, 220, 140);

  // Main building - low concrete block
  const wallC = isNight ? '#1a1612' : '#3d3228';
  ctx.fillStyle = wallC; ctx.fillRect(px, py, 200, 120);
  // Corrugated roof
  ctx.fillStyle = isNight ? '#1a1a1a' : '#4a4a4a';
  ctx.fillRect(px - 8, py - 20, 216, 24);
  for (let rx = 0; rx < 216; rx += 6) {
    ctx.fillStyle = isNight ? '#222' : '#555'; ctx.fillRect(px - 8 + rx, py - 20, 3, 24);
  }
  // Walls detail - stains
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let i = 0; i < 8; i++) ctx.fillRect(px + randInt(4, 180), py + randInt(10, 100), randInt(2, 6), randInt(8, 30));

  // Windows (barred, some lit with eerie green)
  for (let wx = 0; wx < 3; wx++) {
    const winX = px + 20 + wx * 60; const winY = py + 30;
    ctx.fillStyle = '#0a0806'; ctx.fillRect(winX, winY, 16, 20);
    // Bars
    ctx.strokeStyle = '#3d3228'; ctx.lineWidth = 1;
    for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.moveTo(winX + 4 + b * 5, winY); ctx.lineTo(winX + 4 + b * 5, winY + 20); ctx.stroke(); }
    if (isNight && rand() > 0.3) {
      ctx.fillStyle = '#39ff14'; ctx.globalAlpha = 0.3; ctx.fillRect(winX + 1, winY + 1, 14, 18); ctx.globalAlpha = 1.0;
    }
  }
  // Door
  ctx.fillStyle = '#1a1208'; ctx.fillRect(px + 85, py + 60, 30, 60);
  ctx.fillStyle = '#3d3228'; ctx.fillRect(px + 85, py + 60, 30, 3);

  // Chemical barrels outside
  const barrelColors = ['#c9a444', '#8b2b22', '#426477'];
  for (let b = 0; b < 5; b++) {
    const bx = px + 210 + randInt(0, 30); const by = py + 20 + b * 22;
    ctx.fillStyle = randChoice(barrelColors); ctx.fillRect(bx, by, 14, 18);
    ctx.fillStyle = '#0a0806'; ctx.fillRect(bx, by, 14, 2); ctx.fillRect(bx, by + 16, 14, 2);
    // Hazard stripe
    ctx.fillStyle = '#c9a444'; ctx.fillRect(bx + 2, by + 7, 10, 3);
  }

  // Ventilation pipes on roof
  ctx.fillStyle = '#4a4c4d';
  ctx.fillRect(px + 40, py - 35, 8, 16); ctx.fillRect(px + 140, py - 30, 8, 12);
  // Smoke from pipes
  if (!isNight) {
    ctx.fillStyle = 'rgba(100,100,100,0.2)';
    ctx.beginPath(); ctx.arc(px + 44, py - 42, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + 144, py - 38, 6, 0, Math.PI * 2); ctx.fill();
  }

  // Camouflage tarp over side area
  ctx.fillStyle = isNight ? '#0c1a0a' : '#3d5c2d';
  ctx.globalAlpha = 0.7; ctx.fillRect(px - 30, py + 40, 28, 60); ctx.globalAlpha = 1.0;
  ctx.fillStyle = isNight ? '#1a2e14' : '#4a7a36';
  ctx.globalAlpha = 0.5;
  for (let s = 0; s < 4; s++) ctx.fillRect(px - 28 + randInt(0, 20), py + 42 + s * 14, randInt(6, 16), randInt(4, 10));
  ctx.globalAlpha = 1.0;

  // Parked pickup trucks
  drawParkedPickup(ctx, px + 30, py + 130, '#3d3228', isNight, false);
  drawParkedPickup(ctx, px + 120, py + 135, '#2a4020', isNight, true);

  // Trash/garbage bags
  for (let t = 0; t < 3; t++) {
    ctx.fillStyle = '#0f0d0b';
    ctx.beginPath(); ctx.arc(px + 195 + t * 12, py + 125, 6, 0, Math.PI * 2); ctx.fill();
  }

  // Barbed wire fence
  ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px - 30, py - 5); ctx.lineTo(px + 250, py - 5); ctx.stroke();
  for (let bw = 0; bw < 28; bw++) {
    const bwx = px - 30 + bw * 10;
    ctx.beginPath(); ctx.moveTo(bwx, py - 7); ctx.lineTo(bwx + 3, py - 3); ctx.stroke();
  }
}

// ---- 2. CARTEL RANCH (Sinaloa) ----
function drawCartelRanch(ctx, px, py, isNight, rng) {
  const { rand, randInt, randChoice } = rng;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(px - 4, py + 4, 260, 180);

  // Perimeter wall
  const wallColor = isNight ? '#2a241d' : '#d1bd94';
  ctx.fillStyle = wallColor;
  ctx.fillRect(px, py, 250, 6); ctx.fillRect(px, py + 160, 250, 6);
  ctx.fillRect(px, py, 6, 166); ctx.fillRect(px + 244, py, 6, 166);

  // Main hacienda
  ctx.fillStyle = isNight ? '#261c14' : '#c9a070';
  ctx.fillRect(px + 30, py + 20, 140, 80);
  // Tile roof
  ctx.fillStyle = isNight ? '#3a1a0a' : '#b5543c';
  ctx.fillRect(px + 25, py + 10, 150, 14);
  for (let rx = 0; rx < 150; rx += 8) {
    ctx.fillStyle = isNight ? '#4a2a1a' : '#c96a4c';
    ctx.fillRect(px + 25 + rx, py + 10, 4, 14);
  }

  // Windows
  for (let w = 0; w < 4; w++) {
    const wx = px + 40 + w * 32; const wy = py + 38;
    ctx.fillStyle = '#0a0806'; ctx.fillRect(wx, wy, 12, 16);
    if (isNight && rand() > 0.4) {
      ctx.fillStyle = '#c9a444'; ctx.globalAlpha = 0.4; ctx.fillRect(wx, wy, 12, 16); ctx.globalAlpha = 1.0;
    }
    // Shutters
    ctx.fillStyle = isNight ? '#1a1208' : '#6b4a28';
    ctx.fillRect(wx - 2, wy, 2, 16); ctx.fillRect(wx + 12, wy, 2, 16);
  }

  // Ornate gate entrance
  ctx.fillStyle = isNight ? '#3d3228' : '#8b7040';
  ctx.fillRect(px + 110, py + 160, 30, 6);
  ctx.fillStyle = isNight ? '#c9a444' : '#e8c860';
  ctx.fillRect(px + 112, py + 155, 26, 4);
  // Gate pillars
  ctx.fillStyle = wallColor;
  ctx.fillRect(px + 108, py + 148, 6, 20); ctx.fillRect(px + 136, py + 148, 6, 20);

  // Courtyard (interior ground)
  ctx.fillStyle = isNight ? '#1a1612' : '#c9b888';
  ctx.fillRect(px + 8, py + 8, 234, 150);

  // Satellite dish on roof
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath(); ctx.arc(px + 150, py + 15, 8, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(px + 149, py + 15, 2, 8);

  // Parked SUVs
  drawParkedSUV(ctx, px + 20, py + 110, '#1a1a1a', isNight);
  drawParkedSUV(ctx, px + 180, py + 115, '#3d3228', isNight);

  // Guard post (corner)
  ctx.fillStyle = isNight ? '#1a1612' : '#3d3228';
  ctx.fillRect(px + 230, py + 10, 16, 20);
  ctx.fillStyle = isNight ? '#0a0806' : '#1a1815';
  ctx.fillRect(px + 232, py + 12, 12, 8);

  // Livestock pen
  ctx.strokeStyle = isNight ? '#2a241d' : '#6b5a3a';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 180, py + 30, 50, 40);

  // Graffiti tag on outer wall
  ctx.fillStyle = '#8b2b22'; ctx.font = 'bold 10px sans-serif';
  ctx.fillText('CDS', px + 10, py + 170);
}

// ---- 3. CASINO (Las Vegas) ----
function drawCasino(ctx, px, py, isNight, rng) {
  const { rand, randInt, randChoice } = rng;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(px - 4, py + 6, 280, 200);

  // Main structure - tall gold building
  const wallGrad = ctx.createLinearGradient(px, py - 60, px, py + 160);
  wallGrad.addColorStop(0, isNight ? '#4a3510' : '#c9a444');
  wallGrad.addColorStop(1, isNight ? '#1a1208' : '#8b7030');
  ctx.fillStyle = wallGrad; ctx.fillRect(px, py - 60, 260, 220);

  // Gold trim lines
  ctx.fillStyle = isNight ? '#c9a444' : '#e8d060';
  ctx.fillRect(px, py - 60, 260, 3); ctx.fillRect(px, py + 20, 260, 2); ctx.fillRect(px, py + 100, 260, 2);

  // Windows grid (many, lit)
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 10; col++) {
      const wx = px + 12 + col * 24; const wy = py - 50 + row * 22;
      ctx.fillStyle = '#0a0806'; ctx.fillRect(wx, wy, 14, 14);
      if (isNight) {
        const gc = randChoice(['#ffeaa7', '#f1c40f', '#e67e22', '#00ffcc', '#ff00ff']);
        ctx.fillStyle = gc; ctx.globalAlpha = rand() > 0.3 ? 0.6 : 0.1;
        ctx.fillRect(wx, wy, 14, 14); ctx.globalAlpha = 1.0;
      }
    }
  }

  // Marquee sign on top
  ctx.fillStyle = isNight ? '#1a1208' : '#2a241d';
  ctx.fillRect(px + 40, py - 90, 180, 28);
  if (isNight) {
    // Neon border
    ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2; ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 12;
    ctx.strokeRect(px + 42, py - 88, 176, 24); ctx.shadowBlur = 0;
    // Text glow
    ctx.fillStyle = '#ffff00'; ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 8;
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('CASINO ROYALE', px + 130, py - 72); ctx.shadowBlur = 0; ctx.textAlign = 'start';
  } else {
    ctx.fillStyle = '#c9a444'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('CASINO ROYALE', px + 130, py - 72); ctx.textAlign = 'start';
  }

  // Grand entrance
  ctx.fillStyle = isNight ? '#3d3228' : '#c9a444';
  ctx.fillRect(px + 90, py + 120, 80, 40);
  ctx.fillStyle = '#0a0806'; ctx.fillRect(px + 95, py + 125, 70, 35);
  // Revolving door lines
  ctx.strokeStyle = '#c9a444'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 130, py + 125); ctx.lineTo(px + 130, py + 160); ctx.stroke();

  // Fountain in front
  ctx.fillStyle = isNight ? '#1c3040' : '#4a8aaa';
  ctx.beginPath(); ctx.ellipse(px + 130, py + 180, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = isNight ? '#2a5070' : '#8acbdb';
  ctx.beginPath(); ctx.ellipse(px + 130, py + 180, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
  // Fountain jet
  ctx.strokeStyle = isNight ? '#4a8aaa' : '#c0e8f8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px + 130, py + 178); ctx.lineTo(px + 130, py + 164); ctx.stroke();

  // Valet parking
  drawParkedSUV(ctx, px - 30, py + 140, '#1a1a1a', isNight);
  drawParkedSUV(ctx, px + 270, py + 145, '#664d1a', isNight);

  // Rooftop pool glow (night)
  if (isNight) {
    ctx.fillStyle = '#00ffff'; ctx.globalAlpha = 0.12;
    ctx.fillRect(px + 80, py - 56, 100, 30); ctx.globalAlpha = 1.0;
  }
}

// ---- 4. GANG HQ (Los Angeles) ----
function drawGangHQ(ctx, px, py, isNight, rng) {
  const { rand, randInt, randChoice } = rng;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(px - 4, py + 4, 230, 160);

  // Warehouse structure
  ctx.fillStyle = isNight ? '#232323' : '#4a4a4a';
  ctx.fillRect(px, py, 220, 140);

  // Corrugated siding texture
  for (let sx = 0; sx < 220; sx += 4) {
    ctx.fillStyle = sx % 8 === 0 ? (isNight ? '#2a2a2a' : '#555') : (isNight ? '#1e1e1e' : '#444');
    ctx.fillRect(px + sx, py, 2, 140);
  }

  // Flat roof
  ctx.fillStyle = isNight ? '#1a1a1a' : '#333';
  ctx.fillRect(px - 4, py - 8, 228, 12);

  // Graffiti on walls (colorful tags)
  const graffitiColors = ['#ff3333', '#3399ff', '#ffff00', '#ff00ff', '#39ff14'];
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = randChoice(graffitiColors); ctx.fillText('MS-13', px + 10, py + 50);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = randChoice(graffitiColors); ctx.fillText('EAST SIDE', px + 140, py + 80);
  // Spray paint splatter
  for (let s = 0; s < 6; s++) {
    ctx.fillStyle = randChoice(graffitiColors); ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(px + randInt(10, 200), py + randInt(20, 120), randInt(3, 8), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Barred windows
  for (let w = 0; w < 4; w++) {
    const wx = px + 15 + w * 52; const wy = py + 30;
    ctx.fillStyle = '#0a0806'; ctx.fillRect(wx, wy, 18, 22);
    // Security bars
    ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 2;
    for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.moveTo(wx + 4 + b * 6, wy); ctx.lineTo(wx + 4 + b * 6, wy + 22); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(wx, wy + 11); ctx.lineTo(wx + 18, wy + 11); ctx.stroke();
  }

  // Roll-up garage door
  ctx.fillStyle = '#1a1815'; ctx.fillRect(px + 80, py + 80, 60, 60);
  ctx.strokeStyle = '#3d3228'; ctx.lineWidth = 1;
  for (let dl = 0; dl < 6; dl++) { ctx.beginPath(); ctx.moveTo(px + 80, py + 86 + dl * 9); ctx.lineTo(px + 140, py + 86 + dl * 9); ctx.stroke(); }

  // Security cameras
  ctx.fillStyle = '#333'; ctx.fillRect(px + 5, py + 5, 8, 6);
  ctx.fillStyle = '#1a1815'; ctx.fillRect(px + 11, py + 6, 6, 3);
  if (isNight) { ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(px + 14, py + 7, 1.5, 0, Math.PI * 2); ctx.fill(); }

  // Chain-link fence in front
  ctx.strokeStyle = isNight ? '#2a2a2a' : '#6a6a6a'; ctx.lineWidth = 0.5;
  for (let fx = 0; fx < 240; fx += 6) { ctx.beginPath(); ctx.moveTo(px - 10 + fx, py + 145); ctx.lineTo(px - 10 + fx, py + 160); ctx.stroke(); }
  ctx.strokeStyle = isNight ? '#3a3a3a' : '#7a7a7a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px - 10, py + 150); ctx.lineTo(px + 230, py + 150); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px - 10, py + 155); ctx.lineTo(px + 230, py + 155); ctx.stroke();

  // Dumpsters with garbage
  ctx.fillStyle = isNight ? '#1a3322' : '#2a5530'; ctx.fillRect(px + 180, py + 130, 24, 16);
  ctx.fillStyle = '#0a0806'; ctx.fillRect(px + 180, py + 130, 24, 3);
  // Garbage bags
  ctx.fillStyle = '#0f0d0b';
  ctx.beginPath(); ctx.arc(px + 208, py + 138, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 215, py + 135, 4, 0, Math.PI * 2); ctx.fill();

  // Parked lowriders
  drawLowrider(ctx, px - 20, py + 150, '#3333aa', isNight);
  drawLowrider(ctx, px + 160, py + 155, '#8b2b22', isNight);
}

// ---- 5. ROOSTER FIGHTING PIT (Michoacán/Sinaloa) ----
function drawRoosterPit(ctx, px, py, isNight, rng) {
  const { rand, randInt, randChoice } = rng;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px - 4, py + 4, 200, 170);

  // Circular arena structure
  ctx.fillStyle = isNight ? '#1a1612' : '#3d3228';
  ctx.beginPath(); ctx.ellipse(px + 90, py + 80, 85, 70, 0, 0, Math.PI * 2); ctx.fill();

  // Inner ring (fighting pit, dirt floor)
  ctx.fillStyle = isNight ? '#1e1a14' : '#8b7050';
  ctx.beginPath(); ctx.ellipse(px + 90, py + 80, 45, 35, 0, 0, Math.PI * 2); ctx.fill();
  // Blood stains in pit
  ctx.fillStyle = '#8b2b22'; ctx.globalAlpha = 0.3;
  ctx.beginPath(); ctx.arc(px + 80, py + 85, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 100, py + 78, 4, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1.0;

  // Wooden bleacher rows
  ctx.fillStyle = isNight ? '#1a1208' : '#5c4020';
  ctx.beginPath(); ctx.ellipse(px + 90, py + 80, 70, 55, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = isNight ? '#2a1a10' : '#6b5030'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(px + 90, py + 80, 60, 48, 0, 0, Math.PI * 2); ctx.stroke();

  // Tin roof (partial, covers bleachers)
  ctx.fillStyle = isNight ? '#1a1a1a' : '#4a4a4a';
  ctx.beginPath(); ctx.ellipse(px + 90, py + 60, 88, 30, 0, Math.PI, Math.PI * 2); ctx.fill();
  // Roof corrugation
  for (let r = 0; r < 176; r += 6) {
    ctx.fillStyle = isNight ? '#222' : '#555';
    const angle = Math.PI + (r / 176) * Math.PI;
    const rx = px + 90 + Math.cos(angle) * 86;
    const ry = py + 60 + Math.sin(angle) * 28;
    ctx.fillRect(rx, ry, 3, 4);
  }

  // Overhead fight lights
  ctx.fillStyle = '#4a4a4a'; ctx.fillRect(px + 86, py + 30, 8, 20);
  if (isNight) {
    ctx.fillStyle = '#f1c40f'; ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(px + 90, py + 80, 50, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#fffae0'; ctx.beginPath(); ctx.arc(px + 90, py + 52, 4, 0, Math.PI * 2); ctx.fill();
  }

  // Hand-painted sign
  ctx.fillStyle = isNight ? '#1a1612' : '#3d3228';
  ctx.fillRect(px - 20, py + 20, 40, 20);
  ctx.fillStyle = '#c9a444'; ctx.font = 'bold 8px sans-serif';
  ctx.fillText('PELEAS', px - 16, py + 33);

  // Parked motorcycles
  drawMotorcycle(ctx, px - 15, py + 140, isNight);
  drawMotorcycle(ctx, px + 5, py + 145, isNight);
  drawMotorcycle(ctx, px + 170, py + 142, isNight);

  // Beer bottles / trash scattered
  ctx.fillStyle = isNight ? '#1a3322' : '#2a6633';
  for (let b = 0; b < 5; b++) {
    ctx.fillRect(px + randInt(0, 170), py + randInt(120, 160), 2, 6);
  }
  // Crushed cans
  ctx.fillStyle = '#c9a444'; ctx.globalAlpha = 0.4;
  for (let c = 0; c < 3; c++) {
    ctx.fillRect(px + randInt(10, 160), py + randInt(125, 155), 4, 3);
  }
  ctx.globalAlpha = 1.0;

  // Entrance gap
  ctx.fillStyle = isNight ? '#0f0d0b' : '#1a1612';
  ctx.fillRect(px + 75, py + 145, 30, 8);
}
`;
