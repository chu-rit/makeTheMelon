import Phaser from 'phaser';
import MainScene from './MainScene';

const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: '#fff5e1',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    mouse: {
      target: window,
      preventDefaultMove: false,
      preventDefaultWheel: false
    },
    touch: {
      target: window
    },
    keyboard: true,
    gamepad: false
  },
  render: {
    antialias: true
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1.2 },
      enableSleeping: true, // 성능 최적화: 정지된 객체 연산 제외
      debug: false // 디버그 모드 기본 비활성화
    }
  },
  scene: [MainScene]
};

export const initGame = (containerId) => {
  const game = new Phaser.Game({ ...config, parent: containerId });
  
  // 컨텍스트 메뉴 비활성화
  const canvas = game.canvas;
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  
  return game;
};
