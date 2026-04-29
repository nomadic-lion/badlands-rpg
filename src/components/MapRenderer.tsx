import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { GameLocation } from '../lib/types';

interface MapRendererProps {
  location?: GameLocation;
  hour: number;
}

export function MapRenderer({ location, hour }: MapRendererProps) {
  const webViewRef = useRef<WebView>(null);
  const [playerPos, setPlayerPos] = useState({ x: '50%', y: '50%' });

  useEffect(() => {
    setPlayerPos({ x: '50%', y: '50%' });
  }, [location?.id]);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #0f0d0b;
      overflow: hidden;
    }
    canvas {
      width: 100%;
      height: 100%;
      object-fit: cover;
      image-rendering: pixelated;
    }
    .grid-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      opacity: 0.2;
      mix-blend-mode: overlay;
      background-image: radial-gradient(#3d3228 1px, transparent 1px);
      background-size: 16px 16px;
    }
    .scanline-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      opacity: 0.03;
      background: linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,1) 50%);
      background-size: 100% 4px;
    }
  </style>
</head>
<body>
  <canvas id="mapCanvas" width="800" height="600"></canvas>
  <div class="grid-overlay"></div>
  <div class="scanline-overlay"></div>
  <script>
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    function renderMap(ctx, location, hour) {
      if (!location) return;
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

      const W = 800;
      const H = 600;
      const TILE = 24;
      const cols = Math.floor(W / TILE) + 1;
      const rows = Math.floor(H / TILE) + 1;

      const grid = Array(cols).fill(0).map(() => Array(rows).fill(0));

      const isCartelBase = location.type === 'cartel_base';
      const isSafezone = location.type === 'safezone';
      const isMountains = location.type === 'rural_mountains';
      const isForest = location.type === 'rural_forest';
      const isLA = location.type === 'city_la';
      const isVegas = location.type === 'city_vegas';
      const isRural = isMountains || isForest;
      const isBeach = location.id === 'la_venice';

      const hRoads = [];
      const vRoads = [];
      const ROAD_WIDTH = isRural ? 1 : 3;

      if (isVegas) {
          const stripX = randInt(14, 16);
          vRoads.push(stripX);
          vRoads.push(stripX + 2); 
          hRoads.push(randInt(4, 8));
          hRoads.push(randInt(18, 22));
      } else if (isLA) {
          vRoads.push(randInt(8, 12));
          vRoads.push(randInt(20, 24));
          hRoads.push(randInt(6, 10));
          hRoads.push(randInt(16, 20));
      } else {
          if (rand() > (isRural ? 0.6 : 0.2)) hRoads.push(randInt(3, 8));
          hRoads.push(randInt(12, 16));
          if (rand() > (isRural ? 0.8 : 0.4)) hRoads.push(randInt(20, 24));

          vRoads.push(randInt(isBeach ? 12 : 4, isBeach ? 14 : 9));
          if (!isRural || rand() > 0.5) vRoads.push(randInt(16, 19));
          if (rand() > (isRural ? 0.9 : 0.3)) vRoads.push(randInt(24, 29));
      }
      
      if (isBeach) {
          for(let ry=0; ry<rows; ry++){
              for(let rx=0; rx<8; rx++){ grid[rx][ry] = 4; }
              for(let rx=8; rx<11; rx++){ grid[rx][ry] = 5; }
          }
      }
      hRoads.forEach(ry => {
          for(let rx=0; rx<cols; rx++) {
              for(let rw=0; rw<ROAD_WIDTH; rw++) {
                  if(ry+rw < rows) grid[rx][ry+rw] = 1;
              }
          }
      });
      vRoads.forEach(rx => {
          for(let ry=0; ry<rows; ry++) {
              for(let rw=0; rw<ROAD_WIDTH; rw++) {
                  if(rx+rw < cols) grid[rx+rw][ry] = 1;
              }
          }
      });

      const buildings = [];
      const nature = [];
      const buildingChance = isRural ? 0.05 : (isVegas || isLA ? 0.9 : 0.7);
      const natureChance = isForest ? 0.6 : (isMountains ? 0.4 : (isLA ? 0.05 : 0.02));

      for (let by = 1; by < rows - 3; by++) {
          for (let bx = 1; bx < cols - 3; bx++) {
              let free = true;
              let w = randInt(isRural ? 2 : 3, isRural ? 4 : 6);
              let d = randInt(isRural ? 2 : 3, isRural ? 3 : 5);
              
              if (isLA) { w = randInt(3, 7); d = randInt(4, 7); } 
              else if (isVegas) { w = randInt(5, 10); d = randInt(5, 9); }
              if (bx + w >= cols || by + d >= rows) continue;

              for (let i = -1; i <= w; i++) {
                  for (let j = -1; j <= d; j++) {
                      if (bx+i>=0 && bx+i<cols && by+j>=0 && by+j<rows) {
                          if (grid[bx+i][by+j] !== 0) free = false;
                      }
                  }
              }
              if (free) {
                  if (rand() < buildingChance) {
                      for (let i = 0; i < w; i++) {
                          for (let j = 0; j < d; j++) { grid[bx + i][by + j] = 2; }
                      }
                      const h = isRural ? randInt(1, 2) : (isVegas ? randInt(5, 14) : (isLA ? randInt(3, 10) : randInt(2, 6)));
                      
                      const litWindows = [];
                      for(let wx=0; wx<w; wx++){
                          for(let wy=0; wy<h; wy++){
                              const litChance = isVegas ? 0.7 : (isLA ? 0.4 : (isSafezone ? 0.6 : 0.2));
                              if (rand() < litChance) litWindows.push(wx + "," + wy);
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
                          else if (rand() > 0.7 && location?.id === 'la_venice') bStyle = 'beach_house';
                          else bStyle = 'concrete_modern';
                          neonColor = randChoice(['#ff3333', '#c9a444', '#00ccff']);
                      }
                      if (grid[bx][by] === 5 || (grid[bx-1] && grid[bx-1][by] === 5)) bStyle = 'beach_house';

                      buildings.push({ x: bx, y: by, w, d, h, litWindows, style: bStyle, neonColor });
                  } else if (rand() < natureChance) {
                      if (bx + 1 < cols && by + 1 < rows && grid[bx][by] === 0 && grid[bx+1][by] === 0 && grid[bx][by+1] === 0 && grid[bx+1][by+1] === 0) {
                          grid[bx][by] = 3; grid[bx+1][by] = 3; grid[bx][by+1] = 3; grid[bx+1][by+1] = 3;
                          nature.push({ x: bx, y: by, type: isForest ? 'tree' : (isLA ? 'palm' : 'rock'), size: randInt(1, 3) });
                      }
                  }
              }
          }
      }

      const isNight = hour < 6 || hour > 19;
      const isDusk = hour === 6 || hour === 19 || hour === 18;
      
      ctx.fillStyle = isNight ? '#0a0806' : '#14110e';
      ctx.fillRect(0, 0, W, H);

      for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
              const px = x * TILE;
              const py = y * TILE;
              
              if (grid[x][y] === 4) {
                  ctx.fillStyle = isNight ? '#031424' : '#1a4b66';
                  ctx.fillRect(px, py, TILE, TILE);
                  if (rand() > 0.8) {
                      ctx.fillStyle = isNight ? '#072b4c' : '#297a99';
                      ctx.fillRect(px + randInt(0, TILE-4), py + randInt(0, TILE-2), 4, 2);
                  }
              } else if (grid[x][y] === 5) {
                  ctx.fillStyle = isNight ? '#1e1c15' : '#d1bd94';
                  ctx.fillRect(px, py, TILE, TILE);
                  if (rand() > 0.8) {
                      ctx.fillStyle = isNight ? '#2b291f' : '#b29c72';
                      ctx.fillRect(px + randInt(0, TILE-2), py + randInt(0, TILE-2), 2, 2);
                  }
              } else if (grid[x][y] === 1) {
                  if (isRural) {
                      ctx.fillStyle = isNight ? '#14110e' : '#2a241d';
                      ctx.fillRect(px, py, TILE, TILE);
                  } else {
                      ctx.fillStyle = isNight ? '#0f0d0b' : '#1a1815';
                      ctx.fillRect(px, py, TILE, TILE);
                      for(let k=0; k<2; k++) {
                          if (rand() < 0.3) {
                              ctx.fillStyle = '#0a0907';
                              ctx.fillRect(px + randInt(0, TILE-2), py + randInt(0, TILE-2), randInt(1,3), randInt(1,3));
                          }
                      }
                      if (hRoads.some(ry => ry + 1 === y) && (x % 2 === 0)) {
                          ctx.fillStyle = isNight ? '#4a3d1b' : '#c9a444';
                          ctx.globalAlpha = 0.4;
                          ctx.fillRect(px + TILE/4, py + TILE/2 - 1, TILE/2, 2);
                          ctx.globalAlpha = 1.0;
                      }
                      if (vRoads.some(rx => rx + 1 === x) && (y % 2 === 0)) {
                          ctx.fillStyle = isNight ? '#4a3d1b' : '#c9a444';
                          ctx.globalAlpha = 0.4;
                          ctx.fillRect(px + TILE/2 - 1, py + TILE/4, 2, TILE/2);
                          ctx.globalAlpha = 1.0;
                      }
                      if (x % 4 === 0 && y % 4 === 0 && rand() > 0.5) {
                          ctx.fillStyle = '#0f0d0b';
                          ctx.fillRect(px + TILE/2, py + TILE/2, 2, 8); 
                          const lampColor = (isVegas || isLA) ? '#f1c40f' : '#c9a444';
                          if (isNight || isDusk) {
                              ctx.fillStyle = lampColor;
                              ctx.globalAlpha = isNight ? 0.3 : 0.1;
                              ctx.beginPath();
                              ctx.arc(px + TILE / 2, py + TILE / 2 + 8, TILE * 1.5, 0, Math.PI * 2);
                              ctx.fill();
                              ctx.globalAlpha = 1.0;
                              ctx.fillStyle = '#fff';
                              ctx.beginPath(); ctx.arc(px + TILE/2 + 1, py + TILE/2, 2, 0, Math.PI*2); ctx.fill();
                          }
                      }
                  }
              } else if (grid[x][y] === 0 || grid[x][y] === 3 || grid[x][y] === 2) {
                  if (isForest) ctx.fillStyle = isNight ? '#0c120a' : '#182414';
                  else if (isMountains) ctx.fillStyle = isNight ? '#110c08' : '#261c14';
                  else ctx.fillStyle = isNight ? '#13110e' : '#221f1a';
                  ctx.fillRect(px, py, TILE, TILE);
                  for(let k=0; k<3; k++) {
                      if (rand() < 0.5) {
                          if (isForest) ctx.fillStyle = randChoice(['#1e2b17', '#101a0d', '#2d4c1e']);
                          else if (isMountains) ctx.fillStyle = randChoice(['#3b2f21', '#1c140d', '#4a3927']);
                          else ctx.fillStyle = randChoice(['#2a241d', '#3d3228', '#1a1612']);
                          const size = randInt(1, 4);
                          ctx.fillRect(px + randInt(0, TILE-size), py + randInt(0, TILE-size), size, size);
                      }
                  }
              }
          }
      }

      const numCars = randInt(8, 15);
      for (let c=0; c<numCars; c++) {
          const cx = randInt(1, cols-2);
          const cy = randInt(1, rows-2);
          if (grid[cx][cy] === 1) {
              ctx.save();
              ctx.translate(cx*TILE + TILE/2, cy*TILE + TILE/2);
              ctx.rotate(rand() * Math.PI * 2);
              ctx.fillStyle = randChoice(['#8b2b22', '#2a241d', '#3d3228', '#426477']); 
              ctx.fillRect(-12, -6, 24, 12);
              ctx.fillStyle = '#0f0d0b';
              ctx.fillRect(-4, -5, 10, 10);
              ctx.restore();
          }
      }

      const entities = [];
      buildings.forEach(b => entities.push({ yBottom: b.y + b.d, type: 'building', obj: b }));
      nature.forEach(n => entities.push({ yBottom: n.y + 2, type: 'nature', obj: n }));
      entities.sort((a, b) => a.yBottom - b.yBottom);

      for (const ent of entities) {
          if (ent.type === 'nature') {
              const n = ent.obj;
              const px = n.x * TILE;
              const py = n.y * TILE;
              
              if (n.type === 'tree') {
                  ctx.fillStyle = 'rgba(0,0,0,0.6)';
                  ctx.beginPath(); ctx.ellipse(px + TILE, py + TILE*1.5, TILE, TILE*0.5, 0, 0, Math.PI*2); ctx.fill();
                  ctx.fillStyle = '#261b12';
                  ctx.fillRect(px + TILE - 4, py + TILE, 8, TILE);
                  const canopyBaseColor = isNight ? '#0b160a' : '#1e3816';
                  const canopyMidColor = isNight ? '#122610' : '#2b5220';
                  const canopyTopColor = isNight ? '#193616' : '#3d732d';
                  ctx.fillStyle = canopyBaseColor; ctx.beginPath(); ctx.arc(px + TILE, py + TILE - n.size*4, TILE*1.2 + n.size*4, 0, Math.PI*2); ctx.fill();
                  ctx.fillStyle = canopyMidColor; ctx.beginPath(); ctx.arc(px + TILE, py + TILE - n.size*6 - 4, TILE + n.size*2, 0, Math.PI*2); ctx.fill();
                  ctx.fillStyle = canopyTopColor; ctx.beginPath(); ctx.arc(px + TILE - 4, py + TILE - n.size*8 - 8, TILE*0.7, 0, Math.PI*2); ctx.fill();
              } else if (n.type === 'palm') {
                  ctx.fillStyle = 'rgba(0,0,0,0.6)';
                  ctx.beginPath(); ctx.ellipse(px + TILE, py + TILE*1.5, TILE*0.6, TILE*0.3, 0, 0, Math.PI*2); ctx.fill();
                  ctx.fillStyle = '#3a2d21';
                  ctx.beginPath(); ctx.moveTo(px + TILE - 2, py + TILE*1.5); ctx.lineTo(px + TILE + 2, py + TILE*1.5); ctx.lineTo(px + TILE + 1, py - TILE); ctx.lineTo(px + TILE - 1, py - TILE); ctx.fill();
                  const palmColor = isNight ? '#0f2411' : '#326639';
                  ctx.fillStyle = palmColor;
                  for(let f=0; f<5; f++) {
                      ctx.save();
                      ctx.translate(px + TILE, py - TILE);
                      ctx.rotate((Math.PI * 2 / 5) * f + (n.size * 0.5));
                      ctx.beginPath(); ctx.ellipse(0, TILE*0.5, 3, TILE*0.8, 0, 0, Math.PI*2); ctx.fill();
                      ctx.restore();
                  }
              } else {
                  ctx.fillStyle = 'rgba(0,0,0,0.5)';
                  ctx.beginPath(); ctx.ellipse(px + TILE, py + TILE*1.5, TILE*1.2, TILE*0.6, 0, 0, Math.PI*2); ctx.fill();
                  ctx.fillStyle = isNight ? '#141414' : '#2e2b29';
                  ctx.beginPath(); ctx.moveTo(px, py + TILE*1.5); ctx.lineTo(px + TILE*0.5, py + TILE - n.size*6); ctx.lineTo(px + TILE*1.5, py + TILE*0.5 - n.size*8); ctx.lineTo(px + TILE*2, py + TILE*1.5); ctx.fill();
                  ctx.fillStyle = isNight ? '#1f1f1f' : '#4a4642';
                  ctx.beginPath(); ctx.moveTo(px + TILE*0.5, py + TILE*1.3); ctx.lineTo(px + TILE*0.8, py + TILE - n.size*4); ctx.lineTo(px + TILE*1.3, py + TILE*0.8 - n.size*6); ctx.lineTo(px + TILE*1.5, py + TILE*1.5); ctx.fill();
              }
              continue;
          }

          const b = ent.obj;
          const px = b.x * TILE;
          const py = b.y * TILE;
          const pw = b.w * TILE;
          const pd = b.d * TILE;
          const ph = b.h * TILE * 0.7;
          const roofY = py - ph;
          const wallY = py + pd - ph;

          if (b.style === 'pyramid') {
              const peakX = px + pw/2;
              const peakY = py + pd/2 - ph * 1.5;
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.beginPath(); ctx.moveTo(px + pw, py); ctx.lineTo(px + pw + ph*1.5, py + ph*0.5); ctx.lineTo(px + pw + ph*1.5, py + pd + ph*0.5); ctx.lineTo(px + pw, py + pd); ctx.fill();
              ctx.fillStyle = isNight ? '#0a0a0a' : '#1f1a14';
              ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + pd); ctx.lineTo(peakX, peakY); ctx.fill();
              const grad = ctx.createLinearGradient(px, py + pd, peakX, peakY);
              grad.addColorStop(0, isNight ? '#1f1b16' : '#2a241d'); grad.addColorStop(1, '#110f0c');
              ctx.fillStyle = grad;
              ctx.beginPath(); ctx.moveTo(px, py + pd); ctx.lineTo(px + pw, py + pd); ctx.lineTo(peakX, peakY); ctx.fill();
              const gradRight = ctx.createLinearGradient(px + pw, py + pd, peakX, peakY);
              gradRight.addColorStop(0, isNight ? '#14120e' : '#1c1813'); gradRight.addColorStop(1, '#0a0806');
              ctx.fillStyle = gradRight;
              ctx.beginPath(); ctx.moveTo(px + pw, py); ctx.lineTo(px + pw, py + pd); ctx.lineTo(peakX, peakY); ctx.fill();
              if (isNight && b.neonColor) {
                   ctx.strokeStyle = b.neonColor; ctx.lineWidth = 1.5; ctx.shadowColor = b.neonColor; ctx.shadowBlur = 15;
                   ctx.beginPath(); ctx.moveTo(px, py + pd); ctx.lineTo(peakX, peakY); ctx.lineTo(px + pw, py + pd); ctx.moveTo(px + pw, py + pd); ctx.lineTo(px + pw, py); ctx.lineTo(peakX, peakY); ctx.moveTo(px, py + pd); ctx.lineTo(px, py); ctx.lineTo(peakX, peakY); ctx.stroke();
                   ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(peakX, peakY, 4, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
              }
              continue; 
          }

          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.beginPath(); ctx.moveTo(px + pw, py); ctx.lineTo(px + pw + ph*1.2, py + ph*0.5); ctx.lineTo(px + pw + ph*1.2, py + pd + ph*0.5); ctx.lineTo(px + pw, py + pd); ctx.fill();

          let wallTop = '#2a241d', wallBot = '#1a1612', roofTop = '#3d3228', roofBot = '#221f1a', unlitWin = '#0a0806', dayWin = '#426477', winFrame = '#1a1815';

          if (b.style === 'concrete' || b.style === 'concrete_modern') { wallTop = '#4a4a4a'; wallBot = '#232323'; roofTop = '#333333'; roofBot = '#111111'; } 
          else if (b.style === 'glass') { wallTop = '#1a3b4d'; wallBot = '#051119'; roofTop = '#112233'; roofBot = '#051119'; unlitWin = '#051119'; dayWin = '#2a5b7d'; winFrame = '#0c1b24'; } 
          else if (b.style === 'vegas_gold') { wallTop = '#664d1a'; wallBot = '#332100'; roofTop = '#4d3913'; roofBot = '#1f1604'; unlitWin = '#1f1604'; dayWin = '#806020'; winFrame = '#33260d'; } 
          else if (b.style === 'beach_house') { wallTop = '#d1c4b2'; wallBot = '#9c9285'; roofTop = '#b5543c'; roofBot = '#803826'; winFrame = '#8c7e6c'; }

          const wallGrad = ctx.createLinearGradient(px, wallY, px, wallY + ph);
          wallGrad.addColorStop(0, wallTop); wallGrad.addColorStop(1, wallBot);
          ctx.fillStyle = wallGrad; ctx.fillRect(px, wallY, pw, ph);

          if (b.style !== 'glass' && b.style !== 'vegas_gold') {
              for(let w=4; w<pw; w+=8) {
                  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(px + w, wallY, randInt(1,3), ph);
              }
          }

          const winCols = b.w;
          const winRows = Math.floor(b.h * 0.7);
          const winWidth = 10;
          const winHeight = 12;

          for (let wx = 0; wx < winCols; wx++) {
              for (let wy = 0; wy < winRows; wy++) {
                  const isLit = b.litWindows.includes(wx + "," + wy);
                  const winBaseX = px + wx * TILE + (TILE - winWidth) / 2;
                  const winBaseY = wallY + wy * TILE + (TILE - winHeight) / 2 + 4;
                  
                  if (isLit && isNight) {
                      let glowColor = randChoice(['#c9a444', '#f1c40f', '#e67e22', '#8b2b22']);
                      if (b.style === 'glass') glowColor = randChoice(['#a8d5e5', '#f1c40f', '#c9a444', '#2980b9']);
                      if (b.style === 'vegas_gold') glowColor = randChoice(['#ffeaa7', '#f1c40f', '#e67e22']);
                      if (isVegas) glowColor = randChoice([glowColor, '#00ffcc', '#ff00ff', '#39ff14']);
                      
                      ctx.fillStyle = '#fff'; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight);
                      ctx.fillStyle = glowColor; ctx.globalCompositeOperation = 'multiply'; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight); ctx.globalCompositeOperation = 'source-over';
                      if (wy === winRows - 1) { 
                           ctx.fillStyle = glowColor; ctx.globalAlpha = b.style === 'glass' ? 0.3 : 0.15;
                           ctx.beginPath(); ctx.moveTo(winBaseX, winBaseY + winHeight); ctx.lineTo(winBaseX + winWidth, winBaseY + winHeight); ctx.lineTo(winBaseX + winWidth + 12, py + pd + 24); ctx.lineTo(winBaseX - 12, py + pd + 24); ctx.fill(); ctx.globalAlpha = 1.0;
                      }
                  } else if (!isNight && isLit) {
                      ctx.fillStyle = dayWin; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight);
                      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(winBaseX, winBaseY); ctx.lineTo(winBaseX+5, winBaseY); ctx.lineTo(winBaseX, winBaseY+5); ctx.fill();
                  } else {
                      ctx.fillStyle = unlitWin; ctx.fillRect(winBaseX, winBaseY, winWidth, winHeight);
                      ctx.fillStyle = winFrame; ctx.fillRect(winBaseX, winBaseY, winWidth, 2);
                      if (rand() > 0.5 && b.style !== 'glass' && b.style !== 'vegas_gold') {
                          ctx.fillStyle = dayWin; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(winBaseX, winBaseY+winHeight); ctx.lineTo(winBaseX+3, winBaseY+winHeight); ctx.lineTo(winBaseX, winBaseY+winHeight-3); ctx.fill(); ctx.globalAlpha = 1.0;
                      }
                  }
              }
          }

          const roofGrad = ctx.createLinearGradient(px, roofY, px + pw, roofY + pd);
          roofGrad.addColorStop(0, roofTop); roofGrad.addColorStop(1, roofBot);
          ctx.fillStyle = roofGrad; ctx.fillRect(px, roofY, pw, pd);
          ctx.strokeStyle = winFrame; ctx.lineWidth = 3; ctx.strokeRect(px + 1.5, roofY + 1.5, pw - 3, pd - 3);
          ctx.strokeStyle = roofTop; ctx.lineWidth = 1; ctx.strokeRect(px, roofY, pw, pd);

          if ((b.style === 'glass' || b.style === 'concrete_modern') && b.h >= 6) {
              ctx.fillStyle = '#1a1815'; ctx.fillRect(px + pw/2 - 1, roofY - 20, 2, 20);
              if (isNight && rand() > 0.5) { ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(px + pw/2, roofY - 20, 2, 0, Math.PI*2); ctx.fill(); }
          }

          const numHVAC = randInt(1, Math.floor((b.w * b.d) / 4));
          for(let i=0; i<numHVAC; i++) {
              const hx = px + randInt(4, pw - 16); const hy = roofY + randInt(4, pd - 16);
              ctx.fillStyle = '#0a0806'; ctx.fillRect(hx, hy+3, 12, 10);
              ctx.fillStyle = '#4a4c4d'; ctx.fillRect(hx, hy, 12, 10);
              ctx.fillStyle = '#0f0d0b'; ctx.beginPath(); ctx.arc(hx+6, hy+5, 4, 0, Math.PI*2); ctx.fill();
              if (rand() > 0.5) { ctx.strokeStyle = '#1a1815'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx+6, hy+10); const pipeLen = randInt(5, 15); ctx.lineTo(hx+6, hy+10 + pipeLen); ctx.stroke(); }
          }

          if (isVegas || isLA) {
              if (rand() > 0.6 && pw >= 90 && pd >= 90) {
                  ctx.fillStyle = '#1a1612'; ctx.fillRect(px + pw/2 - 22, roofY + pd/2 - 22, 44, 44);
                  ctx.fillStyle = isNight ? '#003344' : '#0099cc'; ctx.fillRect(px + pw/2 - 20, roofY + pd/2 - 20, 40, 40);
                  if (isNight) { ctx.fillStyle = '#00ffff'; ctx.globalAlpha = 0.2; ctx.fillRect(px + pw/2 - 20, roofY + pd/2 - 20, 40, 40); ctx.globalAlpha = 1.0; }
              } else if (rand() > 0.7 && pw >= 70 && pd >= 70) {
                  ctx.strokeStyle = '#c9a444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px + pw/2, roofY + pd/2, 16, 0, Math.PI * 2); ctx.stroke();
                  ctx.fillStyle = '#c9a444'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H', px + pw/2, roofY + pd/2);
              }
          }

          if ((b.style === 'glass' || b.style === 'vegas_gold' || isVegas || isLA) && isNight && b.neonColor) {
              const signColor = b.neonColor;
              const signEdgeX = px + (rand() > 0.5 ? 0 : pw - 8);
              if ((b.style === 'glass' || b.style === 'vegas_gold') && rand() > 0.3) {
                 ctx.strokeStyle = signColor; ctx.lineWidth = 2; ctx.shadowColor = signColor; ctx.shadowBlur = 10;
                 ctx.strokeRect(px, wallY + ph*0.2, pw, 2); if (b.h > 4) ctx.strokeRect(px, wallY + ph*0.6, pw, 2); ctx.shadowBlur = 0;
              }
              if (rand() > 0.5) {
                ctx.fillStyle = '#111'; ctx.fillRect(signEdgeX, roofY + ph*0.2, 8, ph*0.6);
                ctx.fillStyle = signColor; ctx.shadowColor = signColor; ctx.shadowBlur = 10;
                for(let sy = roofY + ph*0.25; sy < roofY + ph*0.75; sy += 8) { ctx.fillRect(signEdgeX + 2, sy, 4, 4); }
                ctx.shadowBlur = 0; 
              }
          }
          for(let i=0; i<pw*pd/100; i++) {
              ctx.fillStyle = randChoice(['#1a1612', '#0a0806']); ctx.fillRect(px + randInt(2, pw-4), roofY + randInt(2, pd-4), 2, 2);
          }
      }

      if (isCartelBase) {
          for (let i = 0; i < 5; i++) {
              const x = randInt(W/4, W - W/4); const y = randInt(H/4, H - H/4);
              ctx.fillStyle = '#4a4336'; ctx.fillRect(x, y, 30, 8);
              ctx.fillStyle = '#3b352b'; ctx.fillRect(x+2, y-6, 26, 6);
          }
      }

      const vignette = ctx.createRadialGradient(W/2, H/2, H/4, W/2, H/2, W*0.8);
      vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vignette; ctx.fillRect(0,0,W,H);

      if (isNight) { ctx.fillStyle = 'rgba(6, 12, 24, 0.4)'; ctx.fillRect(0,0,W,H); } 
      else if (isDusk) { ctx.fillStyle = 'rgba(201, 164, 68, 0.2)'; ctx.fillRect(0,0,W,H); } 
      else { ctx.fillStyle = 'rgba(139, 43, 34, 0.08)'; ctx.fillRect(0,0,W,H); }
    }

    // Call renderMap on page load
    window.onload = () => {
       renderMap(ctx, ${JSON.stringify(location)}, ${hour});
    };

    // To prevent any rubber-banding on iOS
    document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView 
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        scrollEnabled={false}
        bounces={false}
        style={styles.webview}
        onMessage={(event) => {
          // Future interactivity can go here
        }}
      />
      {/* Player Avatar Overlay */}
      <View style={[styles.playerContainer, { left: playerPos.x as any, top: playerPos.y as any }]}>
        <View style={styles.pingEffect} />
        <View style={styles.avatarBorder}>
          <Image source={{ uri: "https://i.ibb.co/mFSFqfh4/el-x4.jpg" }} style={styles.avatarImage} />
        </View>
        <View style={styles.nameTagContainer}>
          <Text style={styles.nameTagText}>{location?.name || 'UNKNOWN'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0d0b',
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#3d3228',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  playerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }], // Center the 32x32 avatar
    pointerEvents: 'none',
    zIndex: 20,
  },
  pingEffect: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(201, 164, 68, 0.6)',
    // In React Native, complex animations like CSS ping usually require Reanimated or Animated API.
    // For now we'll represent it with a static ring to keep styling robust. 
    opacity: 0.5,
  },
  avatarBorder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c9a444',
    overflow: 'hidden',
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow simulation
    elevation: 10,
    shadowColor: '#c9a444',
    shadowOpacity: 0.8,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameTagContainer: {
    position: 'absolute',
    top: 40,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(201,164,68,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  nameTagText: {
    color: '#c9a444',
    fontFamily: 'JetBrainsMono',
    fontSize: 9,
    textTransform: 'uppercase',
  }
});
