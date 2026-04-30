/**
 * landmarks.ts — 5 Unique Landmark Building Renderers
 * Each building is a hand-crafted pixel art function with extreme detail.
 */

export const LANDMARKS_JS = `
// ============================================================
// LANDMARK BUILDINGS — High-Resolution Pixel Art Replacements
// ============================================================

const landmarkHitAreas = [];

function drawPixelBlock(ctx, x, y, w, d, h, colors) {
  if (colors.groundShadow) {
    ctx.fillStyle = colors.groundShadow;
    ctx.fillRect(x + w, y - h/2, h/2, h/2); 
    ctx.fillRect(x + h/2, y, w, d/2);
  }

  if (h > 0) {
    ctx.fillStyle = colors.front;
    ctx.fillRect(x, y - h, w, h);
    if (colors.highlight) {
      ctx.fillStyle = colors.highlight;
      ctx.fillRect(x, y - h, 2, h); 
      ctx.fillRect(x, y - h, w, 2); 
    }
    if (colors.shadow) {
      ctx.fillStyle = colors.shadow;
      ctx.fillRect(x + w - 2, y - h, 2, h); 
      ctx.fillRect(x, y - 2, w, 2); 
    }
  }

  if (d > 0) {
    ctx.fillStyle = colors.top;
    ctx.fillRect(x, y - h - d, w, d);
    if (colors.highlight) {
      ctx.fillStyle = colors.highlight;
      ctx.fillRect(x, y - h - d, w, 2); 
      ctx.fillRect(x, y - h - d, 2, d); 
    }
    if (colors.shadow) {
      ctx.fillStyle = colors.shadow;
      ctx.fillRect(x + w - 2, y - h - d, 2, d); 
      ctx.fillRect(x, y - h - 2, w, 2); 
    }
  }
}

function fillDither(ctx, x, y, w, h, color1, color2) {
  ctx.fillStyle = color1;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color2;
  for (let dy = 0; dy < h; dy += 2) {
    for (let dx = (dy % 4 === 0 ? 0 : 2); dx < w; dx += 4) {
      ctx.fillRect(x + dx, y + dy, 2, 2);
    }
  }
}

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
  
  if (!landmarkHitAreas.find(h => h.id === lm.id)) {
    landmarkHitAreas.push({ id: lm.id, name: lm.name, desc: lm.description, x: px, y: py - 80, w: 240, h: 200 });
  }
}

const palConcrete = { top: '#b8b5b0', front: '#8c8a86', highlight: '#d6d3cc', shadow: '#5c5b59', groundShadow: 'rgba(0,0,0,0.6)' };
const palConcreteNight = { top: '#4a4e54', front: '#2e3136', highlight: '#5f646b', shadow: '#1a1c1f', groundShadow: 'rgba(0,0,0,0.8)' };

const palWood = { top: '#9c6f44', front: '#6e4b2a', highlight: '#c49160', shadow: '#422a14', groundShadow: 'rgba(0,0,0,0.6)' };
const palWoodNight = { top: '#3d3024', front: '#261c14', highlight: '#544232', shadow: '#120d09', groundShadow: 'rgba(0,0,0,0.8)' };

const palAdobe = { top: '#d1a775', front: '#a68051', highlight: '#f0c48d', shadow: '#785934', groundShadow: 'rgba(0,0,0,0.5)' };
const palAdobeNight = { top: '#544534', front: '#3b2f21', highlight: '#6e5a44', shadow: '#211a12', groundShadow: 'rgba(0,0,0,0.8)' };

const palRoof = { top: '#ad4b3b', front: '#823427', highlight: '#d1624f', shadow: '#592016' };
const palRoofNight = { top: '#47211b', front: '#2e130f', highlight: '#612e26', shadow: '#170806' };

const palGold = { top: '#ffd700', front: '#b8860b', highlight: '#ffea70', shadow: '#8b6508', groundShadow: 'rgba(0,0,0,0.7)' };
const palGoldNight = { top: '#8a7500', front: '#543d00', highlight: '#b39800', shadow: '#2e2100', groundShadow: 'rgba(0,0,0,0.9)' };

const getPal = (palDay, palNight, isNight) => isNight ? palNight : palDay;

const drawCar = (ctx, cx, cy, type, color, isNight) => {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(cx, cy - 2, 48, 20); 
  let w = 46, h = 18, cbw = 28, cbh = 10, cbx = 8;
  if (type === 'pickup') { cbw = 16; } 
  if (type === 'suv') { cbw = 34; h = 20; cbh = 12; }
  if (type === 'lowrider') { h = 14; cbh = 8; }

  ctx.fillStyle = color; ctx.fillRect(cx, cy - h, w, h);
  ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.15; ctx.fillRect(cx, cy - h, w, 2); ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#111'; ctx.fillRect(cx + cbx, cy - h - cbh, cbw, cbh);
  
  ctx.fillStyle = isNight ? '#0a0a0a' : '#426477';
  ctx.fillRect(cx + cbx + 2, cy - h - cbh + 2, cbw/2 - 3, cbh - 2); 
  ctx.fillRect(cx + cbx + cbw/2 + 1, cy - h - cbh + 2, cbw/2 - 3, cbh - 2); 

  ctx.fillStyle = '#050505'; 
  ctx.fillRect(cx + 6, cy - 4, 10, 8);
  ctx.fillRect(cx + w - 16, cy - 4, 10, 8);
  
  ctx.fillStyle = (type === 'lowrider') ? '#c9a444' : '#888';
  ctx.fillRect(cx + 8, cy - 2, 6, 4);
  ctx.fillRect(cx + w - 14, cy - 2, 6, 4);

  ctx.fillStyle = '#fff'; ctx.fillRect(cx + 2, cy - h + 4, 2, 6); 
  ctx.fillStyle = '#f00'; ctx.fillRect(cx + w - 4, cy - h + 4, 2, 6); 
  
  if (isNight) {
    ctx.fillStyle = '#fffae0'; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.moveTo(cx, cy - h + 6); ctx.lineTo(cx - 60, cy - h - 10); ctx.lineTo(cx - 60, cy - h + 20); ctx.fill();
    ctx.globalAlpha = 1.0;
  }
};

const drawPole = (ctx, sx, sy, isNight) => {
  ctx.fillStyle = '#111'; ctx.fillRect(sx, sy - 60, 4, 60);
  ctx.fillStyle = '#333'; ctx.fillRect(sx, sy - 60, 1, 60); 
  ctx.fillStyle = '#222'; ctx.fillRect(sx - 10, sy - 62, 24, 4); 
  if (isNight) {
    ctx.fillStyle = '#fff'; ctx.fillRect(sx - 8, sy - 60, 20, 2);
    ctx.fillStyle = '#f1c40f'; ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.moveTo(sx + 2, sy - 58); ctx.lineTo(sx - 40, sy + 20); ctx.lineTo(sx + 44, sy + 20); ctx.fill();
    ctx.globalAlpha = 1.0;
  }
};

// ---- 1. DRUG LABORATORY (Michoacán) ----
function drawDrugLab(ctx, px, py, isNight, rng) {
  const conc = getPal(palConcrete, palConcreteNight, isNight);
  const roof = { top: isNight ? '#2e3136' : '#8c8a86', front: isNight ? '#1a1c1f' : '#5c5b59', highlight: isNight ? '#4a4e54' : '#b8b5b0', shadow: isNight ? '#0d0f11' : '#3d3c3a' };
  
  fillDither(ctx, px - 20, py - 10, 260, 180, isNight ? '#1c1a17' : '#524b43', isNight ? '#141210' : '#453f38');
  
  drawPixelBlock(ctx, px, py + 120, 200, 100, 60, conc);
  drawPixelBlock(ctx, px + 160, py + 120, 40, 40, 80, conc);

  for(let i=0; i<3; i++) {
    ctx.fillStyle = '#050505'; ctx.fillRect(px + 20 + i*40, py + 80, 16, 20);
    ctx.fillStyle = '#222'; ctx.fillRect(px + 28 + i*40, py + 80, 2, 20);
    if (isNight && rng.rand() > 0.3) {
      ctx.fillStyle = '#39ff14'; ctx.globalAlpha = 0.3; ctx.fillRect(px + 20 + i*40, py + 80, 16, 20); ctx.globalAlpha = 1.0;
    }
  }

  ctx.fillStyle = '#111'; ctx.fillRect(px + 100, py + 80, 24, 40);

  drawPixelBlock(ctx, px - 4, py + 68, 208, 108, 4, roof);
  for(let x = px; x < px + 200; x += 4) {
    ctx.fillStyle = roof.shadow; ctx.fillRect(x, py - 40, 2, 104);
  }

  drawCar(ctx, px + 20, py + 150, 'pickup', '#3d3228', isNight);
  drawCar(ctx, px + 100, py + 160, 'pickup', '#2a4020', isNight);
  drawPole(ctx, px - 10, py + 140, isNight);

  for(let b=0; b<6; b++) {
    const bx = px + 170 + (b%3)*10; const by = py + 140 + Math.floor(b/3)*10;
    ctx.fillStyle = '#111'; ctx.fillRect(bx, by-8, 8, 10);
    ctx.fillStyle = '#0055aa'; ctx.fillRect(bx, by-8, 6, 10);
    ctx.fillStyle = '#fff'; ctx.fillRect(bx+2, by-8, 2, 10);
    ctx.fillStyle = '#111'; ctx.fillRect(bx, by-6, 8, 2); ctx.fillRect(bx, by-2, 8, 2);
  }
}

// ---- 2. CARTEL RANCH (Sinaloa) ----
function drawCartelRanch(ctx, px, py, isNight, rng) {
  const adobe = getPal(palAdobe, palAdobeNight, isNight);
  const rT = getPal(palRoof, palRoofNight, isNight);
  
  fillDither(ctx, px, py, 240, 180, isNight ? '#1e1a14' : '#c9b888', isNight ? '#14110d' : '#b5a57a');

  drawPixelBlock(ctx, px, py + 180, 240, 6, 20, adobe);
  drawPixelBlock(ctx, px, py + 180, 6, 180, 20, adobe);
  drawPixelBlock(ctx, px + 234, py + 180, 6, 180, 20, adobe);
  drawPixelBlock(ctx, px, py + 6, 240, 6, 20, adobe);

  drawPixelBlock(ctx, px, py + 20, 20, 20, 40, adobe);
  drawPixelBlock(ctx, px + 220, py + 180, 20, 20, 40, adobe);

  drawPixelBlock(ctx, px + 40, py + 100, 160, 60, 40, adobe);
  drawPixelBlock(ctx, px + 36, py + 64, 168, 68, 4, rT); 

  for(let w=0; w<4; w++) {
    const wx = px + 60 + w*30;
    ctx.fillStyle = '#111'; ctx.fillRect(wx, py + 70, 12, 16);
    if(isNight && rng.rand() > 0.4) {
      ctx.fillStyle = '#e8c860'; ctx.fillRect(wx+1, py + 71, 10, 14);
    }
  }

  ctx.fillStyle = '#222'; ctx.fillRect(px + 100, py + 160, 40, 20);
  ctx.fillStyle = '#b8860b'; ctx.fillRect(px + 100, py + 160, 40, 2);

  drawCar(ctx, px + 30, py + 130, 'suv', '#111', isNight);
  drawCar(ctx, px + 150, py + 140, 'suv', '#333', isNight);
  drawPole(ctx, px + 120, py + 180, isNight);
}

// ---- 3. CASINO (Las Vegas) ----
function drawCasino(ctx, px, py, isNight, rng) {
  const gold = getPal(palGold, palGoldNight, isNight);
  
  fillDither(ctx, px - 10, py + 20, 280, 180, isNight ? '#111' : '#444', isNight ? '#0a0a0a' : '#333');

  drawPixelBlock(ctx, px, py + 140, 260, 120, 40, gold);
  drawPixelBlock(ctx, px + 20, py + 100, 220, 100, 80, gold);
  drawPixelBlock(ctx, px + 60, py + 20, 140, 80, 120, gold);

  for(let row=0; row<10; row++) {
    for(let col=0; col<8; col++) {
      const wx = px + 70 + col*16; const wy = py - 10 + row*12;
      ctx.fillStyle = '#111'; ctx.fillRect(wx, wy, 8, 8);
      if(isNight) {
        ctx.fillStyle = rng.randChoice(['#ffeaa7', '#f1c40f', '#e67e22', '#00ffcc', '#ff00ff']);
        ctx.globalAlpha = rng.rand() > 0.3 ? 0.8 : 0.2;
        ctx.fillRect(wx, wy, 8, 8); ctx.globalAlpha = 1.0;
      }
    }
  }

  drawPixelBlock(ctx, px + 90, py + 160, 80, 40, 20, gold);
  ctx.fillStyle = '#111'; ctx.fillRect(px + 100, py + 140, 60, 20);

  ctx.fillStyle = '#000'; ctx.fillRect(px + 40, py - 40, 180, 30);
  if(isNight) {
    ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2; ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 10;
    ctx.strokeRect(px + 42, py - 38, 176, 26);
    ctx.fillStyle = '#ffff00'; ctx.shadowColor = '#ffff00'; ctx.font = 'bold 14px monospace';
    ctx.fillText('CASINO ROYALE', px + 65, py - 20); ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#b8860b'; ctx.font = 'bold 14px monospace';
    ctx.fillText('CASINO ROYALE', px + 65, py - 20);
  }

  drawCar(ctx, px - 20, py + 170, 'sedan', '#111', isNight);
  drawCar(ctx, px + 230, py + 170, 'lowrider', '#8b2b22', isNight);
  drawPole(ctx, px + 70, py + 180, isNight);
  drawPole(ctx, px + 190, py + 180, isNight);
}

// ---- 4. GANG HQ (Los Angeles) ----
function drawGangHQ(ctx, px, py, isNight, rng) {
  const brick = { top: isNight ? '#3d2522' : '#8a4b44', front: isNight ? '#2b1816' : '#6b3630', highlight: isNight ? '#4f302b' : '#a35a52', shadow: isNight ? '#1c0f0e' : '#4d241f', groundShadow: 'rgba(0,0,0,0.7)' };
  
  fillDither(ctx, px - 10, py, 250, 180, isNight ? '#141414' : '#444', isNight ? '#0f0f0f' : '#333');

  drawPixelBlock(ctx, px, py + 120, 220, 100, 80, brick);

  ctx.fillStyle = brick.shadow;
  for(let bx=0; bx<220; bx+=8) {
    for(let by=0; by<80; by+=4) {
      if((bx+by)%3===0) ctx.fillRect(px + bx, py + 40 + by, 4, 2);
    }
  }

  ctx.fillStyle = '#111'; ctx.fillRect(px + 80, py + 60, 60, 60);
  ctx.fillStyle = '#222';
  for(let gy=0; gy<60; gy+=6) ctx.fillRect(px + 80, py + 60 + gy, 60, 2);

  ctx.fillStyle = '#ff3333'; ctx.font = 'bold 16px monospace'; ctx.fillText('MS-13', px + 10, py + 80);
  ctx.fillStyle = '#39ff14'; ctx.font = 'bold 12px monospace'; ctx.fillText('WEST', px + 160, py + 70);

  const conc = getPal(palConcrete, palConcreteNight, isNight);
  drawPixelBlock(ctx, px - 10, py + 160, 250, 4, 16, conc);
  ctx.fillStyle = '#555';
  for(let wx = px - 10; wx < px + 240; wx += 8) {
    ctx.fillRect(wx, py + 140, 2, 4); 
    ctx.fillRect(wx, py + 142, 8, 1); 
  }

  drawCar(ctx, px + 20, py + 145, 'lowrider', '#3333aa', isNight);
  drawCar(ctx, px + 140, py + 155, 'lowrider', '#8b2b22', isNight);
  drawPole(ctx, px - 10, py + 145, isNight);
  drawPole(ctx, px + 230, py + 145, isNight);
}

// ---- 5. ROOSTER FIGHTING PIT (Michoacán/Sinaloa) ----
function drawRoosterPit(ctx, px, py, isNight, rng) {
  const wood = getPal(palWood, palWoodNight, isNight);
  const concrete = getPal(palConcrete, palConcreteNight, isNight);
  
  fillDither(ctx, px - 20, py - 20, 240, 220, isNight ? '#1e1a14' : '#8b7050', isNight ? '#14110d' : '#735a3d');

  drawCar(ctx, px + 10, py + 180, 'pickup', '#8b2b22', isNight);
  drawCar(ctx, px + 80, py + 190, 'sedan', '#2a4020', isNight);
  drawCar(ctx, px + 150, py + 175, 'pickup', '#c9a444', isNight);
  drawPole(ctx, px - 10, py + 180, isNight);
  drawPole(ctx, px + 210, py + 180, isNight);

  const cx = px + 120;
  const cy = py + 100;
  
  drawPixelBlock(ctx, cx - 60, cy - 20, 120, 30, 20, wood);
  drawPixelBlock(ctx, cx - 50, cy - 10, 100, 30, 10, wood);

  drawPixelBlock(ctx, cx - 40, cy + 45, 80, 80, 5, concrete);
  fillDither(ctx, cx - 35, cy - 35, 70, 70, isNight ? '#261c14' : '#735a3d', isNight ? '#1f150e' : '#5c452b');
  
  ctx.fillStyle = '#591611';
  ctx.fillRect(cx - 10, cy - 5, 8, 4); ctx.fillRect(cx + 15, cy + 10, 4, 4);

  drawPixelBlock(ctx, cx - 50, cy + 80, 100, 30, 10, wood);
  drawPixelBlock(ctx, cx - 60, cy + 110, 120, 30, 20, wood);

  drawPixelBlock(ctx, cx - 60, cy + 50, 20, 60, 20, wood);
  drawPixelBlock(ctx, cx + 40, cy + 50, 20, 60, 20, wood);

  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 75, cy - 70, 4, 100); ctx.fillRect(cx + 71, cy - 70, 4, 100);
  ctx.fillRect(cx - 75, cy + 50, 4, 100); ctx.fillRect(cx + 71, cy + 50, 4, 100);

  const roof = { top: isNight ? '#2e3136' : '#8c8a86', front: isNight ? '#1a1c1f' : '#5c5b59', highlight: isNight ? '#4a4e54' : '#b8b5b0', shadow: isNight ? '#0d0f11' : '#3d3c3a' };
  drawPixelBlock(ctx, cx - 80, cy + 90, 160, 160, 10, roof);
  
  ctx.fillStyle = roof.shadow;
  for(let x = cx - 78; x < cx + 78; x += 4) {
    ctx.fillRect(x, cy - 80, 2, 160);
  }

  drawPixelBlock(ctx, cx - 40, cy + 130, 80, 10, 20, wood);
  ctx.fillStyle = '#000'; ctx.fillRect(cx - 38, cy + 112, 76, 16);
  ctx.fillStyle = '#e8c860'; ctx.font = 'bold 12px monospace';
  ctx.fillText('PELEAS', cx - 22, cy + 124);

  if (isNight) {
    ctx.fillStyle = '#39ff14'; ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 10;
    ctx.fillRect(cx - 20, cy - 95, 40, 15);
    ctx.fillStyle = '#000'; ctx.shadowBlur = 0;
    ctx.fillRect(cx - 18, cy - 93, 36, 11);
    ctx.fillStyle = '#39ff14'; ctx.font = '9px monospace';
    ctx.fillText('CERVEZA', cx - 16, cy - 84);
  }
}
`;;
