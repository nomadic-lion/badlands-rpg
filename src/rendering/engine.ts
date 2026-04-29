/**
 * engine.ts — Core Rendering Engine
 * 
 * Exports JavaScript code string for the WebView canvas renderer.
 * Contains: Deterministic PRNG, tile grid generation, road network layout,
 * camera/viewport system with zoom support.
 * 
 * World size: 1600×1200px (67×50 tiles at TILE=24)
 * This gives landmarks plenty of room while keeping render performance smooth.
 */

export const ENGINE_JS = `
// ============================================================
// CORE ENGINE — PRNG, Grid, Roads, Camera
// ============================================================

const W = 1600;
const H = 1200;
const TILE = 24;
const cols = Math.floor(W / TILE) + 1;
const rows = Math.floor(H / TILE) + 1;

// Camera state
let camX = W / 2;
let camY = H / 2;
let camZoom = 1.0;
const CAM_ZOOM_MIN = 0.4;
const CAM_ZOOM_MAX = 1.2;

// Player world position (pixels)
let playerWorldX = W / 2;
let playerWorldY = H / 2;
let playerTargetX = W / 2;
let playerTargetY = H / 2;
let playerMoving = false;

function initPRNG(location) {
  let seedState = 0;
  for (let i = 0; i < location.id.length; i++) {
    seedState = (seedState << 5) - seedState + location.id.charCodeAt(i);
    seedState |= 0;
  }
  seedState ^= (location.x * 12345) ^ (location.y * 67890);

  const rand = () => {
    seedState += 0x6D2B79F5;
    let t = Math.imul(seedState ^ seedState >>> 15, seedState | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const randChoice = (arr) => arr[randInt(0, arr.length - 1)];

  return { rand, randInt, randChoice };
}

function generateGrid(location, rng) {
  const { rand, randInt } = rng;
  const grid = Array(cols).fill(0).map(() => Array(rows).fill(0));

  const isCartelBase = location.type === 'cartel_base';
  const isSafezone = location.type === 'safezone';
  const isMountains = location.type === 'rural_mountains';
  const isForest = location.type === 'rural_forest';
  const isLA = location.type === 'city_la';
  const isVegas = location.type === 'city_vegas';
  const isRural = isMountains || isForest;
  const isBeach = location.id === 'la_venice';

  // --- Road Network ---
  const hRoads = [];
  const vRoads = [];
  const ROAD_WIDTH = isRural ? 1 : 3;

  if (isVegas) {
    const stripX = randInt(28, 34);
    vRoads.push(stripX);
    vRoads.push(stripX + 4);
    hRoads.push(randInt(8, 14));
    hRoads.push(randInt(24, 30));
    hRoads.push(randInt(38, 44));
  } else if (isLA) {
    vRoads.push(randInt(12, 18));
    vRoads.push(randInt(32, 38));
    vRoads.push(randInt(50, 56));
    hRoads.push(randInt(8, 14));
    hRoads.push(randInt(24, 30));
    hRoads.push(randInt(38, 44));
  } else {
    if (rand() > (isRural ? 0.6 : 0.2)) hRoads.push(randInt(6, 14));
    hRoads.push(randInt(20, 28));
    if (rand() > (isRural ? 0.8 : 0.4)) hRoads.push(randInt(34, 42));

    vRoads.push(randInt(isBeach ? 20 : 8, isBeach ? 24 : 16));
    if (!isRural || rand() > 0.5) vRoads.push(randInt(28, 38));
    if (rand() > (isRural ? 0.9 : 0.3)) vRoads.push(randInt(46, 56));
  }

  // Beach terrain
  if (isBeach) {
    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < 14; rx++) { grid[rx][ry] = 4; } // Ocean
      for (let rx = 14; rx < 19; rx++) { grid[rx][ry] = 5; } // Sand
    }
  }

  // Lay roads
  hRoads.forEach(ry => {
    for (let rx = 0; rx < cols; rx++) {
      for (let rw = 0; rw < ROAD_WIDTH; rw++) {
        if (ry + rw < rows) grid[rx][ry + rw] = 1;
      }
    }
  });
  vRoads.forEach(rx => {
    for (let ry = 0; ry < rows; ry++) {
      for (let rw = 0; rw < ROAD_WIDTH; rw++) {
        if (rx + rw < cols) grid[rx + rw][ry] = 1;
      }
    }
  });

  return { grid, hRoads, vRoads, ROAD_WIDTH, isCartelBase, isSafezone, isMountains, isForest, isLA, isVegas, isRural, isBeach };
}

function applyCameraTransform(ctx) {
  const cvs = ctx.canvas;
  const viewW = cvs.width;
  const viewH = cvs.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, viewW, viewH);
  ctx.save();
  ctx.translate(viewW / 2, viewH / 2);
  ctx.scale(camZoom, camZoom);
  ctx.translate(-camX, -camY);
}

function restoreCameraTransform(ctx) {
  ctx.restore();
}

function updateCamera() {
  // Smoothly follow player
  camX += (playerWorldX - camX) * 0.1;
  camY += (playerWorldY - camY) * 0.1;
  // Clamp camera to world bounds
  const hw = (canvas.width / 2) / camZoom;
  const hh = (canvas.height / 2) / camZoom;
  camX = Math.max(hw, Math.min(W - hw, camX));
  camY = Math.max(hh, Math.min(H - hh, camY));
}

function screenToWorld(sx, sy) {
  const cvs = canvas;
  const wx = (sx - cvs.width / 2) / camZoom + camX;
  const wy = (sy - cvs.height / 2) / camZoom + camY;
  return { x: wx, y: wy };
}

function updatePlayerMovement() {
  if (!playerMoving) return;
  const dx = playerTargetX - playerWorldX;
  const dy = playerTargetY - playerWorldY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 2) {
    playerWorldX = playerTargetX;
    playerWorldY = playerTargetY;
    playerMoving = false;
    return;
  }
  const speed = 3.0;
  playerWorldX += (dx / dist) * speed;
  playerWorldY += (dy / dist) * speed;
}
`;
