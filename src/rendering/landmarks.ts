/**
 * landmarks.ts — 5 Unique Landmark Building Renderers
 * Each building is a hand-crafted, high-resolution top-down 2D structure
 * featuring detailed textures, deep shadows, and gritty assets.
 */

export const LANDMARKS_JS = `
// ============================================================
// LANDMARK BUILDINGS — High-Resolution AAA 2D Top-Down
// ============================================================

function renderSingleLandmark(ctx, lm, env, rng) {
  const px = lm.gridX * TILE;
  const py = lm.gridY * TILE;
  
  switch (lm.type) {
    case 'drug_lab': drawDrugLab(ctx, px, py, env, rng); break;
    case 'cartel_ranch': drawCartelRanch(ctx, px, py, env, rng); break;
    case 'casino': drawCasino(ctx, px, py, env, rng); break;
    case 'gang_hq': drawGangHQ(ctx, px, py, env, rng); break;
    case 'rooster_pit': drawRoosterPit(ctx, px, py, env, rng); break;
  }
  
  if (!landmarkHitAreas.find(h => h.id === lm.id)) {
    landmarkHitAreas.push({ id: lm.id, name: lm.name, desc: lm.description, x: px, y: py - 80, w: 240, h: 200 });
  }
}

// ---- 1. DRUG LABORATORY (Michoacán) ----
function drawDrugLab(ctx, px, py, env, rng) {
  const isMichoacan = true; // Drug lab is usually Michoacan
  
  // Base dirt clearing
  drawDropShadow(ctx, px - 20, py - 10, 260, 180, 10, 0.5);
  fillDither(ctx, px - 20, py - 10, 260, 180, '#1c1a17', '#141210');
  
  // Main building 3/4 perspective
  drawDropShadow(ctx, px, py + 20, 200, 100, 15, 0.7);
  
  // Front Wall
  const wallGrad = ctx.createLinearGradient(px, py + 120, px, py + 160);
  wallGrad.addColorStop(0, '#2e3136'); wallGrad.addColorStop(1, '#1a1c1f');
  ctx.fillStyle = wallGrad; ctx.fillRect(px, py + 120, 200, 40);

  // Large industrial doors
  for(let i=0; i<3; i++) {
    ctx.fillStyle = '#050505'; ctx.fillRect(px + 20 + i*40, py + 130, 24, 30);
    ctx.fillStyle = '#111'; ctx.fillRect(px + 30 + i*40, py + 130, 4, 30);
  }

  // Corrugated Metal Roof
  const roofGrad = ctx.createLinearGradient(px, py + 20, px + 200, py + 120);
  roofGrad.addColorStop(0, '#3d3c3a'); roofGrad.addColorStop(1, '#141210');
  ctx.fillStyle = roofGrad; ctx.fillRect(px, py + 20, 200, 100);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
  for(let rx = 0; rx < 200; rx += 4) {
    ctx.beginPath(); ctx.moveTo(px + rx, py + 20); ctx.lineTo(px + rx, py + 120); ctx.stroke();
  }

  // Side chemical tanks
  ctx.fillStyle = '#4a4e54';
  ctx.beginPath(); ctx.arc(px + 220, py + 80, 20, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2e3136'; ctx.beginPath(); ctx.arc(px + 220, py + 80, 16, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 220, py + 130, 20, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a1c1f'; ctx.beginPath(); ctx.arc(px + 220, py + 130, 16, 0, Math.PI*2); ctx.fill();

  // Acid spills / Garbage area (replaces the bugged grit square)
  const gx = px + 200;
  const gy = py + 60;
  const gw = 60;
  const gh = 100;
  
  // Toxic sludge puddles
  ctx.fillStyle = 'rgba(57, 255, 20, 0.3)';
  for(let i=0; i<3; i++) {
    const rx = gx + rng.randInt(5, 40);
    const ry = gy + rng.randInt(5, 70);
    const rs = rng.randInt(10, 25);
    ctx.beginPath(); ctx.arc(rx, ry, rs, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#39ff14'; ctx.beginPath(); ctx.arc(rx, ry, rs*0.4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(57, 255, 20, 0.3)';
  }

  // Scattered barrels
  const drawBarrel = (bx, by, color) => {
    drawDropShadow(ctx, bx - 6, by - 4, 12, 12, 4, 0.5);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();
    // Rim
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI*2); ctx.stroke();
  };

  drawBarrel(gx + 15, gy + 20, '#1a3b4d'); // Blue chemical barrel
  drawBarrel(gx + 40, gy + 45, '#8b2b22'); // Rusty red barrel
  drawBarrel(gx + 20, gy + 80, '#c9a444'); // Yellow barrel

  // Wooden crates
  const drawCrate = (cx, cy) => {
    drawDropShadow(ctx, cx, cy, 18, 18, 5, 0.5);
    ctx.fillStyle = '#4a3d2b'; ctx.fillRect(cx, cy, 18, 18);
    ctx.strokeStyle = '#2a1e14'; ctx.lineWidth = 1.5; ctx.strokeRect(cx + 2, cy + 2, 14, 14);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 18, cy + 18); ctx.stroke();
  };

  drawCrate(gx + 30, gy + 10);
  drawCrate(gx + 10, gy + 50);

  drawCarTopDown(ctx, px + 40, py + 180, 'pickup', '#3d3228', 0.2, false, rng);
  drawCarTopDown(ctx, px + 120, py + 175, 'suv', '#2a4020', -0.1, false, rng);
  drawPole(ctx, px - 10, py + 140, false);
}

// ---- 2. CARTEL RANCH (Sinaloa) ----
function drawCartelRanch(ctx, px, py, env, rng) {
  // Courtyard dirt - Dusty, desaturated
  drawDropShadow(ctx, px, py, 240, 180, 20, 0.6);
  fillDither(ctx, px, py, 240, 180, '#8c7e6c', '#5c5448');

  // Adobe Walls (Courtyard perimeter) - Desaturated clay
  const adobeWall = '#7d6345';
  ctx.fillStyle = adobeWall;
  ctx.fillRect(px, py + 170, 240, 10); // Bottom wall
  ctx.fillRect(px, py, 10, 180); // Left wall
  ctx.fillRect(px + 230, py, 10, 180); // Right wall
  ctx.fillRect(px, py, 240, 10); // Top wall

  // Main Hacienda Building
  drawDropShadow(ctx, px + 20, py + 20, 200, 80, 15, 0.5);
  const haciendaWallGrad = ctx.createLinearGradient(px + 20, py + 80, px + 20, py + 100);
  haciendaWallGrad.addColorStop(0, '#7d6345'); haciendaWallGrad.addColorStop(1, '#3d3021');
  ctx.fillStyle = haciendaWallGrad; ctx.fillRect(px + 20, py + 80, 200, 20);

  // Arches
  ctx.fillStyle = '#0a0806';
  for(let w=0; w<5; w++) {
    const wx = px + 40 + w*32;
    ctx.beginPath(); ctx.arc(wx + 8, py + 86, 8, Math.PI, 0); ctx.fill();
    ctx.fillRect(wx, py + 86, 16, 14);
  }

  // Terracotta Roof - Deep, weathered red
  const roofGrad = ctx.createLinearGradient(px + 20, py + 20, px + 220, py + 80);
  roofGrad.addColorStop(0, '#7d382d'); roofGrad.addColorStop(1, '#3d1c16');
  ctx.fillStyle = roofGrad; ctx.fillRect(px + 20, py + 20, 200, 60);
  
  // Roof tiles
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
  for(let rx = 0; rx < 200; rx += 6) {
    ctx.beginPath(); ctx.moveTo(px + 20 + rx, py + 20); ctx.lineTo(px + 20 + rx, py + 80); ctx.stroke();
  }

  // Details
  ctx.fillStyle = '#2d3d2d'; ctx.beginPath(); ctx.arc(px + 120, py + 130, 15, 0, Math.PI*2); ctx.fill(); // fountain base
  ctx.fillStyle = '#4a7b8f'; ctx.beginPath(); ctx.arc(px + 120, py + 130, 10, 0, Math.PI*2); ctx.fill(); // water

  drawCarTopDown(ctx, px + 60, py + 150, 'suv', '#111', 0, false, rng);
  drawCarTopDown(ctx, px + 180, py + 140, 'pickup', '#222', Math.PI/4, false, rng);
}

// ---- 3. CASINO (Las Vegas) ----
function drawCasino(ctx, px, py, env, rng) {
  drawDropShadow(ctx, px, py + 20, 260, 140, 30, 0.8);

  // Base tier
  const gold1 = ctx.createLinearGradient(px, py + 120, px + 260, py + 160);
  gold1.addColorStop(0, '#b8860b'); gold1.addColorStop(1, '#543d00');
  ctx.fillStyle = gold1; ctx.fillRect(px, py + 120, 260, 40);
  ctx.fillStyle = '#ffd700'; ctx.fillRect(px, py + 20, 260, 100);

  // Second tier
  drawDropShadow(ctx, px + 20, py, 220, 100, 20, 0.6);
  const gold2 = ctx.createLinearGradient(px + 20, py + 80, px + 240, py + 120);
  gold2.addColorStop(0, '#8a7500'); gold2.addColorStop(1, '#2e2100');
  ctx.fillStyle = gold2; ctx.fillRect(px + 20, py + 80, 220, 40);
  ctx.fillStyle = '#ffea70'; ctx.fillRect(px + 20, py - 20, 220, 100);

  // Glass roof / Atrium
  ctx.fillStyle = '#112233'; ctx.fillRect(px + 60, py - 40, 140, 80);
  ctx.strokeStyle = '#2a5b7d'; ctx.lineWidth = 2;
  for(let x=0; x<140; x+=20) {
    ctx.beginPath(); ctx.moveTo(px + 60 + x, py - 40); ctx.lineTo(px + 60 + x, py + 40); ctx.stroke();
  }

  // Neon Marquee
  ctx.fillStyle = '#000'; ctx.fillRect(px + 40, py + 150, 180, 20);
  ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2; ctx.strokeRect(px + 42, py + 152, 176, 16);
  ctx.fillStyle = '#ffff00'; ctx.font = 'bold 12px monospace';
  ctx.fillText('CASINO ROYALE', px + 65, py + 164);

  drawCarTopDown(ctx, px - 10, py + 180, 'sedan', '#111', -Math.PI/6, false, rng);
  drawCarTopDown(ctx, px + 240, py + 170, 'lowrider', '#8b2b22', Math.PI/8, false, rng);
}

// ---- 4. GANG HQ (Los Angeles) ----
function drawGangHQ(ctx, px, py, env, rng) {
  drawDropShadow(ctx, px - 10, py, 250, 180, 15, 0.6);
  
  // Main Compound Building
  const brickWall = ctx.createLinearGradient(px, py + 100, px, py + 140);
  brickWall.addColorStop(0, '#6b3630'); brickWall.addColorStop(1, '#2b1816');
  ctx.fillStyle = brickWall; ctx.fillRect(px, py + 100, 220, 40);

  // Graffiti
  ctx.fillStyle = '#ff3333'; ctx.font = 'bold 18px "SpaceGrotesk"'; ctx.fillText('MS-13', px + 10, py + 125);
  ctx.fillStyle = '#39ff14'; ctx.font = 'bold 14px "SpaceGrotesk"'; ctx.fillText('WEST', px + 160, py + 120);

  // Chaotic Overlapping Roofs (Slum style)
  for(let r=0; r<4; r++) {
    const rw = rng.randInt(60, 120);
    const rh = rng.randInt(50, 90);
    const rx = px + rng.randInt(0, 120);
    const ry = py + rng.randInt(0, 50);
    
    drawDropShadow(ctx, rx, ry, rw, rh, 8, 0.5);
    const roofColor = rng.randChoice(['#4a4a4a', '#8f4f34', '#3d4045']);
    ctx.fillStyle = roofColor; ctx.fillRect(rx, ry, rw, rh);
    
    // Corrugated lines
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
    for(let lx=0; lx<rw; lx+=4) {
      ctx.beginPath(); ctx.moveTo(rx+lx, ry); ctx.lineTo(rx+lx, ry+rh); ctx.stroke();
    }
  }

  // Central Courtyard / Hangout
  ctx.fillStyle = '#111'; ctx.fillRect(px + 80, py + 60, 60, 40);
  
  drawCarTopDown(ctx, px + 40, py + 160, 'lowrider', '#3333aa', 0, false, rng);
  drawCarTopDown(ctx, px + 160, py + 170, 'lowrider', '#8b2b22', Math.PI/16, false, rng);
}

// ---- 5. ROOSTER FIGHTING PIT (Michoacán/Sinaloa) ----
function drawRoosterPit(ctx, px, py, env, rng) {
  // Organic Dirt Ground Clearing (prevents overlapping adjacent buildings harshly)
  const clearingRadiusX = 170;
  const clearingRadiusY = 110;
  drawDropShadow(ctx, px + 150 - clearingRadiusX, py + 100 - clearingRadiusY, clearingRadiusX * 2, clearingRadiusY * 2, 25, 0.4);
  
  // Use dithered organic polygon for the clearing base
  const clearingPts = [];
  for(let i=0; i<16; i++) {
    const a = (Math.PI*2/16)*i;
    const rX = clearingRadiusX * (0.9 + rng.rand()*0.2);
    const rY = clearingRadiusY * (0.9 + rng.rand()*0.2);
    clearingPts.push({x: Math.cos(a)*rX, y: Math.sin(a)*rY});
  }
  drawPolygon(ctx, px + 150, py + 100, clearingPts, '#1f150e');
  applyGrit(ctx, px + 150 - clearingRadiusX, py + 100 - clearingRadiusY, clearingRadiusX*2, clearingRadiusY*2, 0.15, '#140d09', rng);

  // THE BUILDING (Left side)
  const cx = px + 80;
  const cy = py + 100;

  drawDropShadow(ctx, cx - 70, cy - 20, 140, 100, 15, 0.7);
  // Wood walls
  const wallGrad = ctx.createLinearGradient(cx - 70, cy + 60, cx - 70, cy + 80);
  wallGrad.addColorStop(0, '#6e4b2a'); wallGrad.addColorStop(1, '#261c14');
  ctx.fillStyle = wallGrad; ctx.fillRect(cx - 70, cy + 60, 140, 20);

  // Roof
  ctx.fillStyle = '#3d3c3a'; ctx.fillRect(cx - 70, cy - 60, 140, 120);
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 2;
  for (let x = cx - 68; x < cx + 68; x += 6) {
    ctx.beginPath(); ctx.moveTo(x, cy - 60); ctx.lineTo(x, cy + 60); ctx.stroke();
  }

  // Entrance sign
  ctx.fillStyle = '#000'; ctx.fillRect(cx - 28, cy + 65, 56, 12);
  ctx.fillStyle = '#e8c860'; ctx.font = 'bold 10px monospace';
  ctx.fillText('PELEAS', cx - 20, cy + 74);

  // THE FIGHTING CIRCLE (Outside, right side)
  const pitX = px + 240;
  const pitY = py + 100;
  
  // Dirt Ring (Perfect Circle in top-down)
  drawDropShadow(ctx, pitX - 55, pitY - 55, 110, 110, 10, 0.5);
  ctx.fillStyle = '#1a110a';
  ctx.beginPath(); ctx.arc(pitX, pitY, 55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a321f';
  ctx.beginPath(); ctx.arc(pitX, pitY, 50, 0, Math.PI * 2); ctx.fill();
  
  // Grit and Blood splatters (High-res organic paths)
  applyGrit(ctx, pitX - 40, pitY - 40, 80, 80, 0.3, '#1f130b', rng);
  
  const drawBlood = (bx, by, size) => {
    const pts = [];
    for(let i=0; i<6; i++) {
      const a = (Math.PI*2/6)*i;
      const r = size + rng.rand()*size*0.5;
      pts.push({x: Math.cos(a)*r, y: Math.sin(a)*r});
    }
    drawPolygon(ctx, pitX+bx, pitY+by, pts, '#591611');
  };
  
  drawBlood(-10, -5, 6);
  drawBlood(15, 10, 4);
  drawBlood(5, -15, 8);

  // Pit Fence
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(pitX, pitY, 52, 0, Math.PI * 2); ctx.stroke();
  for(let a=0; a<Math.PI*2; a+=0.3) {
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(pitX + Math.cos(a)*52, pitY + Math.sin(a)*52, 3, 0, Math.PI*2); ctx.fill();
  }

  // Parked cars scattered around the pit at realistic angles
  drawCarTopDown(ctx, pitX - 60, pitY - 60, 'pickup', '#8b2b22', Math.PI/4, false, rng);
  drawCarTopDown(ctx, pitX + 30, pitY - 70, 'sedan', '#2a4020', Math.PI/2 + 0.2, false, rng);
  drawCarTopDown(ctx, pitX + 70, pitY + 20, 'pickup', '#c9a444', Math.PI, false, rng);
  drawCarTopDown(ctx, pitX - 40, pitY + 70, 'lowrider', '#111', -Math.PI/4, false, rng);
}
`;
