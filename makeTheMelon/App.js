import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import GameContainer from './src/GameContainer';

export default function App() {
  return (
    <View style={styles.container}>
      <GameContainer />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e1', // 밝은 톤으로 변경
  },
});
