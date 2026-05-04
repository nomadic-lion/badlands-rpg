/**
 * nature.ts — High-Resolution Natural Feature Rendering
 * 
 * Highly detailed top-down trees, palm fronds, rocks, and crops 
 * using advanced procedural path rendering and radial gradients.
 */

export const NATURE_JS = `
// ============================================================
// NATURE RENDERER — AAA Top-Down Organic Elements
// ============================================================

function renderNatureEntity(ctx, n, env, rng) {
  const { rand, randInt } = rng;
  const px = n.x * TILE;
  const py = n.y * TILE;
  
  const isMichoacan = env.locationId.includes('michoacan');
  const isDark = isMichoacan;

  if (n.type === 'crop') {
    const isPoppy = env.locationId.includes('michoacan') || env.locationId.includes('mountains');
    const isMarijuana = !isPoppy;

    const dirtColor = isDark ? '#1a140d' : '#3d2b1f';
    drawDropShadow(ctx, px, py, TILE * 2, TILE * 2, 8, 0.4);
    ctx.fillStyle = dirtColor;
    ctx.fillRect(px, py, TILE * 2, TILE * 2);
    
    // Irrigation / Soil rows
    ctx.strokeStyle = isDark ? '#110c08' : '#2a1e14';
    ctx.lineWidth = 2;
    for(let i=1; i<TILE*2; i+=10) {
      ctx.beginPath(); ctx.moveTo(px, py + i); ctx.lineTo(px + TILE*2, py + i); ctx.stroke();
    }

    applyGrit(ctx, px, py, TILE * 2, TILE * 2, 0.15, isDark ? '#0a0806' : '#1f150e', rng);

    if (isMarijuana) {
      // --- MARIJUANA PLANTATION ---
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const cx = px + 8 + c * 14;
          const cy = py + 8 + r * 16;
          
          // Dense jagged leaf clusters
          const leafColor = isDark ? '#0f2411' : '#2b5220';
          const highlight = isDark ? '#1e3816' : '#4a8a4a';
          
          ctx.fillStyle = leafColor;
          for(let a=0; a<Math.PI*2; a+=Math.PI/3) {
            const lx = cx + Math.cos(a)*6;
            const ly = cy + Math.sin(a)*6;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(lx + Math.cos(a+0.5)*4, ly + Math.sin(a+0.5)*4);
            ctx.lineTo(lx, ly);
            ctx.fill();
          }
          // Center bud/flower
          ctx.fillStyle = highlight;
          ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
        }
      }
    } else {
      // --- POPPY FIELDS ---
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          const cx = px + 6 + c * 10;
          const cy = py + 6 + r * 12;
          
          // Fern-like poppy foliage
          ctx.fillStyle = isDark ? '#122610' : '#3d732d';
          ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill();
          
          // Vibrant Poppy Flowers
          const petalColor = rand() > 0.5 ? '#8b2b22' : '#c0392b';
          ctx.fillStyle = petalColor;
          ctx.beginPath();
          ctx.arc(cx - 2, cy - 2, 2.5, 0, Math.PI*2);
          ctx.arc(cx + 2, cy - 2, 2.5, 0, Math.PI*2);
          ctx.arc(cx, cy + 1, 2.5, 0, Math.PI*2);
          ctx.fill();
          
          // Dark center
          ctx.fillStyle = '#111';
          ctx.beginPath(); ctx.arc(cx, cy - 1, 1, 0, Math.PI*2); ctx.fill();
        }
      }
    }
  } else if (n.type === 'tree') {
    const cx = px + TILE;
    const cy = py + TILE;
    
    drawDropShadow(ctx, cx - TILE, cy - TILE*0.5, TILE*2, TILE*2, 15, 0.6);

    // Trunk - Slightly curved and detailed
    ctx.fillStyle = isDark ? '#1a140d' : '#3d2b1f';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy + 10);
    ctx.quadraticCurveTo(cx - 4, cy, cx - 2, cy - 5);
    ctx.lineTo(cx + 2, cy - 5);
    ctx.quadraticCurveTo(cx + 4, cy, cx + 3, cy + 10);
    ctx.fill();

    const sizeMod = n.size * 4;
    const baseRadius = TILE * 0.9 + sizeMod;
    
    const colors = isDark 
      ? { base: '#0a1408', mid: '#122610', top: '#1e3816', highlight: '#2d4c1e' }
      : { base: '#1e3816', mid: '#2b5220', top: '#3d732d', highlight: '#5c9947' };

    const drawLeafCluster = (x, y, r, color, highlight) => {
      const pts = [];
      for(let i=0; i<7; i++) {
        const a = (Math.PI*2/7)*i;
        const dist = r * (0.8 + rand()*0.4);
        pts.push({x: Math.cos(a)*dist, y: Math.sin(a)*dist});
      }
      drawPolygon(ctx, x, y, pts, color);
      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(x - r*0.3, y - r*0.3, r*0.4, 0, Math.PI*2);
      ctx.fill();
    };

    const clusters = 12;
    for(let i=0; i<clusters; i++) {
      const a = (Math.PI*2/clusters)*i;
      const dist = baseRadius * 0.5;
      const lx = cx + Math.cos(a)*dist;
      const ly = cy + Math.sin(a)*dist - 5;
      drawLeafCluster(lx, ly, baseRadius*0.5, colors.mid, colors.top);
    }
    drawLeafCluster(cx, cy - 10, baseRadius*0.6, colors.top, colors.highlight);

  } else if (n.type === 'palm') {
    const cx = px + TILE;
    const cy = py + TILE;
    drawDropShadow(ctx, cx - TILE*0.8, cy - TILE*0.5, TILE*1.6, TILE*1.6, 12, 0.5);

    ctx.fillStyle = isDark ? '#2a1e14' : '#5c402b';
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy + 8);
    ctx.quadraticCurveTo(cx - 3, cy, cx, cy - 2);
    ctx.lineTo(cx + 3, cy - 2);
    ctx.quadraticCurveTo(cx + 1, cy, cx + 2, cy + 8);
    ctx.fill();

    const frondColor = isDark ? '#0f2411' : '#326639';
    const numFronds = 7 + n.size;
    for (let f = 0; f < numFronds; f++) {
      ctx.save();
      ctx.translate(cx, cy - 2);
      ctx.rotate((Math.PI * 2 / numFronds) * f + (n.size * 0.3));
      ctx.fillStyle = frondColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(TILE * 0.8, -10, TILE * 1.6, 0);
      ctx.quadraticCurveTo(TILE * 0.8, 10, 0, 0);
      ctx.fill();
      ctx.strokeStyle = isDark ? '#0a170b' : '#234a28';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(TILE*0.9, -2, TILE*1.5, 0); ctx.stroke();
      ctx.restore();
    }
    if (n.size >= 2) {
      ctx.fillStyle = '#4a3219';
      ctx.beginPath(); ctx.arc(cx - 3, cy - 4, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3, cy - 2, 3, 0, Math.PI*2); ctx.fill();
    }

  } else {
    // --- BOULDER CLUSTER (Refined AAA Rock Art) ---
    const cx = px + TILE;
    const cy = py + TILE;
    
    const isSinaloa = env.locationId.includes('sinaloa');
    const rockColors = isDark 
      ? { light: '#3a3633', base: '#1f1e1d', dark: '#0a0a0a' }
      : (isSinaloa 
          ? { light: '#8c7e6c', base: '#5c5448', dark: '#2e2b26' } // Dustier, desaturated Sinaloa rocks
          : { light: '#7a7876', base: '#5c5b59', dark: '#2e2b29' });

    const drawSingleBoulder = (bx, by, r, rColors) => {
      drawDropShadow(ctx, bx - r, by - r*0.5, r*2, r*2, 6, 0.5);
      const points = [];
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const variance = rand() * (r * 0.4);
        points.push({ x: Math.cos(angle) * (r + variance), y: Math.sin(angle) * (r + variance) });
      }
      const grad = ctx.createLinearGradient(bx - r, by - r, bx + r, by + r);
      grad.addColorStop(0, rColors.light); grad.addColorStop(0.5, rColors.base); grad.addColorStop(1, rColors.dark);
      drawPolygon(ctx, bx, by, points, grad, '#111', 1);
      
      // Cracks and highlights
      ctx.strokeStyle = rColors.dark; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx - r*0.3, by - r*0.2); ctx.lineTo(bx + r*0.2, by + r*0.3); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.moveTo(bx - r*0.4, by - r*0.4); ctx.lineTo(bx - r*0.2, by - r*0.4); ctx.stroke();
    };

    // Main boulder
    const mainR = TILE * 0.6 + n.size * 2;
    drawSingleBoulder(cx, cy, mainR, rockColors);
    
    // Smaller secondary boulders - Placed at the base (lower Y, slightly to the side)
    if (n.size >= 2) {
      const offX1 = mainR * 0.8;
      const offY1 = mainR * 0.4; // Higher Y = lower on screen
      drawSingleBoulder(cx + offX1, cy + offY1, mainR * 0.45, rockColors);
      
      const offX2 = -mainR * 0.9;
      const offY2 = mainR * 0.3;
      drawSingleBoulder(cx + offX2, cy + offY2, mainR * 0.35, rockColors);
    }
  }
}
`;
