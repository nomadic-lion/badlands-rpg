/**
 * pixelEngine.ts — High-Resolution Top-Down 2D Utilities
 * 
 * Provides a sophisticated set of tools to render gritty, highly detailed
 * top-down environments, supporting the 3/4 perspective trick and deep shadows.
 */

export const PIXEL_ENGINE_JS = `
// ============================================================
// PIXEL ENGINE — High-Res Top-Down 2D
// ============================================================

// Global Hit Areas for touch interactions
const landmarkHitAreas = [];

// Helper for rounded rectangles (compatibility for older WebViews)
function drawRoundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Dithering fill helper
function fillDither(ctx, x, y, w, h, color1, color2) {
  ctx.fillStyle = color1;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color2;
  const dotSize = 2;
  for (let j = 0; j < h; j += dotSize) {
    for (let i = (j % (dotSize * 2) === 0 ? 0 : dotSize); i < w; i += dotSize * 2) {
      ctx.fillRect(x + i, y + j, dotSize, dotSize);
    }
  }
}

// Realistic Drop Shadow
function drawDropShadow(ctx, x, y, w, h, blur, alpha) {
  ctx.save();
  ctx.fillStyle = \`rgba(0,0,0,\${alpha})\`;
  ctx.shadowColor = \`rgba(0,0,0,\${alpha})\`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = blur * 0.5;
  ctx.shadowOffsetY = blur * 0.5;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// Organic Polygon Rendering (for rocks, canopies, blood)
function drawPolygon(ctx, cx, cy, points, fillStyle, strokeStyle, lineWidth) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (i === 0) ctx.moveTo(cx + pt.x, cy + pt.y);
    else ctx.lineTo(cx + pt.x, cy + pt.y);
  }
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.lineWidth = lineWidth || 1;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
}

// Procedural Noise/Dithering for Grit
function applyGrit(ctx, x, y, w, h, density, color, rng) {
  ctx.fillStyle = color;
  for (let i = 0; i < w * h * density; i++) {
    const dx = rng.randInt(0, w - 1);
    const dy = rng.randInt(0, h - 1);
    ctx.fillRect(x + dx, y + dy, 1, 1);
  }
}

// Draw a detailed car top-down
const drawCarTopDown = (ctx, cx, cy, type, color, angle, isNight, rng) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  let cw = 32, ch = 16, hoodL = 8, trunkL = 6, roofW = 16, roofH = 14;
  
  if (type === 'suv') { cw = 40; ch = 18; hoodL = 10; trunkL = 8; roofW = 20; roofH = 16; }
  else if (type === 'pickup') { cw = 42; ch = 18; hoodL = 10; trunkL = 16; roofW = 14; roofH = 16; }
  else if (type === 'lowrider') { cw = 44; ch = 16; hoodL = 14; trunkL = 12; roofW = 16; roofH = 14; }

  // Shadow
  drawDropShadow(ctx, -cw/2, -ch/2 + 2, cw, ch, 8, 0.6);

  // Main Body
  ctx.fillStyle = color;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
  drawRoundRect(ctx, -cw/2, -ch/2, cw, ch, 3);
  ctx.fill(); ctx.stroke();

  // Roof & Windows
  const rx = -cw/2 + hoodL;
  ctx.fillStyle = '#111'; // Windows
  drawRoundRect(ctx, rx, -roofH/2, roofW, roofH, 2);
  ctx.fill();

  // Windshield reflection
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.moveTo(rx, -roofH/2); ctx.lineTo(rx + 4, -roofH/2); ctx.lineTo(rx, roofH/2); ctx.fill();

  // Roof Top
  ctx.fillStyle = color;
  drawRoundRect(ctx, rx + 2, -roofH/2 + 1, roofW - 4, roofH - 2, 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(rx + 2, -roofH/2 + 1, roofW - 4, 2);

  // Pickup Bed
  if (type === 'pickup') {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(rx + roofW + 2, -ch/2 + 2, trunkL - 4, ch - 4);
    if (rng.rand() > 0.5) {
      ctx.fillStyle = '#4a3d2b';
      ctx.fillRect(rx + roofW + 4, -ch/2 + 4, 6, 6);
    }
  }

  // Headlights
  ctx.fillStyle = isNight ? '#fffae0' : '#dcdcdc';
  ctx.fillRect(-cw/2, -ch/2 + 2, 2, 3);
  ctx.fillRect(-cw/2, ch/2 - 5, 2, 3);

  // Taillights
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(cw/2 - 2, -ch/2 + 2, 2, 3);
  ctx.fillRect(cw/2 - 2, ch/2 - 5, 2, 3);

  if (isNight) {
    ctx.fillStyle = 'rgba(255, 250, 224, 0.15)';
    ctx.beginPath(); ctx.moveTo(-cw/2, -ch/2 + 3); ctx.lineTo(-cw/2 - 60, -ch/2 - 15); ctx.lineTo(-cw/2 - 60, -ch/2 + 15); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-cw/2, ch/2 - 3); ctx.lineTo(-cw/2 - 60, ch/2 - 15); ctx.lineTo(-cw/2 - 60, ch/2 + 15); ctx.fill();
    ctx.fillStyle = 'rgba(204, 0, 0, 0.3)';
    ctx.beginPath(); ctx.arc(cw/2, -ch/2 + 3, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cw/2, ch/2 - 3, 6, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
};

const drawPole = (ctx, sx, sy, isNight) => {
  drawDropShadow(ctx, sx - 2, sy - 2, 4, 4, 8, 0.5);
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 12, sy); ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.fillRect(sx - 16, sy - 2, 4, 4);

  if (isNight) {
    const lampColor = '#f1c40f';
    ctx.fillStyle = lampColor;
    ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.arc(sx - 14, sy, 40, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(sx - 14, sy, 15, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx - 15, sy - 1, 2, 2);
  }
};

`;
