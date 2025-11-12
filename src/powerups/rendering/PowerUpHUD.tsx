import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import type { PowerUpInventory, PowerUpConfig, ActivePowerUp } from '../../types';

interface PowerUpHUDProps {
  inventory: PowerUpInventory;
  configs: Record<string, PowerUpConfig>;
  onActivateSlot: (slotIndex: number) => void;
}

export const PowerUpHUD: React.FC<PowerUpHUDProps> = ({ inventory, configs, onActivateSlot }) => {
  const { width } = Dimensions.get('window');

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    return `${seconds}s`;
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return '#FFD700';
      case 'uncommon':
        return '#9C27B0';
      case 'rare':
        return '#FF6D00';
      case 'legendary':
        return '#FF1744';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.activeBar}>
        {inventory.active.map((active, index) => {
          const config = configs[active.type];
          if (!config) return null;

          const progress = active.remainingTime / active.duration;
          const color = getRarityColor(config.rarity);

          return (
            <View key={`${active.type}-${index}`} style={styles.activeItem}>
              <View style={[styles.activeIcon, { backgroundColor: color }]}>
                <Text style={styles.activeIconText}>
                  {active.multiplier ? `${active.multiplier}x` : '⚡'}
                </Text>
              </View>
              <View style={styles.activeInfo}>
                <Text style={styles.activeName} numberOfLines={1}>
                  {config.name}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                <Text style={styles.activeTime}>{formatTime(active.remainingTime)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.inventoryBar, { left: (width - 240) / 2 }]}>
        {inventory.slots.map((slot, index) => {
          const isEmpty = slot === null;
          const config = slot ? configs[slot] : null;
          const color = config ? getRarityColor(config.rarity) : '#555';

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.inventorySlot,
                { borderColor: color, opacity: isEmpty ? 0.3 : 1 },
              ]}
              onPress={() => !isEmpty && onActivateSlot(index)}
              disabled={isEmpty}
            >
              {!isEmpty && config && (
                <>
                  <View style={[styles.slotGlow, { backgroundColor: color }]} />
                  <Text style={styles.slotText}>{config.name.split(' ')[0]}</Text>
                </>
              )}
              {isEmpty && <Text style={styles.slotEmpty}>+</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  activeBar: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    flexDirection: 'column',
    gap: 8,
    pointerEvents: 'none',
  },
  activeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 6,
    gap: 8,
  },
  activeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeInfo: {
    flex: 1,
  },
  activeName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  activeTime: {
    color: '#FFF',
    fontSize: 10,
  },
  inventoryBar: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 10,
  },
  inventorySlot: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slotGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  slotText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  slotEmpty: {
    color: '#888',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
