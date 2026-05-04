import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, useWindowDimensions, StatusBar, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameState } from '../hooks/useGameState';
import { Backpack, Map, Search, Footprints, ShieldAlert, Drumstick, Droplets, Hammer, Skull, Crosshair } from 'lucide-react-native';
import { ITEMS } from '../lib/constants';
import { RECIPES } from '../lib/crafting';
import { MapRenderer } from '../components/MapRenderer';
import { WorldMap } from '../components/WorldMap';
import { PLAYER_AVATAR_B64 } from '../rendering/assets';



export default function App() {
  const { state, searchLocation, useItem, travel, craftItem, resetGame } = useGameState();
  const [currentView, setCurrentView] = useState<'location' | 'world' | 'inventory' | 'crafting'>('location');
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const isDesktop = width > 1024; // Tablets and Desktop

  const handleLandmarkTapped = useCallback((id: string, name: string) => {
    // Landmark tapped — tooltip shown in WebView canvas
  }, []);

  const handleEnterLandmark = useCallback((id: string, name: string) => {
    Alert.alert(name, 'Interior exploration coming soon. This area is under cartel control.', [{ text: 'Back Away' }]);
  }, []);

  if (state.stats.health <= 0) {
    return (
      <View style={[styles.deathScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Skull size={80} color="#8b2b22" style={{ marginBottom: 24 }} />
        <Text style={styles.deathTitle}>YOU DIED</Text>
        <Text style={styles.deathSubtitle}>The cartel state claims another soul.</Text>
        <Text style={styles.deathText}>Survived for {state.day} days.</Text>
        <TouchableOpacity 
          style={styles.deathButton}
          onPress={resetGame}
        >
          <Text style={styles.deathButtonText}>RISE AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentLocation = state.locations.find(l => l.id === state.currentLocationId);

  const navItems = [
    { id: 'location', icon: Crosshair, label: 'Sector' },
    { id: 'world', icon: Map, label: 'World Map' },
    { id: 'inventory', icon: Backpack, label: 'Inventory' },
    { id: 'crafting', icon: Hammer, label: 'Crafting' }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'location':
        return (
          <View style={[styles.viewContainer, (isDesktop || isLandscape) && styles.viewContainerResponsive]}>
            {/* Map Section — dominates the screen */}
            <View style={[styles.mapSection, !(isDesktop || isLandscape) && styles.mapSectionMobile]}>
              <MapRenderer 
                location={currentLocation} 
                hour={state.hour}
                onLandmarkTapped={handleLandmarkTapped}
                onEnterLandmark={handleEnterLandmark}
              />
              <View style={styles.mapOverlayInfo}>
                <Text style={styles.mapOverlayLabel}>CURRENT LOCATION</Text>
                <Text style={styles.mapOverlayTitle}>{currentLocation?.name}</Text>
                <Text style={styles.mapOverlayType}>{currentLocation?.type.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>

            {/* Panel below the map — single ScrollView for Event Log + Scavenge */}
            <ScrollView 
              style={[styles.panelSection, !(isDesktop || isLandscape) && styles.panelSectionMobile]}
              contentContainerStyle={styles.panelContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {/* Event Log — Professional High-Tech Terminal Style */}
              <View style={styles.eventLogSection}>
                <View style={styles.eventLogHeader}>
                  <Text style={styles.eventLogLabel}>COMMUNICATIONS_LOG_ENCRYPTED</Text>
                  <View style={styles.eventLogStatusIndicator} />
                </View>
                {state.logs.map((log) => {
                  let color = '#d4c5b0';
                  if (log.type === 'warning' || log.type === 'combat') color = '#8b2b22';
                  if (log.type === 'loot') color = '#c9a444';
                  if (log.type === 'info') color = 'rgba(212, 197, 176, 0.7)';

                  return (
                    <View key={log.id} style={[styles.logEntry, { borderLeftColor: color }]}>
                      <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
                      <Text style={[styles.logText, { color }]}>{log.message}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Scavengable Areas */}
              <View style={styles.scavengeSection}>
                <View style={styles.scavengeHeader}>
                  <Text style={styles.scavengeHeaderTitle}>SCAVENGABLE AREAS</Text>
                  <Text style={styles.scavengeHeaderCount}>{currentLocation?.subLocations.length} locations</Text>
                </View>
                
                {currentLocation?.subLocations.map(loc => (
                  <View key={loc.id} style={[styles.scavengeCard, loc.searched && styles.scavengeCardSearched]}>
                    <View style={styles.scavengeCardHeader}>
                      <Text style={styles.scavengeCardTitle}>{loc.name}</Text>
                      <View style={styles.riskBadge}>
                        <ShieldAlert size={10} color="#8b2b22" />
                        <Text style={styles.riskText}>{Math.round(loc.risk * 100)}% Risk</Text>
                      </View>
                    </View>
                    <Text style={styles.scavengeCardDesc} numberOfLines={2}>{loc.description}</Text>
                    <TouchableOpacity 
                      disabled={loc.searched}
                      onPress={() => searchLocation(currentLocation.id, loc.id)}
                      style={[styles.actionButton, loc.searched && styles.actionButtonDisabled]}
                    >
                      <Search size={14} color={loc.searched ? 'rgba(212,197,176,0.4)' : '#d4c5b0'} style={{ marginRight: 8 }} />
                      <Text style={[styles.actionButtonText, loc.searched && styles.actionButtonTextDisabled]}>
                        {loc.searched ? 'Area Cleared' : 'Search Sector'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case 'world':
        return (
          <WorldMap 
            locations={state.locations} 
            currentLocationId={state.currentLocationId}
            onTravel={(id) => {
              travel(id);
              setCurrentView('location');
            }}
          />
        );

      case 'inventory':
        const currentWeight = Object.entries(state.inventory).reduce((acc, [id, qty]) => acc + (ITEMS[id]?.weight || 0) * (qty as number), 0);
        const invItems = Object.entries(state.inventory);
        return (
          <ScrollView style={styles.inventoryContainer} contentContainerStyle={styles.inventoryContent}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Inventory</Text>
              <Text style={styles.weightText}>WEIGHT: {currentWeight.toFixed(1)} / 20.0 kg</Text>
            </View>
            
            {invItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Backpack size={48} color="rgba(201,164,68,0.3)" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyStateText}>Backpack is empty</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {invItems.map(([id, qty]) => {
                  const item = ITEMS[id];
                  if (!item) return null;
                  const isConsumable = !!item.health || !!item.hunger || !!item.thirst || !!item.energy;
                  
                  return (
                    <View key={id} style={[styles.itemCard, isDesktop && styles.itemCardDesktop]}>
                      <View style={styles.itemCardContent}>
                        {item.image && (
                          <View style={styles.itemImageContainer}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                          </View>
                        )}
                        <View style={styles.itemTextContainer}>
                          <View style={styles.itemCardHeader}>
                            <Text style={styles.itemCardTitle} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.qtyBadge}>
                              <Text style={styles.qtyText}>x{qty}</Text>
                            </View>
                          </View>
                          <Text style={styles.itemCardDesc} numberOfLines={2}>{item.description}</Text>
                        </View>
                      </View>
                      {isConsumable ? (
                        <TouchableOpacity 
                          onPress={() => useItem(id)}
                          style={styles.actionButton}
                        >
                          <Text style={styles.actionButtonText}>CONSUME</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.itemCardFooter}>
                          <Text style={styles.itemCardFooterText}>CRAFTING MATERIAL</Text>
                          <Text style={styles.itemCardFooterValue}>{item.weight}kg</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        );

      case 'crafting':
        return (
          <ScrollView style={styles.craftingContainer} contentContainerStyle={styles.craftingContent}>
            <Text style={styles.pageTitle}>Workbench</Text>
            <View style={styles.grid}>
              {RECIPES.map(recipe => {
                const canCraft = Object.entries(recipe.inputs).every(([id, qty]) => (state.inventory[id] || 0) >= qty);
                
                return (
                  <View key={recipe.id} style={styles.recipeCard}>
                    <Text style={styles.recipeCardTitle}>{recipe.name}</Text>
                    <Text style={styles.recipeCardDesc} numberOfLines={2}>{recipe.description}</Text>
                    
                    <View style={styles.recipeMaterials}>
                      <Text style={styles.recipeMaterialsLabel}>REQUIRED MATERIALS</Text>
                      {Object.entries(recipe.inputs).map(([id, qty]) => {
                        const has = state.inventory[id] || 0;
                        const hasEnough = has >= qty;
                        return (
                          <View key={id} style={styles.recipeMaterialRow}>
                            <Text style={[styles.recipeMaterialName, !hasEnough && { color: 'rgba(139,43,34,0.8)' }]}>
                              {ITEMS[id]?.name || id}
                            </Text>
                            <View style={[styles.recipeMaterialBadge, hasEnough ? { backgroundColor: 'rgba(74,99,68,0.1)' } : { backgroundColor: 'rgba(139,43,34,0.1)' }]}>
                              <Text style={[styles.recipeMaterialCount, hasEnough ? { color: '#4a6344' } : { color: '#8b2b22' }]}>
                                {has} / {qty}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    <TouchableOpacity 
                      disabled={!canCraft || state.stats.energy < 15}
                      onPress={() => craftItem(recipe.id)}
                      style={[styles.actionButton, (!canCraft || state.stats.energy < 15) && styles.actionButtonDisabled]}
                    >
                      <Hammer size={14} color={canCraft ? '#d4c5b0' : 'rgba(212,197,176,0.3)'} style={{ marginRight: 8 }} />
                      <Text style={[styles.actionButtonText, (!canCraft || state.stats.energy < 15) && styles.actionButtonTextDisabled]}>
                        {canCraft ? 'CRAFT (15 ENERGY)' : 'MISSING MATERIALS'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={isLandscape && currentView === 'location'} />
      
      {/* HEADER - Hidden in landscape Sector view */}
      {!(isLandscape && currentView === 'location') && (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <View style={styles.playerInfo}>
            <View style={styles.portraitContainer}>
              <Image source={{ uri: PLAYER_AVATAR_B64 }} style={styles.portrait} />
            </View>
            <View style={styles.playerNameContainer}>
              <Text style={styles.playerLabel}>OPERATIVE_ID</Text>
              <Text style={styles.playerName}>{state.playerName}</Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{String(state.hour).padStart(2, '0')}:00</Text>
            <Text style={styles.dayText}>DAY {state.day}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatBar label="Health" value={state.stats.health} max={state.stats.maxHealth} color="#8b2b22" />
          <StatBar label="Hunger" value={state.stats.hunger} max={state.stats.maxHunger} color="#c9a444" />
          <StatBar label="Energy" value={state.stats.energy} max={state.stats.maxEnergy} color="#4a6344" />
          <StatBar label="Thirst" value={state.stats.thirst} max={state.stats.maxThirst} color="#426477" />
        </View>
      </View>
      )}

      {/* MAIN VIEW */}
      <View style={styles.main}>
        {renderView()}
      </View>

      {/* BOTTOM NAV - Hidden in landscape Sector view */}
      {!(isLandscape && currentView === 'location') && (
        <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <TouchableOpacity 
                key={item.id}
                style={styles.navButton}
                onPress={() => setCurrentView(item.id as any)}
              >
                {isActive && <View style={styles.navActiveIndicator} />}
                <Icon size={isActive ? 24 : 20} color={isActive ? '#c9a444' : 'rgba(212,197,176,0.4)'} />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

function StatBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  return (
    <View style={styles.statBarContainer}>
      <Text style={styles.statBarLabel}>{label}</Text>
      <View style={styles.statBarBackground}>
        <View style={[styles.statBarFill, { backgroundColor: color, width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0d0b' },
  deathScreen: { flex: 1, backgroundColor: '#0f0d0b', alignItems: 'center', justifyContent: 'center', padding: 24 },
  deathTitle: { fontFamily: 'Anton', fontSize: 60, color: '#8b2b22', marginBottom: 16 },
  deathSubtitle: { fontFamily: 'SpaceGrotesk', fontSize: 18, color: '#d4c5b0', opacity: 0.8, marginBottom: 8 },
  deathText: { fontFamily: 'SpaceGrotesk', fontSize: 16, color: '#d4c5b0', opacity: 0.8, marginBottom: 32 },
  deathButton: { backgroundColor: '#2a241d', paddingHorizontal: 32, paddingVertical: 12, borderWidth: 1, borderColor: '#3d3228' },
  deathButtonText: { fontFamily: 'SpaceGrotesk_SemiBold', color: '#d4c5b0', fontSize: 16, letterSpacing: 2 },
  
  header: { backgroundColor: '#0f0d0b', borderBottomWidth: 1, borderBottomColor: '#3d3228', paddingHorizontal: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  playerInfo: { flexDirection: 'row', alignItems: 'center' },
  portraitContainer: { 
    width: 64, height: 64, 
    borderRadius: 32, 
    borderWidth: 2, 
    borderColor: '#c9a444', 
    backgroundColor: '#1a1612',
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#c9a444', shadowOpacity: 0.5, shadowRadius: 8,
    position: 'relative'
  },
  portrait: { 
    width: '100%', height: '100%', 
    transform: [{ scale: 1.4 }, { translateY: 4 }] // Zoom in on face
  },
  playerNameContainer: { justifyContent: 'center' },
  playerLabel: { color: 'rgba(201,164,68,0.5)', fontFamily: 'JetBrainsMono_Bold', fontSize: 8, letterSpacing: 1, marginBottom: 2 },
  playerName: { color: '#d4c5b0', fontFamily: 'Anton', fontSize: 18, letterSpacing: 1 },
  
  timeContainer: { alignItems: 'flex-end', borderLeftWidth: 1, borderLeftColor: '#3d3228', paddingLeft: 12 },
  timeText: { color: '#c9a444', fontFamily: 'JetBrainsMono_Bold', fontSize: 12 },
  dayText: { color: '#d4c5b0', fontFamily: 'SpaceGrotesk', fontSize: 9, opacity: 0.6, letterSpacing: 2, marginTop: 2 },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statBarContainer: { flex: 1, marginHorizontal: 4 },
  statBarLabel: { color: '#d4c5b0', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 9, letterSpacing: 1, opacity: 0.6, textAlign: 'right', marginBottom: 4 },
  statBarBackground: { height: 6, backgroundColor: '#2a241d', borderRadius: 2, borderWidth: 1, borderColor: '#1a1612', overflow: 'hidden' },
  statBarFill: { height: '100%' },

  main: { flex: 1 },
  
  viewContainer: { flex: 1, backgroundColor: '#13110e' },
  viewContainerResponsive: { flexDirection: 'row' },
  mapSection: { flex: 2, position: 'relative', backgroundColor: '#0f0d0b' },
  mapSectionMobile: { flex: 3, borderBottomWidth: 1, borderBottomColor: '#3d3228' },
  mapOverlayInfo: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  mapOverlayLabel: { color: '#c9a444', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 9, letterSpacing: 2, marginBottom: 2, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  mapOverlayTitle: { color: '#d4c5b0', fontFamily: 'Anton', fontSize: 22, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5 },
  mapOverlayType: { color: '#d4c5b0', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 11, letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  
  panelSection: { flex: 1, backgroundColor: '#13110e', borderLeftWidth: 1, borderLeftColor: '#3d3228' },
  panelSectionMobile: { flex: 1.2, borderLeftWidth: 0, borderTopWidth: 1, borderTopColor: '#3d3228' },
  panelContent: { paddingBottom: 24 },

  eventLogSection: { backgroundColor: 'rgba(0,0,0,0.9)', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2a241d' },
  eventLogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  eventLogLabel: { color: 'rgba(201,164,68,0.6)', fontFamily: 'JetBrainsMono_Bold', fontSize: 9, letterSpacing: 1.5 },
  eventLogStatusIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#39ff14', shadowColor: '#39ff14', shadowOpacity: 0.8, shadowRadius: 4 },
  logEntry: { flexDirection: 'row', borderLeftWidth: 1, paddingLeft: 12, paddingVertical: 5, marginBottom: 4, alignItems: 'flex-start' },
  logTime: { color: 'rgba(201,164,68,0.4)', fontFamily: 'JetBrainsMono', fontSize: 8, marginRight: 8, marginTop: 2 },
  logText: { fontFamily: 'SpaceGrotesk', fontSize: 11, flex: 1, lineHeight: 15, letterSpacing: 0.2 },

  scavengeSection: { padding: 14 },
  scavengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scavengeHeaderTitle: { color: '#c9a444', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 10, letterSpacing: 2 },
  scavengeHeaderCount: { color: 'rgba(201,164,68,0.4)', fontFamily: 'SpaceGrotesk', fontSize: 9 },
  
  scavengeCard: { backgroundColor: 'rgba(26,22,18,0.9)', borderWidth: 1, borderColor: '#4a4336', borderRadius: 4, padding: 14, marginBottom: 10 },
  scavengeCardSearched: { backgroundColor: 'rgba(15,13,11,0.5)', borderColor: 'rgba(61,50,40,0.5)', opacity: 0.6 },
  scavengeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  scavengeCardTitle: { color: '#d4c5b0', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 13, flex: 1, paddingRight: 8 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', borderWidth: 1, borderColor: 'rgba(139,43,34,0.5)', borderRadius: 2, paddingHorizontal: 6, paddingVertical: 3 },
  riskText: { color: '#8b2b22', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 9, letterSpacing: 1, marginLeft: 4 },
  scavengeCardDesc: { color: 'rgba(212,197,176,0.8)', fontFamily: 'SpaceGrotesk', fontSize: 11, marginBottom: 12 },
  
  actionButton: { backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: '#3d3228', borderRadius: 4, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  actionButtonDisabled: { backgroundColor: 'rgba(0,0,0,0.2)' },
  actionButtonText: { color: '#d4c5b0', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 12, letterSpacing: 2 },
  actionButtonTextDisabled: { color: 'rgba(212,197,176,0.4)' },

  worldContainer: { flex: 1, backgroundColor: '#1a1612' },
  worldContent: { padding: 24 },
  pageTitle: { color: '#c9a444', fontFamily: 'Anton', fontSize: 32, letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: '#3d3228', paddingBottom: 16, marginBottom: 24 },

  inventoryContainer: { flex: 1, backgroundColor: '#13110e' },
  inventoryContent: { padding: 24 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#3d3228', paddingBottom: 16, marginBottom: 24 },
  weightText: { color: 'rgba(201,164,68,0.6)', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 10, letterSpacing: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, borderWidth: 1, borderColor: '#3d3228', borderStyle: 'dashed', borderRadius: 4 },
  emptyStateText: { color: 'rgba(201,164,68,0.3)', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 14, letterSpacing: 2 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  itemCard: { width: '50%', padding: 8 },
  itemCardDesktop: { width: '33.3%' },
  itemCardContent: { flexDirection: 'row', backgroundColor: 'rgba(26,22,18,0.5)', padding: 8, borderRadius: 4, marginBottom: 8, borderWidth: 1, borderColor: '#3d3228' },
  itemImageContainer: { width: 48, height: 48, backgroundColor: '#000', borderRadius: 4, marginRight: 10, padding: 4, justifyContent: 'center', alignItems: 'center' },
  itemImage: { width: '100%', height: '100%' },
  itemTextContainer: { flex: 1 },
  itemCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  itemCardTitle: { color: '#d4c5b0', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 13, flex: 1, paddingRight: 4 },
  qtyBadge: { backgroundColor: 'black', borderWidth: 1, borderColor: '#3d3228', borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1 },
  qtyText: { color: '#c9a444', fontFamily: 'JetBrainsMono', fontSize: 9 },
  itemCardDesc: { color: 'rgba(212,197,176,0.6)', fontFamily: 'SpaceGrotesk', fontSize: 10, height: 30 },
  itemCardFooter: { borderTopWidth: 1, borderTopColor: '#3d3228', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  itemCardFooterText: { color: 'rgba(201,164,68,0.4)', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 9, letterSpacing: 2 },
  itemCardFooterValue: { color: '#d4c5b0', fontFamily: 'JetBrainsMono', fontSize: 10 },

  craftingContainer: { flex: 1, backgroundColor: '#13110e' },
  craftingContent: { padding: 24 },
  recipeCard: { backgroundColor: '#1a1612', borderWidth: 1, borderColor: '#3d3228', padding: 20, marginBottom: 16, borderRadius: 4 },
  recipeCardTitle: { color: '#d4c5b0', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 18, marginBottom: 8 },
  recipeCardDesc: { color: 'rgba(212,197,176,0.6)', fontFamily: 'SpaceGrotesk', fontSize: 14, height: 40, marginBottom: 16 },
  recipeMaterials: { backgroundColor: '#0f0d0b', borderWidth: 1, borderColor: '#3d3228', padding: 12, borderRadius: 2, marginBottom: 20 },
  recipeMaterialsLabel: { color: 'rgba(201,164,68,0.5)', fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 9, letterSpacing: 2, marginBottom: 8 },
  recipeMaterialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  recipeMaterialName: { color: '#d4c5b0', fontFamily: 'JetBrainsMono', fontSize: 12 },
  recipeMaterialBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  recipeMaterialCount: { fontFamily: 'JetBrainsMono', fontSize: 12 },

  nav: { backgroundColor: '#0a0806', borderTopWidth: 1, borderTopColor: '#3d3228', flexDirection: 'row', paddingTop: 12 },
  navButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, position: 'relative' },
  navActiveIndicator: { position: 'absolute', top: -12, width: '100%', height: 2, backgroundColor: '#c9a444', shadowColor: '#c9a444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
  navLabel: { fontFamily: 'SpaceGrotesk_SemiBold', fontSize: 9, letterSpacing: 1, marginTop: 6, color: 'rgba(212,197,176,0.7)' },
  navLabelActive: { color: '#c9a444' }
});
