/**
 * index.ts — HTML Assembler
 * 
 * Assembles all rendering modules into a complete HTML document
 * for the WebView-based map renderer. Includes the game loop,
 * touch handling for point-and-click movement, and zoom controls.
 */

import { ENGINE_JS } from './engine';
import { GROUND_JS } from './ground';
import { NATURE_JS } from './nature';
import { VEHICLES_JS } from './vehicles';
import { BUILDINGS_JS } from './buildings';
import { LANDMARKS_JS } from './landmarks';
import { POSTPROCESS_JS } from './postprocess';
import { GameLocation } from '../lib/types';

export function buildMapHTML(location: GameLocation | undefined, hour: number): string {
  if (!location) return '<html><body style="background:#0f0d0b"></body></html>';

  const locationJSON = JSON.stringify(location);

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:#0f0d0b; overflow:hidden; touch-action:none; }
    canvas { width:100%; height:100%; display:block; image-rendering:pixelated; }
    .grid-overlay {
      position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none;
      opacity:0.15; mix-blend-mode:overlay;
      background-image:radial-gradient(#3d3228 1px, transparent 1px); background-size:16px 16px;
    }
    .scanline-overlay {
      position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none;
      opacity:0.03; background:linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,1) 50%); background-size:100% 4px;
    }
  </style>
