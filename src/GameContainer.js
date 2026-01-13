import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { initGame } from './game';

const GameContainer = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    // 웹 환경에서만 Phaser 실행
    if (Platform.OS === 'web') {
      if (!gameRef.current) {
        gameRef.current = initGame('game-container');
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <div 
          id="game-container" 
          style={{ 
            width: '100%', 
            height: '100%', 
            touchAction: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }} 
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>이 게임은 웹 브라우저에서 실행 가능합니다.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e1',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    color: '#5d4037',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default GameContainer;
