import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { GameLocation } from '../lib/types';
import { buildMapHTML } from '../rendering';

interface MapRendererProps {
  location?: GameLocation;
  hour: number;
  onLandmarkTapped?: (id: string, name: string) => void;
  onEnterLandmark?: (id: string, name: string) => void;
}

export function MapRenderer({ location, hour, onLandmarkTapped, onEnterLandmark }: MapRendererProps) {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'error') {
        console.error('WebView Error:', data.message);
      } else if (data.type === 'landmarkTapped' && onLandmarkTapped) {
        onLandmarkTapped(data.id, data.name);
      } else if (data.type === 'enterLandmark' && onEnterLandmark) {
        onEnterLandmark(data.id, data.name);
      }
    } catch (e) {
      // Ignore parse errors from non-JSON messages
    }
  }, [onLandmarkTapped, onEnterLandmark]);

  const zoomIn = useCallback(() => {
    webViewRef.current?.injectJavaScript('window.setZoom(camZoom + 0.15); true;');
  }, []);

  const zoomOut = useCallback(() => {
    webViewRef.current?.injectJavaScript('window.setZoom(camZoom - 0.15); true;');
  }, []);

  const htmlContent = buildMapHTML(location, hour);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        scrollEnabled={false}
        bounces={false}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
      />

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn} activeOpacity={0.7}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut} activeOpacity={0.7}>
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
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
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 30,
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(10,8,6,0.85)',
    borderWidth: 1,
    borderColor: '#c9a444',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    // Shadow
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  zoomButtonText: {
    color: '#c9a444',
    fontSize: 22,
    fontFamily: 'SpaceGrotesk_SemiBold',
    lineHeight: 24,
  },
});