</head>
<body>
  <canvas id="mapCanvas"></canvas>
  <div class="grid-overlay"></div>
  <div class="scanline-overlay"></div>
  <script>
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');

    // Size canvas to screen for sharp rendering
    function resizeCanvas() {
      canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
      if (ctx) ctx.imageSmoothingEnabled = false;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.onerror = function(msg, url, lineNo, columnNo, error) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error', 
        message: msg + ' at ' + lineNo + ':' + columnNo
      }));
      return false;
    };

    // --- Inject rendering modules ---
    ${ENGINE_JS}
    ${GROUND_JS}
    ${NATURE_JS}
    ${VEHICLES_JS}
    ${BUILDINGS_JS}
    ${LANDMARKS_JS}
    ${POSTPROCESS_JS}

    // --- GAME STATE ---
    const gameLoc = ${locationJSON};
    const hour = ${hour};
    const rng = initPRNG(gameLoc);
    const env = generateGrid(gameLoc, rng);
    env.isNight = hour < 6 || hour > 19;
    env.isDusk = hour === 6 || hour === 19 || hour === 18;
    env.locationId = gameLoc.id;
    env.location = gameLoc; // Needed for generateBuildings to check landmarks

    // Re-seed for buildings (after grid consumed some randomness)
    const bldRng = initPRNG(gameLoc);
    // consume same amount to stay deterministic
    for (let i = 0; i < 50; i++) bldRng.rand();

    const { buildings, nature } = generateBuildings(env, bldRng);

    // Sort entities by Y for correct draw order
    const entities = [];
    buildings.forEach(b => entities.push({ yBottom: b.y + b.d, type: 'building', obj: b }));
    nature.forEach(n => entities.push({ yBottom: n.y + 2, type: 'nature', obj: n }));
    
    // Add landmarks to entities for proper depth sorting
    const landmarks = (gameLoc.landmarks || []);
    for (const lm of landmarks) {
       let d = 6; 
       if (lm.type === 'drug_lab') d = 6;
       else if (lm.type === 'cartel_ranch') d = 8;
       else if (lm.type === 'casino') d = 10;
       else if (lm.type === 'gang_hq') d = 7;
       else if (lm.type === 'rooster_pit') d = 7;
       
       entities.push({ yBottom: lm.gridY + d, type: 'landmark', obj: lm });
    }

    entities.sort((a, b) => a.yBottom - b.yBottom);

    // --- PRE-RENDER STATIC WORLD ---
    // Rendering thousands of rects every frame destroys performance and 
    // advancing RNG every frame causes seizure-inducing flashes.
    // Instead, we render the static world ONCE to an offscreen canvas.
    const staticCanvas = document.createElement('canvas');
    staticCanvas.width = W;
    staticCanvas.height = H;
    const sctx = staticCanvas.getContext('2d');
    sctx.imageSmoothingEnabled = false;

    renderGround(sctx, env, rng);
    renderWreckedCars(sctx, env, rng);

    for (const ent of entities) {
      if (ent.type === 'nature') {
        renderNatureEntity(sctx, ent.obj, env, rng);
      } else if (ent.type === 'building') {
        renderBuilding(sctx, ent.obj, env, rng);
      } else if (ent.type === 'landmark') {
        renderSingleLandmark(sctx, ent.obj, env, rng);
      }
    }
    
    renderPostProcess(sctx, env);

    // Player starting position (center of walkable area)
    playerWorldX = W / 2;
    playerWorldY = H / 2;
    playerTargetX = playerWorldX;
    playerTargetY = playerWorldY;
    camX = playerWorldX;
    camY = playerWorldY;

    // --- PLAYER DRAWING ---
    function drawPlayer(ctx) {
      const px = playerWorldX;
      const py = playerWorldY;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(px, py + 6, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

      // Ping ring animation
      const t = Date.now() * 0.003;
      const pingR = 14 + Math.sin(t) * 4;
      ctx.strokeStyle = 'rgba(201,164,68,' + (0.3 + Math.sin(t) * 0.15) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(px, py, pingR, 0, Math.PI * 2); ctx.stroke();

      // Avatar circle border
      ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#c9a444'; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#0f0d0b'; ctx.fill();

      // Simple character icon
      ctx.fillStyle = '#c9a444';
      // Head
      ctx.beginPath(); ctx.arc(px, py - 3, 4, 0, Math.PI * 2); ctx.fill();
      // Body
      ctx.fillRect(px - 2, py + 1, 4, 6);
    }

    // --- TOOLTIP STATE ---
    let activeTooltip = null;

    function drawTooltip(ctx) {
      if (!activeTooltip) return;
      const tp = activeTooltip;
      const tw = 180; const th = 60;
      const tx = tp.sx - tw / 2;
      const ty = tp.sy - th - 20;

      // Background
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Draw in screen space
      ctx.fillStyle = 'rgba(10,8,6,0.95)';
      ctx.fillRect(tx, ty, tw, th);
      ctx.strokeStyle = '#c9a444'; ctx.lineWidth = 1;
      ctx.strokeRect(tx, ty, tw, th);

      // Arrow
      ctx.fillStyle = 'rgba(10,8,6,0.95)';
      ctx.beginPath(); ctx.moveTo(tp.sx - 6, ty + th); ctx.lineTo(tp.sx + 6, ty + th); ctx.lineTo(tp.sx, ty + th + 8); ctx.fill();

      // Text
      ctx.fillStyle = '#c9a444'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(tp.name, tx + 8, ty + 18);
      ctx.fillStyle = '#d4c5b0'; ctx.font = '9px sans-serif';
      const words = tp.desc.split(' ');
      let line = ''; let ly = ty + 34;
      for (const w of words) {
        if (ctx.measureText(line + w).width > tw - 16) { ctx.fillText(line, tx + 8, ly); ly += 12; line = ''; }
        line += w + ' ';
      }
      ctx.fillText(line, tx + 8, ly);

      // Enter button
      ctx.fillStyle = '#c9a444'; ctx.fillRect(tx + tw - 50, ty + th - 18, 42, 14);
      ctx.fillStyle = '#0a0806'; ctx.font = 'bold 8px sans-serif';
      ctx.fillText('ENTER', tx + tw - 46, ty + th - 8);
    }

    // --- TOUCH / CLICK HANDLING ---
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const sx = (e.clientX - rect.left) * dpr;
      const sy = (e.clientY - rect.top) * dpr;

      // Check if clicking a tooltip button
      if (activeTooltip) {
        const tp = activeTooltip;
        const tw = 180; const th = 60;
        const tx = tp.sx - tw / 2;
        const ty = tp.sy - th - 20;
        const btnX = tx + tw - 50; const btnY = ty + th - 18;
        if (sx >= btnX && sx <= btnX + 42 && sy >= btnY && sy <= btnY + 14) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'enterLandmark', id: tp.id, name: tp.name
          }));
          activeTooltip = null;
          return;
        }
        activeTooltip = null;
      }

      // Convert to world coords
      const world = screenToWorld(sx, sy);

      // Check landmark hit areas
      for (const lm of landmarkHitAreas) {
        if (world.x >= lm.x && world.x <= lm.x + lm.w && world.y >= lm.y && world.y <= lm.y + lm.h) {
          activeTooltip = { ...lm, sx, sy };
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'landmarkTapped', id: lm.id, name: lm.name
          }));
          return;
        }
      }

      // Otherwise: point-and-click movement
      playerTargetX = Math.max(TILE, Math.min(W - TILE, world.x));
      playerTargetY = Math.max(TILE, Math.min(H - TILE, world.y));
      playerMoving = true;

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'playerMove', x: playerTargetX / W, y: playerTargetY / H
      }));
    }, { passive: false });

    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // --- ZOOM CONTROL (called from React Native) ---
    window.setZoom = function(level) {
      camZoom = Math.max(CAM_ZOOM_MIN, Math.min(CAM_ZOOM_MAX, level));
    };

    // --- RENDER LOOP ---
    function gameLoop() {
      updatePlayerMovement();
      updateCamera();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0f0d0b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      applyCameraTransform(ctx);

      // Draw the pre-rendered static world
      ctx.drawImage(staticCanvas, 0, 0);

      drawPlayer(ctx);

      restoreCameraTransform(ctx);
      drawTooltip(ctx);

      requestAnimationFrame(gameLoop);
    }

    // Kick off
    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>`;
}
