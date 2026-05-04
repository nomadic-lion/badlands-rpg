import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { GameLocation } from '../lib/types';
import { WORLD_MAP_B64 } from '../rendering/worldMapAssets';

interface WorldMapProps {
  locations: GameLocation[];
  currentLocationId: string;
  onTravel?: (locationId: string) => void;
}

export function WorldMap({ locations, currentLocationId, onTravel }: WorldMapProps) {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'travel' && onTravel) {
        onTravel(data.locationId);
      }
    } catch (e) {}
  }, [onTravel]);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    body { margin:0; padding:0; background:#0f0d0b; overflow:hidden; touch-action:none; font-family: 'Inter', sans-serif; }
    canvas { width:100%; height:100%; display:block; }
    .ui-overlay { position:absolute; top:20px; left:20px; color:#c9a444; pointer-events:none; }
    
    #tooltip {
      position: absolute;
      background: rgba(15, 13, 11, 0.95);
      border: 1.5px solid #c9a444;
      padding: 16px;
      color: #d4c5b0;
      width: 240px;
      display: none;
      pointer-events: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(201,164,68,0.2);
      border-radius: 4px;
      z-index: 100;
    }
    .tooltip-header { 
      font-size: 14px; 
      font-weight: bold; 
      color: #c9a444; 
      margin-bottom: 8px; 
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(201,164,68,0.3);
      padding-bottom: 6px;
    }
    .tooltip-desc { font-size: 11px; line-height: 1.4; margin-bottom: 16px; opacity: 0.8; }
    .tooltip-actions { display: flex; gap: 8px; }
    .btn {
      flex: 1;
      padding: 8px;
      border: 1px solid #c9a444;
      background: transparent;
      color: #c9a444;
      font-size: 10px;
      font-weight: bold;
      text-align: center;
      cursor: pointer;
      letter-spacing: 1px;
      transition: all 0.2s;
    }
    .btn-primary { background: #c9a444; color: #000; }
    .btn:active { opacity: 0.7; transform: scale(0.98); }
  </style>
</head>
<body>
  <canvas id="worldMapCanvas"></canvas>
  <div class="ui-overlay">
    <div style="font-size:10px; letter-spacing:3px; opacity:0.5;">SATELLITE_LINK_ENCRYPTED</div>
    <div style="font-size:20px; font-weight:900; letter-spacing:2px; color:#c9a444;">TACTICAL_OVERVIEW</div>
  </div>
  
  <div id="tooltip">
    <div id="tooltip-title" class="tooltip-header">LOCATION_NAME</div>
    <div id="tooltip-desc" class="tooltip-desc">Description of the sector goes here.</div>
    <div class="tooltip-actions">
      <div id="btn-travel" class="btn btn-primary">ENTER SECTOR</div>
      <div id="btn-close" class="btn">CLOSE</div>
    </div>
  </div>
  <script>
    const canvas = document.getElementById('worldMapCanvas');
    const ctx = canvas.getContext('2d');
    const locations = ${JSON.stringify(locations)};
    const currentId = "${currentLocationId}";
    
    const mapImg = new Image();
    mapImg.src = "${WORLD_MAP_B64}";

    const tooltip = document.getElementById('tooltip');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipDesc = document.getElementById('tooltip-desc');
    const btnTravel = document.getElementById('btn-travel');
    const btnClose = document.getElementById('btn-close');

    let width, height;
    let camX = 1000, camY = 1000, camZoom = 0.5;
    let isDragging = false, lastX, lastY;
    let selectedLoc = null;

    // Mapping coordinates to visual features on the tactical map
    const MAP_SCALE = 128;
    const MAP_OFFSET_X = 0;
    const MAP_OFFSET_Y = 0;

    function worldToPx(x, y) {
      return {
        x: x * MAP_SCALE - (MAP_SCALE / 2),
        y: y * MAP_SCALE - (MAP_SCALE / 2)
      };
    }

    function resize() {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      width = canvas.width;
      height = canvas.height;
    }
    window.onresize = resize;
    resize();

    // Center on current location initially
    const currentLoc = locations.find(l => l.id === currentId);
    if (currentLoc) {
      const pos = worldToPx(currentLoc.x, currentLoc.y);
      camX = pos.x;
      camY = pos.y;
      camZoom = 0.8;
    }

    function draw() {
      ctx.setTransform(1,0,0,1,0,0);
      ctx.fillStyle = '#0a0806';
      ctx.fillRect(0, 0, width, height);

      ctx.translate(width/2, height/2);
      ctx.scale(camZoom, camZoom);
      ctx.translate(-camX, -camY);

      if (mapImg.complete) {
        ctx.drawImage(mapImg, 0, 0, 2048, 2048);
      }

      // Draw Grid
      ctx.strokeStyle = 'rgba(201,164,68,0.15)';
      ctx.lineWidth = 1 / camZoom;
      ctx.font = 'bold 30px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(201,164,68,0.4)';
      ctx.textAlign = 'center';

      for(let i=0; i<=2048; i+=128) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 2048); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(2048, i); ctx.stroke();
        
        // Grid Labels (A-P and 1-16)
        if (i < 2048) {
          const letter = String.fromCharCode(65 + i/128);
          const num = (i/128) + 1;
          ctx.fillText(letter, i + 64, -20); // Top labels
          ctx.fillText(letter, i + 64, 2048 + 40); // Bottom labels
          ctx.textAlign = 'right';
          ctx.fillText(num.toString(), -20, i + 74); // Left labels
          ctx.textAlign = 'left';
          ctx.fillText(num.toString(), 2048 + 20, i + 74); // Right labels
          ctx.textAlign = 'center';
        }
      }

      // Draw Markers
      locations.forEach(loc => {
        const pos = worldToPx(loc.x, loc.y);
        const px = pos.x;
        const py = pos.y;
        const isCurrent = loc.id === currentId;
        const isSelected = selectedLoc && loc.id === selectedLoc.id;

        ctx.save();
        ctx.translate(px, py);

        // Selection / Current Highlight
        if (isCurrent || isSelected) {
          const pulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
          ctx.beginPath();
          ctx.arc(0, 0, 40 + pulse * 15, 0, Math.PI*2);
          ctx.strokeStyle = isCurrent ? 'rgba(201,164,68,0.6)' : 'rgba(212,197,176,0.4)';
          ctx.lineWidth = 3 / camZoom;
          ctx.stroke();
          
          // Outer ring
          ctx.beginPath();
          ctx.arc(0, 0, 60 + pulse * 5, 0, Math.PI*2);
          ctx.setLineDash([10, 10]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Tactical Marker Shape (Larger and more detailed)
        const size = 25;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        
        ctx.fillStyle = isCurrent ? '#c9a444' : '#d4c5b0';
        ctx.shadowBlur = 20;
        ctx.shadowColor = isCurrent ? 'rgba(201,164,68,1)' : 'rgba(0,0,0,0.8)';
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner detail
        ctx.beginPath();
        ctx.arc(0, 0, size/3, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
        
        ctx.restore();

        // Label
        ctx.fillStyle = isCurrent ? '#c9a444' : '#d4c5b0';
        ctx.font = isCurrent ? 'bold 22px "Inter", sans-serif' : '18px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'black';
        
        const labelText = loc.name.toUpperCase();
        ctx.fillText(labelText, px, py - size - 15);
        
        if (isCurrent) {
          ctx.font = '900 11px "Inter", sans-serif';
          ctx.fillText("OPERATIVE_LOC", px, py + size + 20);
        }
      });

      // Update Tooltip position if active
      if (selectedLoc) {
        const pos = worldToPx(selectedLoc.x, selectedLoc.y);
        const screenX = (pos.x - camX) * camZoom + width / 2;
        const screenY = (pos.y - camY) * camZoom + height / 2;
        
        tooltip.style.left = (screenX / window.devicePixelRatio - 120) + 'px';
        tooltip.style.top = (screenY / window.devicePixelRatio - 180) + 'px';
      }

      requestAnimationFrame(draw);
    }

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      
      const rect = canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * window.devicePixelRatio;
      const sy = (e.clientY - rect.top) * window.devicePixelRatio;
      
      const worldX = (sx - width/2) / camZoom + camX;
      const worldY = (sy - height/2) / camZoom + camY;
      
      let found = false;
      locations.forEach(loc => {
        const pos = worldToPx(loc.x, loc.y);
        const dist = Math.sqrt((worldX - pos.x)**2 + (worldY - pos.y)**2);
        if (dist < 40 / camZoom) {
          selectedLoc = loc;
          showTooltip(loc);
          found = true;
        }
      });

      if (!found && tooltip.style.display === 'block') {
        // Only hide if we didn't click inside the tooltip (handled by pointer-events:auto)
        // hideTooltip();
      }
    });

    function showTooltip(loc) {
      tooltipTitle.innerText = loc.name.toUpperCase();
      tooltipDesc.innerText = loc.description || "A desolate sector in the Badlands. High risk, high reward.";
      tooltip.style.display = 'block';
      
      btnTravel.onclick = () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'travel', locationId: loc.id }));
      };
      btnClose.onclick = () => {
        hideTooltip();
      };
    }

    function hideTooltip() {
      tooltip.style.display = 'none';
      selectedLoc = null;
    }

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      camX -= dx / camZoom * window.devicePixelRatio;
      camY -= dy / camZoom * window.devicePixelRatio;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('pointerup', () => isDragging = false);
    
    // Mouse wheel zoom
    window.addEventListener('wheel', (e) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      camZoom = Math.min(2, Math.max(0.1, camZoom * delta));
    });

    draw();
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0d0b' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
