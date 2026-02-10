import Phaser from 'phaser';
import fruitConfigs from './fruitConfigs';
import { createFruitTextures } from './drawFruits';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // 이미지나 에셋 로드 시 사용
  }

  createFruitTextures() {
    createFruitTextures(this);
  }

  create() {
    const { width, height } = this.scale;

    this.fruits = [];
    this.fruitConfigs = fruitConfigs;

    // 과일 텍스처 생성
    this.createFruitTextures();

    // 1. 밝고 화사한 파스텔톤 배경
    const background = this.add.graphics();
    background.fillGradientStyle(0xfff5e1, 0xfff5e1, 0xffe4d1, 0xffe4d1, 1); // 부드러운 크림/살구톤
    background.fillRect(0, 0, width, height);

    // Matter.js 월드 경계 설정
    this.matter.world.setBounds(0, 0, width, height);

    // 2. 아기자기한 파스텔톤 벽과 바닥
    const wallBaseColor = 0xffe4e1; // 미스티 로즈 (부드러운 분홍)
    const wallBorderColor = 0xffb6c1; // 라이트 핑크
    const wallThickness = 100; // 벽 두께 대폭 강화 (40 -> 100) - 터널링 방지
    
    const createStyledWall = (x, y, w, h, label) => {
      const graphics = this.add.graphics();
      
      // 벽 본체 (둥근 느낌을 위해 Graphics 사용)
      graphics.fillStyle(wallBaseColor, 1);
      graphics.fillRoundedRect(x - w / 2, y - h / 2, w, h, 15);
      
      // 테두리
      graphics.lineStyle(4, wallBorderColor, 1);
      graphics.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 15);
      
      // 아기자기한 도트 패턴 추가
      graphics.fillStyle(0xffffff, 0.3);
      const dotSize = 4;
      const spacing = 20;
      for (let px = x - w / 2 + 10; px < x + w / 2 - 10; px += spacing) {
        for (let py = y - h / 2 + 10; py < y + h / 2 - 10; py += spacing) {
          graphics.fillCircle(px, py, dotSize);
        }
      }

      // Matter.js 물리 바디 설정 (투명한 사각형을 바디로 사용)
      const wallBody = this.add.rectangle(x, y, w, h, 0x000000, 0);
      this.matter.add.gameObject(wallBody, { isStatic: true, label });
      
      return graphics;
    };

    // 바닥
    createStyledWall(width / 2, height - (wallThickness / 2), width, wallThickness, 'floor');
    // 왼쪽 벽
    createStyledWall(wallThickness / 2, height / 2, wallThickness, height, 'leftWall');
    // 오른쪽 벽
    createStyledWall(width - (wallThickness / 2), height / 2, wallThickness, height, 'rightWall');

    // [테스트용] 중간 바닥 - 테스트 후 주석 해제하여 제거
    // createStyledWall(width / 2, 600, width, wallThickness, 'testFloor');

    // 3. UI: 따뜻한 톤의 점수 텍스트
    this.score = 0;
    this.scoreText = this.add.text(40, 40, '0', {
      fontSize: '48px',
      color: '#5d4037',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    });

    // 4. 인벤토리 영역 (우측 상단)
    const inventoryX = width - 110;
    const inventoryY = 60;
    const inventoryWidth = 180; // 120에서 180으로 확장
    const inventoryHeight = 100;
    const inventoryRadius = 15; // 둥근 모서리 반지름

    const inventoryBg = this.add.graphics();
    inventoryBg.fillStyle(0xf0f0f0, 0.9); // 연한 회색 배경
    inventoryBg.lineStyle(3, 0x888888, 1); // 회색 테두리
    inventoryBg.fillRoundedRect(inventoryX - inventoryWidth/2, inventoryY - inventoryHeight/2, inventoryWidth, inventoryHeight, inventoryRadius);
    inventoryBg.strokeRoundedRect(inventoryX - inventoryWidth/2, inventoryY - inventoryHeight/2, inventoryWidth, inventoryHeight, inventoryRadius);
    inventoryBg.setDepth(10); // UI 깊이 설정

    // 인벤토리 라벨
    const inventoryLabel = this.add.text(inventoryX, inventoryY - inventoryHeight/2 + 20, 'INVENTORY', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    inventoryLabel.setDepth(11);

    // 테스트용 아이템 추가 버튼 (인벤토리 아래)
    const testBtnX = inventoryX;
    const testBtnY = inventoryY + inventoryHeight/2 + 25;
    const testBtnWidth = 140;
    const testBtnHeight = 30;
    
    const testBtnBg = this.add.graphics();
    testBtnBg.fillStyle(0x4CAF50, 0.9);
    testBtnBg.fillRoundedRect(testBtnX - testBtnWidth/2, testBtnY - testBtnHeight/2, testBtnWidth, testBtnHeight, 8);
    testBtnBg.lineStyle(2, 0x388E3C, 1);
    testBtnBg.strokeRoundedRect(testBtnX - testBtnWidth/2, testBtnY - testBtnHeight/2, testBtnWidth, testBtnHeight, 8);
    testBtnBg.setDepth(10);
    
    const testBtnText = this.add.text(testBtnX, testBtnY, '+ 아이템 테스트', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    testBtnText.setDepth(11);
    
    // 테스트 버튼 인터랙션
    const testBtnZone = this.add.zone(testBtnX, testBtnY, testBtnWidth, testBtnHeight).setInteractive();
    testBtnZone.setDepth(12);
    
    testBtnZone.on('pointerdown', () => {
      // 테스트용 아이템 1개 추가 (랜덤으로 폭탄 또는 레인보우)
      this.createSpecialItem();
      
      // 클릭 효과
      this.tweens.add({
        targets: [testBtnBg, testBtnText],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    });
    
    testBtnZone.on('pointerover', () => {
      testBtnBg.clear();
      testBtnBg.fillStyle(0x66BB6A, 0.9);
      testBtnBg.fillRoundedRect(testBtnX - testBtnWidth/2, testBtnY - testBtnHeight/2, testBtnWidth, testBtnHeight, 8);
      testBtnBg.lineStyle(2, 0x388E3C, 1);
      testBtnBg.strokeRoundedRect(testBtnX - testBtnWidth/2, testBtnY - testBtnHeight/2, testBtnWidth, testBtnHeight, 8);
    });
    
    testBtnZone.on('pointerout', () => {
      testBtnBg.clear();
      testBtnBg.fillStyle(0x4CAF50, 0.9);
      testBtnBg.fillRoundedRect(testBtnX - testBtnWidth/2, testBtnY - testBtnHeight/2, testBtnWidth, testBtnHeight, 8);
      testBtnBg.lineStyle(2, 0x388E3C, 1);
      testBtnBg.strokeRoundedRect(testBtnX - testBtnWidth/2, testBtnY - testBtnHeight/2, testBtnWidth, testBtnHeight, 8);
    });

    // 폭탄 버튼 저장소
    this.bombButtons = [];
    this.createdLevels = new Set(); // 생성된 레벨 추적

    // 게임오버 선 표시 (미리보기 과일 아래)
    // 미리보기 과일 중심: y=100, 레벨 1 반지름=50 → 게임오버 라인 y=150
    const gameOverLineY = 100 + fruitConfigs[1].radius;
    
    const gameOverLine = this.add.graphics();
    gameOverLine.lineStyle(3, 0xff0000, 0.8);
    gameOverLine.beginPath();
    gameOverLine.moveTo(0, gameOverLineY);
    gameOverLine.lineTo(width, gameOverLineY);
    gameOverLine.strokePath();
    gameOverLine.setDepth(5);
    this.gameOverLineY = gameOverLineY;

    this.fruits = [];
    this.fruitConfigs = fruitConfigs;

    // 1. 8각형 정점 생성 함수
    this.getOctagonPoints = (radius) => {
      const sides = 8;
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - (Math.PI / 8);
        points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
      }
      return points;
    };

    // 2. 대기 과일 관련 상태
    this.previewLevel = 1; // 미리보기 과일의 레벨
    this.previewNumber = this.getRandomNumberForLevel(1); // 미리보기 과일의 숫자
    this.maxFruitLevel = 1; // 현재 게임에 있는 최대 레벨
    this.minDropLevel = 1; // 떨어트릴 과일의 최소 레벨
    this.maxDropLevel = 1; // 떨어트릴 과일의 최대 레벨
    this.levelCheckTimer = 0; // 레벨 체크 타이머

    // 3. 미리보기 과일 생성
    this.previewGraphics = this.add.graphics();
    this.previewSprite = null; // 스프라이트 변수 초기화 (재시작 시 에러 방지)
    this.previewText = this.add.text(0, 0, '', {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    });
    this.previewText.setOrigin(0.5, 0.5);
    this.previewText.setDepth(15);

    this.gameOverTimer = 0;
    this.isGameOver = false;
    this.gameOverWarning = false; // 게임오버 경고 상태
    this.gameOverWarningTimer = 0; // 게임오버 경고 타이머 (5초)
    this.lastLoggedSecond = -1; // 마지막으로 로그한 초
    this.canDrop = true;
    this.dropCooldown = 0;
    this.mergeCooldown = 0; // 합치기 쿨다운
    this.isDraggingBomb = false; // 폭탄 버튼을 눌러서 드래그 중인지 확인
    this.isSwitchMode = false; // 스위치 모드 (폭탄 숫자 1일 때 활성화)

    // 초기값 설정
    this.lastPointerX = this.scale.width / 2;
    this.previewX = this.scale.width / 2;
    this.previewY = 100;

    // window pointermove 이벤트로 마우스/터치 추적
    window.addEventListener('pointermove', (e) => {
      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0) {
        const scaleX = this.scale.width / rect.width;
        this.lastPointerX = (e.clientX - rect.left) * scaleX;
      }
    });

    // 터치 아웃 이벤트로 과일 떨어뜨리기
    this.input.on('pointerup', (pointer, currentlyOver) => {
      // 게임오버 경고 중이거나 게임오버 상태면 과일 떨어트리기 금지
      if (this.isGameOver || this.gameOverWarning) {
        this.isDraggingBomb = false; // 상태 초기화
        return;
      }

      // 폭탄 드래그 중이었다면 무조건 드롭 (UI 위여도 상관없음)
      if (this.isDraggingBomb) {
        if (this.canDrop) {
          this.dropFruit();
          this.canDrop = false;
          this.dropCooldown = 500; // 0.5초
          
          // 다음 과일은 다시 일반 과일로 랜덤 생성
          this.previewLevel = Phaser.Math.Between(this.minDropLevel, this.maxDropLevel);
          this.previewNumber = this.getRandomNumberForLevel(this.previewLevel);
        }
        this.isDraggingBomb = false;
        return;
      }
      
      // 일반 드롭: UI 요소 위가 아닐 때만
      if (currentlyOver.length > 0) return;
      
      if (this.canDrop) {
        this.dropFruit();
        this.canDrop = false;
        this.dropCooldown = 500; // 0.5초
      }
    });

    // 4. 충돌 감지 (폭탄 폭발용)
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // 게임 오브젝트가 연결된 바디인지 확인
        if (!bodyA.gameObject || !bodyB.gameObject) return;

        const fruitA = bodyA.gameObject;
        const fruitB = bodyB.gameObject;

        // 큰 충돌 감지 (속도 기반)
        const relativeVelocity = Math.sqrt(
          Math.pow(bodyA.velocity.x - bodyB.velocity.x, 2) + 
          Math.pow(bodyA.velocity.y - bodyB.velocity.y, 2)
        );

        // 큰 충돌 시 무서운 표정 표시
        if (relativeVelocity > 15) { // 충돌 강도 임계값을 5에서 15로 상향 조정
          if (fruitA.active) this.showScaredFace(fruitA, 500);
          if (fruitB.active) this.showScaredFace(fruitB, 500);
        }

        // 둘 중 하나가 폭탄인지 확인 (벽이나 바닥과 부딪혀도 폭발)
        const isBombA = fruitA.level !== undefined && this.fruitConfigs[fruitA.level] && this.fruitConfigs[fruitA.level].isBomb;
        const isBombB = fruitB.level !== undefined && this.fruitConfigs[fruitB.level] && this.fruitConfigs[fruitB.level].isBomb;

        // 충돌 시 폭발 로직 제거 (시한폭탄으로 변경됨)
        /*
        if (isBombA && !fruitA.isExploded) {
          fruitA.isExploded = true;
          this.explodeBomb(fruitA);
        }
        
        if (isBombB && !fruitB.isExploded) {
          fruitB.isExploded = true;
          this.explodeBomb(fruitB);
        }
        */
      });
    });
  }

  checkLevelCreation(newLevel) {
    // 레벨 3부터 새로운 레벨이 처음 생성되었을 때 특수 아이템(폭탄 또는 레인보우) 1개 생성
    if (newLevel >= 3 && !this.createdLevels.has(newLevel)) {
      this.createdLevels.add(newLevel);
      this.createSpecialItem();
    }
  }

  createSpecialItem() {
    // 50% 확률로 폭탄 또는 레인보우 과일 중 랜덤 선택
    const isRainbow = Math.random() < 0.5;
    const itemType = isRainbow ? 'rainbow' : 'bomb';
    
    // 인벤토리 영역 (화면 오른쪽 상단 - 배경과 동일한 위치)
    const inventoryX = this.scale.width - 110;
    const inventoryY = 70; // 60에서 70으로 내려서 INVENTORY 글자 안 가리게
    
    // 아이템 데이터 저장 (모든 아이템은 저장)
    const itemData = {
      itemType: itemType,
      isRainbow: isRainbow
    };
    this.bombButtons.push(itemData);
    
    // 최대 3개까지만 시각적으로 표시
    this.updateInventoryDisplay(inventoryX, inventoryY);
  }

  updateInventoryDisplay(inventoryX, inventoryY) {
    // 기존에 표시된 아이템 버튼들 제거
    this.bombButtons.forEach(btn => {
      if (btn.container) {
        btn.container.destroy();
        btn.container = null;
      }
    });
    
    // 앞에서부터 최대 3개만 표시 (인벤토리 중앙에 정렬)
    const visibleCount = Math.min(3, this.bombButtons.length);
    const startX = inventoryX - 50; // 중앙에서 왼쪽으로 50px
    for (let i = 0; i < visibleCount; i++) {
      const btn = this.bombButtons[i];
      const itemX = startX + i * 50; // 간격 50px
      const itemY = inventoryY;
      this.createItemButtonVisual(btn, itemX, itemY);
    }
    
    // 남은 아이템 개수 표시 (3개 초과시, 오른쪽 끝에)
    if (this.bombButtons.length > 3) {
      const remainingCount = this.bombButtons.length - 3;
      this.showRemainingCount(inventoryX + 75, inventoryY, remainingCount);
    }
  }

  showRemainingCount(x, y, count) {
    // 기존 카운트 텍스트 제거
    if (this.remainingText) {
      this.remainingText.destroy();
    }
    
    this.remainingText = this.add.text(x + 15, y, `+${count}`, {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.remainingText.setDepth(16);
  }

  createItemButtonVisual(btn, itemX, itemY) {
    const itemRadius = 18;
    const isRainbow = btn.isRainbow;
    const itemType = btn.itemType;

    const itemBtn = this.add.container(itemX, itemY);
    itemBtn.setDepth(15);
    itemBtn.setData('isBombButton', true);
    itemBtn.setData('itemType', itemType);
    
    // 버튼 컨테이너를 btn 객체에 저장
    btn.container = itemBtn;

    // 버튼 배경
    const itemBtnBg = this.add.graphics();
    if (isRainbow) {
      itemBtnBg.fillStyle(0xFF69B4, 0.9);
    } else {
      itemBtnBg.fillStyle(0x333333, 0.8);
    }
    itemBtnBg.fillCircle(0, 0, itemRadius);
    itemBtnBg.lineStyle(2, 0xffd700, 1);
    itemBtnBg.strokeCircle(0, 0, itemRadius);
    itemBtn.add(itemBtnBg);

    // 아이템 아이콘
    let iconTexture = isRainbow ? 'fruit_rainbow' : 'fruit_bomb_9';
    const itemIcon = this.add.sprite(0, 0, iconTexture);
    itemIcon.setScale(0.18);
    itemBtn.add(itemIcon);

    // 인터랙션
    const itemBtnZone = this.add.zone(0, 0, itemRadius * 2, itemRadius * 2)
      .setInteractive(new Phaser.Geom.Circle(itemRadius, itemRadius, itemRadius * 1.2), Phaser.Geom.Circle.Contains);
    itemBtn.add(itemBtnZone);

    itemBtnZone.on('pointerdown', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }

      if (this.isGameOver || this.gameOverWarning || !this.canDrop) return;
      if (this.isDraggingBomb) return;

      // 특수 아이템 모드로 전환
      this.isDraggingBomb = true;
      this.bombInitialCount = this.previewNumber;
      
      if (itemType === 'rainbow') {
        const rainbowLevel = this.fruitConfigs.length - 1;
        this.previewLevel = rainbowLevel;
      } else {
        const bombLevel = this.fruitConfigs.length - 2;
        this.previewLevel = bombLevel;
      }
      
      this.lastPointerX = pointer.x;
      if (!this.isSwitchMode) {
        this.updatePreview(pointer.x, this.previewY);
      }

      // 버튼 클릭 효과
      this.tweens.add({
        targets: itemBtn,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });

      // 아이템 사용 후 제거
      this.time.delayedCall(100, () => {
        this.removeItemAtIndex(0); // 첫 번째 아이템 사용
      });
    });

    itemBtnZone.on('pointerup', () => {
      if (this.isDraggingBomb) {
        this.isDraggingBomb = false;
        this.previewLevel = this.minDropLevel;
        this.updatePreview(this.lastPointerX, this.previewY);
      }
    });

    itemBtnZone.on('pointermove', (pointer) => {
      if (this.isDraggingBomb) {
        this.lastPointerX = pointer.x;
        this.updatePreview(pointer.x, this.previewY);
      }
    });

    // 아이템 생성 이펙트
    this.createBombAppearEffect(itemX, itemY);
  }

  removeItemAtIndex(index) {
    if (index >= this.bombButtons.length) return;
    
    // 해당 인덱스의 아이템 제거
    const btn = this.bombButtons[index];
    if (btn && btn.container) {
      btn.container.destroy();
    }
    this.bombButtons.splice(index, 1);
    
    // 인벤토리 다시 그리기 (다음 아이템이 보이게)
    const inventoryX = this.scale.width - 110;
    const inventoryY = 70; // 60에서 70으로 내려서 INVENTORY 글자 안 가리게
    this.updateInventoryDisplay(inventoryX, inventoryY);
  }

  createBombButton() {
    // 이전 함수는 더 이상 사용하지 않음 (createSpecialItem 사용)
    // 하위 호환성을 위해 남겨두되 createSpecialItem 호출
    this.createSpecialItem();
  }

  createBombAppearEffect(x, y) {
    // 1. 반짝임 효과 (깊이 증가)
    const flash = this.add.circle(x, y, 40, 0xffd700, 0.8); // 크기와 불투명도 증가
    flash.setDepth(50); // 깊이를 높여서 다른 요소들 앞으로 보이도록
    
    this.tweens.add({
      targets: flash,
      scale: { from: 0, to: 3 }, // 더 크게 확대
      alpha: { from: 0.8, to: 0 },
      duration: 500,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    // 2. 나타나는 텍스트 (깊이 증가)
    const appearText = this.add.text(x, y, '+1', {
      fontSize: '32px', // 폰트 크기 증가
      color: '#ff6b35',
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);
    appearText.setDepth(51); // 깊이 증가

    this.tweens.add({
      targets: appearText,
      scale: { from: 0.5, to: 2 }, // 더 크게 확대
      alpha: { from: 0, to: 1, to: 0 },
      y: y - 30, // 더 위로 이동
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => appearText.destroy()
    });

    // 3. 작은 입자 효과 (깊이 증가)
    const sparkleCount = 12; // 입자 수 증가
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkleCount;
      const distance = 60; // 더 멀리 튀어나감
      const sparkleX = x + Math.cos(angle) * distance;
      const sparkleY = y + Math.sin(angle) * distance;
      
      const sparkle = this.add.circle(sparkleX, sparkleY, 4, 0xffffff, 1);
      sparkle.setDepth(52); // 깊이 증가
      
      this.tweens.add({
        targets: sparkle,
        scale: { from: 0, to: 1.5 },
        alpha: { from: 1, to: 0 },
        duration: 400 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      });
    }
  }

  removeBombButton(bombBtn) {
    // 폭탄 버튼 제거
    const index = this.bombButtons.indexOf(bombBtn);
    if (index > -1) {
      this.bombButtons.splice(index, 1);
    }
    
    // 애니메이션으로 부드럽게 제거
    this.tweens.add({
      targets: bombBtn,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        bombBtn.destroy();
        
        // 남은 폭탄 버튼들 위치 재정렬
        this.rearrangeBombButtons();
      }
    });
  }

  rearrangeBombButtons() {
    const inventoryX = this.scale.width - 110;
    const inventoryY = 70;
    
    // 남은 폭탄 버튼들 위치 재정렬
    this.bombButtons.forEach((bombBtn, index) => {
      // bombBtn이 container인 경우 (이전 방식)와 itemData인 경우 (새 방식) 구분
      const targetX = inventoryX - 50 + index * 50;
      const targetY = inventoryY;
      
      this.tweens.add({
        targets: bombBtn.container || bombBtn,
        x: targetX,
        y: targetY,
        duration: 200,
        ease: 'Power2'
      });
    });
  }

  handleBombButtonInSwitchMode() {
    // 스위치 모드일 때 숫자가 1인 폭탄만 터트리기
    const bombsToExplodeNow = [];
    this.fruits.forEach(fruit => {
      const fConfig = this.fruitConfigs[fruit.level];
      if (fConfig && fConfig.isBomb && fruit.bombTimer === 1 && !fruit.isExploded) {
        bombsToExplodeNow.push(fruit);
      }
    });
    
    bombsToExplodeNow.forEach(bomb => {
      bomb.isExploded = true;
      this.explodeBomb(bomb);
    });
    
    this.isSwitchMode = false; // 스위치 모드 비활성화
  }

  explodeBomb(bomb) {
    if (!bomb || !bomb.scene) return;

    const x = bomb.x;
    const y = bomb.y;
    const blastRadius = 800; // 화면 전체 커버
    const blastPower = 0.35; // 폭발 힘 적절하게 조절 (0.2 -> 0.35)

    // 이펙트
    this.createExplosionEffect(x, y);

    // 카메라 쉐이크
    this.cameras.main.shake(500, 0.05);

    // 주변 과일 밀어내기
    this.fruits.forEach(fruit => {
      if (fruit === bomb || !fruit.body) return;
      
      const dist = Phaser.Math.Distance.Between(x, y, fruit.x, fruit.y);
      if (dist < blastRadius) {
        // 먼저 자는 객체 깨우기
        if (fruit.body.isSleeping) {
          const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
          Sleeping.set(fruit.body, false);
          fruit.body.isSleeping = false;
        }

        const angle = Phaser.Math.Angle.Between(x, y, fruit.x, fruit.y);
        // 거리에 반비례한 힘
        const distanceFactor = (1 - dist / blastRadius);
        // 질량을 고려한 힘 계산
        const forceMagnitude = fruit.body.mass * blastPower * distanceFactor;
        
        let dirX = Math.cos(angle);
        let dirY = Math.sin(angle);

        // 위로 튀어오르는 힘 억제 (상향 벡터 감쇠)
        if (dirY < 0) {
          dirY *= 0.03; // 위로 향하는 힘을 3%로 줄임 (8% -> 3%)
        }
        
        // Matter.js 힘 적용
        this.matter.body.applyForce(fruit.body, fruit.body.position, {
          x: dirX * forceMagnitude,
          y: dirY * forceMagnitude
        });
        
        // 회전력 추가
        this.matter.body.setAngularVelocity(fruit.body, (Math.random() - 0.5) * 0.2);
      }
    });

    // 폭탄 제거 (fruits 배열에서 제거)
    this.fruits = this.fruits.filter(f => f !== bomb);
    if (bomb.fruitText) bomb.fruitText.destroy();
    bomb.destroy();
  }

  createExplosionEffect(x, y) {
    // 1. 섬광
    const flash = this.add.circle(x, y, 150, 0xffffff); // 섬광 크기 증가
    flash.setDepth(50);
    this.tweens.add({
      targets: flash,
      scale: 8, // 스케일 증가
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 2. 쾅! 텍스트
    const bangText = this.add.text(x, y, 'BOOM!', {
      fontSize: '80px', // 폰트 크기 증가
      color: '#ff0000',
      fontFamily: 'Arial Black',
      stroke: '#ffffff',
      strokeThickness: 8
    }).setOrigin(0.5);
    bangText.setDepth(51);

    this.tweens.add({
      targets: bangText,
      scale: { from: 0.5, to: 2.0 }, // 텍스트 확대 효과 강화
      alpha: 0,
      y: y - 80,
      angle: { from: -10, to: 10 },
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => bangText.destroy()
    });

    // 3. 충격파 링
    const shockwave = this.add.circle(x, y, 10, 0xffffff, 0);
    shockwave.setStrokeStyle(10, 0xffa500); // 선 두께 증가
    shockwave.setDepth(49);
    
    this.tweens.add({
      targets: shockwave,
      radius: 800, // 충격파 반경 대폭 증가
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => shockwave.destroy()
    });
  }

  dropFruit() {
    // 미리보기에 표시된 과일을 떨어트림
    const dropLevel = this.previewLevel;
    const dropNumber = this.previewNumber;
    const fruitConfig = this.fruitConfigs[dropLevel];
    const radius = fruitConfig.radius;
    const dropX = this.previewX;
    const dropY = this.previewY;

    // 스프라이트 기반 과일 생성
    let textureKey = `fruit_${dropLevel}`;
    if (this.fruitConfigs[dropLevel].isBomb) {
      textureKey = `fruit_bomb_${dropNumber}`;
    } else if (this.fruitConfigs[dropLevel].isRainbow) {
      textureKey = 'fruit_rainbow';
    }
    const fruit = this.add.sprite(dropX, dropY, textureKey);
    
    // 폭탄 과일은 텍스처 내 여백이 많으므로(스케일 0.75) 더 크게 확대해야 물리 바디와 일치함
    // 일반 과일: radius / 170 (텍스처 내 반지름 약 170px 기준)
    // 폭탄 과일: radius / 142.5 (텍스처 내 반지름 190 * 0.75 = 142.5px 기준)
    // 레인보우 과일: 일반 과일과 동일하게 처리
    if (this.fruitConfigs[dropLevel].isBomb) {
      fruit.setScale(radius / 142.5);
    } else if (this.fruitConfigs[dropLevel].isRainbow) {
      fruit.setScale(radius / 170);
    } else {
      fruit.setScale(radius / 170);
    }
    
    fruit.setOrigin(0.5, 0.5);

    // Matter.js 물리 적용 (원형 바디 사용, 반지름을 정확히 설정)
    const Body = Phaser.Physics.Matter.Matter.Body;
    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    
    this.matter.add.gameObject(fruit, {
      label: `fruit_${dropLevel}`,
      fruitLevel: dropLevel,
      shape: 'circle',
      circleRadius: radius
    });
    
    // 바디의 반지름을 정확히 설정
    if (fruit.body) {
      fruit.body.circleRadius = radius;
      // 바디 재설정 (slop을 0으로 설정하여 물리 엔진과의 유격을 최소화)
      const newBody = Bodies.circle(dropX, dropY, radius, {
        friction: 0.5,
        restitution: 0.2,
        density: 0.001,
        slop: 0
      });
      fruit.setExistingBody(newBody);
    }
    
    // 초기 속도 설정 (느리게 시작)
    Body.setVelocity(fruit.body, { x: 0, y: 0.5 });
    
    // 중력 강화 (가속도 빠르게)
    fruit.body.gravityScale = 3;

    // 떨어질 때 무서운 표정 표시 (약간 지연)
    this.time.delayedCall(100, () => {
      this.showScaredFace(fruit, 2000); // 2초 동안 무서운 표정으로 증가
    });

    // 과일 정보 저장
    fruit.radius = radius;
    fruit.level = dropLevel;
    fruit.fruitNumber = dropNumber;
    fruit.initialX = dropX;
    fruit.initialY = dropY;
    this.fruits.push(fruit);

    // 레벨 생성 확인
    this.checkLevelCreation(dropLevel);

    // 떨어질 때 무서운 표정 표시 (약간 지연)
    this.time.delayedCall(100, () => {
      this.showScaredFace(fruit, 2000); // 2초 동안 무서운 표정으로 증가
    });

    // 현재 과일 개수 로깅
    console.log(`현재 과일 개수: ${this.fruits.length}`);

    // 과일 숫자 텍스트 추가
    const config = this.fruitConfigs[dropLevel];
    
    // 텍스트 설정
    let textContent = dropNumber.toString();
    let textStyle = {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    };

    // 폭탄일 경우 타이머 텍스트 스타일 적용
    if (config.isBomb) {
      // 폭탄 타이머 설정 - 미리보기 숫자를 그대로 사용
      fruit.bombTimer = this.previewNumber; // 미리보기 숫자를 그대로 타이머로 사용
      
      // 폭탄 숫자가 1이면 스위치 모드 활성화
      if (fruit.bombTimer === 1) {
        this.isSwitchMode = true;
        // 즉시 미리보기 업데이트
        this.updatePreview(this.previewX, this.previewY);
      }
      
      textContent = `${fruit.bombTimer}`; // '3' 형식 (단일 숫자)
      
      textStyle = {
        fontSize: '42px', // 이전 미리보기 과일과 동일한 크기
        color: '#ffffff', // 흰색 (이전 미리보기 과일과 동일)
        fontFamily: 'Arial Black', // Arial Black 폰트 (이전 미리보기 과일과 동일)
        fontWeight: 'bold',
        stroke: '#ff4444', // 빨간색 테두리 (이전 미리보기 과일과 동일)
        strokeThickness: 6, // 테두리 두께 (이전 미리보기 과일과 동일)
        shadow: { color: '#000000', blur: 4, fill: true, stroke: true, offsetX: 2, offsetY: 2 } // 그림자 효과 (이전 미리보기 과일과 동일)
      };
    }

    const fruitText = this.add.text(dropX, dropY, textContent, textStyle);
    fruitText.setOrigin(0.5, 0.5);
    fruitText.setDepth(10);
    fruit.fruitText = fruitText;

    // 턴 진행 로직: 기존에 있는 모든 폭탄의 타이머 감소
    const bombsToExplode = [];
    
    this.fruits.forEach(existingFruit => {
      // 방금 떨어진 과일은 제외
      if (existingFruit === fruit) return;
      
      // 이미 터진 폭탄 제외
      if (existingFruit.isExploded) return;

      const fConfig = this.fruitConfigs[existingFruit.level];
      
      // 폭탄이고 타이머가 있다면
      if (fConfig && fConfig.isBomb && existingFruit.bombTimer !== undefined) {
        existingFruit.bombTimer -= 1;
        
        // 텍스트 업데이트
        if (existingFruit.fruitText) {
          existingFruit.fruitText.setText(`${existingFruit.bombTimer}`);
        }
        
        // 텍스처 업데이트 (심지 길이 및 표정 변화 반영)
        if (existingFruit.bombTimer >= 0) {
          existingFruit.setTexture(`fruit_bomb_${existingFruit.bombTimer}`);
        }
        
        // 폭탄 숫자 1일 때 스위치 모드 활성화
        if (existingFruit.bombTimer === 1) {
          this.isSwitchMode = true;
          // 즉시 미리보기 업데이트
          this.updatePreview(this.previewX, this.previewY);
        }
        
        // 0이 되면 폭발 대기
        if (existingFruit.bombTimer <= 0) {
          bombsToExplode.push(existingFruit);
        }
      }
    });

    // 타이머가 다 된 폭탄 폭발 (약간의 지연을 주어 순차적 느낌?)
    // 즉시 폭발해도 됨
    bombsToExplode.forEach(bomb => {
      bomb.isExploded = true;
      this.explodeBomb(bomb);
      // 폭탄이 폭발하면 스위치 모드 비활성화
      this.isSwitchMode = false;
    });

    // 미리보기 과일 숨기기
    if (this.previewSprite) {
      this.previewSprite.setVisible(false);
    }
    this.previewText.setVisible(false);

    // 새로운 미리보기 과일 생성 (범위에서 랜덤하게 선택)
    // 스위치 모드가 아닐 때만 다음 과일 생성
    if (!this.isSwitchMode) {
      this.previewLevel = Phaser.Math.Between(this.minDropLevel, this.maxDropLevel);
      this.previewNumber = this.getRandomNumberForLevel(this.previewLevel);
    }

    // 0.5초 후에 미리보기 과일 다시 표시
    this.time.delayedCall(500, () => {
      // 쿨다운이 끝날 때까지 기다렸다가 표시
      const showPreview = () => {
        if (this.canDrop) {
          if (this.previewSprite) {
            this.previewSprite.setVisible(true);
          }
          this.previewText.setVisible(true);
        } else {
          // 아직 쿨다운 중이면 100ms 후 다시 확인
          this.time.delayedCall(100, showPreview);
        }
      };
      showPreview();
    });
  }

  getRandomNumberForLevel(level) {
    const fruitConfig = this.fruitConfigs[level];
    if (!fruitConfig) return 1;
    
    const minNumber = fruitConfig.minNumber;
    const maxNumber = fruitConfig.maxNumber;
    return Phaser.Math.Between(minNumber, maxNumber);
  }

  updateMaxFruitLevel() {
    // 현재 게임에 있는 최대 레벨 찾기
    let newMaxLevel = 1; // 최소 레벨은 1
    this.fruits.forEach(fruit => {
      // 폭탄과 레인보우는 최대 레벨 계산에서 제외
      const config = this.fruitConfigs[fruit.level];
      if (config && !config.isBomb && !config.isRainbow && fruit.level > newMaxLevel) {
        newMaxLevel = fruit.level;
      }
    });

    // 최대 레벨이 변경되었으면 떨어트릴 과일 레벨 업데이트
    if (newMaxLevel !== this.maxFruitLevel) {
      this.maxFruitLevel = newMaxLevel;
      this.updateDropFruitLevel();
    }
  }

  updateDropFruitLevel() {
    // 최대 레벨까지의 모든 과일을 떨어트릴 수 있음
    const newMinLevel = 1;
    const newMaxLevel = this.maxFruitLevel;
    
    if (newMinLevel !== this.minDropLevel || newMaxLevel !== this.maxDropLevel) {
      this.minDropLevel = newMinLevel;
      this.maxDropLevel = newMaxLevel;
      this.currentNumber = this.getRandomNumberForLevel(this.minDropLevel);
    }
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 드롭 쿨다운 처리
    if (!this.canDrop && this.dropCooldown > 0) {
      this.dropCooldown -= delta;
      if (this.dropCooldown <= 0) {
        this.canDrop = true;
      }
    }

    // 합치기 쿨다운 처리
    if (this.mergeCooldown > 0) {
      this.mergeCooldown -= delta;
    }

    // 최대 레벨 주기적 체크 (0.5초마다)
    this.levelCheckTimer -= delta;
    if (this.levelCheckTimer <= 0) {
      this.updateMaxFruitLevel();
      this.levelCheckTimer = 500; // 0.5초마다 체크
    }

    // 마우스 포인터 x좌표 추적 (기본값: 게임 중앙)
    let pointerX = this.lastPointerX !== undefined ? this.lastPointerX : this.scale.width / 2;
    
    // 게임 캔버스 범위 내에 있는지 확인
    if (pointerX < 0) pointerX = 0;
    if (pointerX > this.scale.width) pointerX = this.scale.width;
    
    const fixedY = 100;
    const wallThickness = 100; // 벽 두께와 일치시킴

    // 미리보기 과일 업데이트 (쿨다운 중이 아닐 때만)
    if (this.canDrop) {
      // previewLevel이 유효한 범위인지 확인
      const fruitConfig = this.fruitConfigs[this.previewLevel];
      
      if (fruitConfig && fruitConfig.radius > 0) {
        const radius = fruitConfig.radius;
        
        // 미리보기 x좌표 계산 (벽을 넘어가지 않도록)
        // 벽 두께(100)를 고려하여 clamping 범위 조정
        const minX = radius + wallThickness; 
        const maxX = this.scale.width - radius - wallThickness;
        const adjustedX = Phaser.Math.Clamp(pointerX, minX, maxX);
        
        this.updatePreview(adjustedX, fixedY);
        // 미리보기 위치 저장
        this.previewX = adjustedX;
        this.previewY = fixedY;
      }
    } else {
      this.previewGraphics.clear();
      this.previewText.setVisible(false); // 텍스트를 지우지 않고 숨기기만 함
    }

    // 떨어진 과일의 텍스트 위치 동기화
    this.fruits.forEach(fruit => {
      if (fruit.fruitText) {
        // 텍스트 위치 업데이트
        fruit.fruitText.setPosition(fruit.x, fruit.y);
      }
    });

    // 과일 합치기 체크 (쿨다운이 끝난 후에만)
    if (this.mergeCooldown <= 0) {
      this.checkAndMergeFruits();
    }

    // 게임오버 조건 확인 (과일이 게임오버 선을 넘었는지 확인)
    this.checkGameOver();

    // 화면 이탈 방지 (안전장치) - 폭탄 폭발로 인한 터널링 방지
    // wallThickness는 위에서 이미 선언됨
    this.fruits.forEach(fruit => {
      if (!fruit.body) return;

      const r = fruit.radius;
      let clampedX = fruit.x;
      let clampedY = fruit.y;
      let corrected = false;

      // 왼쪽 벽 이탈 방지 (x < 벽 두께 + 반지름)
      if (fruit.x < wallThickness + r) {
        clampedX = wallThickness + r;
        corrected = true;
        // 벽 쪽으로 향하는 속도 제거
        if (fruit.body.velocity.x < 0) {
          this.matter.body.setVelocity(fruit.body, { x: 0, y: fruit.body.velocity.y });
        }
      }
      // 오른쪽 벽 이탈 방지 (x > 너비 - 벽 두께 - 반지름)
      else if (fruit.x > this.scale.width - wallThickness - r) {
        clampedX = this.scale.width - wallThickness - r;
        corrected = true;
        // 벽 쪽으로 향하는 속도 제거
        if (fruit.body.velocity.x > 0) {
          this.matter.body.setVelocity(fruit.body, { x: 0, y: fruit.body.velocity.y });
        }
      }

      // 바닥 이탈 방지 (바닥 벽 두께 고려)
      // 바닥 벽은 height - (wallThickness / 2)에 위치, 높이는 wallThickness
      // 즉 바닥의 윗면은 height - wallThickness
      if (fruit.y > this.scale.height - wallThickness - r) {
        clampedY = this.scale.height - wallThickness - r;
        corrected = true;
        if (fruit.body.velocity.y > 0) {
          this.matter.body.setVelocity(fruit.body, { x: fruit.body.velocity.x, y: 0 });
        }
      }

      // 위치 보정이 필요한 경우 적용
      if (corrected) {
        this.matter.body.setPosition(fruit.body, { x: clampedX, y: clampedY });
      }
    });
  }

  checkGameOver() {
    // 게임오버 선: 미리보기 과일 아래
    const gameOverLine = this.gameOverLineY;

    // 게임오버 경고 상태에서 타이머 감소
    if (this.gameOverWarning) {
      this.gameOverWarningTimer -= 16; // 약 60fps 기준
      
      if (this.gameOverWarningTimer <= 0) {
        // 5초 경과 후 게임오버
        this.triggerGameOver();
        return;
      }

      // 3초, 2초, 1초 남았을 때만 콘솔 로그 (1번씩만)
      const remainingSeconds = Math.ceil(this.gameOverWarningTimer / 1000);
      if (remainingSeconds !== this.lastLoggedSecond) {
        if (remainingSeconds === 3 || remainingSeconds === 2 || remainingSeconds === 1) {
          console.log('게임오버까지 ' + remainingSeconds + '초 남음');
          this.lastLoggedSecond = remainingSeconds;
        }
      }
    }

    // 라인을 넘긴 과일이 있는지 확인
    let hasOverLine = false;
    for (let fruit of this.fruits) {
      // 과일의 상단 경계(중심 - 반지름)가 게임오버 선을 넘었으면
      if (fruit.y - fruit.radius < gameOverLine) {
        hasOverLine = true;
        break;
      }
    }

    // 라인을 넘긴 과일이 있으면 경고 상태 시작
    if (hasOverLine && !this.gameOverWarning) {
      this.gameOverWarning = true;
      this.gameOverWarningTimer = 5000; // 5초
      this.canDrop = false; // 새로운 과일 떨어트리기 금지
    }

    // 라인을 넘긴 과일이 없으면 경고 상태 해제
    if (!hasOverLine && this.gameOverWarning) {
      this.gameOverWarning = false;
      this.gameOverWarningTimer = 0;
      this.canDrop = true; // 새로운 과일 떨어트리기 허용
    }
  }

  triggerGameOver() {
    if (this.isGameOver) return; // 이미 게임오버 상태면 무시

    this.isGameOver = true;
    console.log('게임오버! 최종 점수:', this.score);

    // 1. 어두운 배경 (페이드 인)
    const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000);
    overlay.setDepth(90);
    overlay.setAlpha(0);
    
    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 500
    });

    // 2. 메인 패널 (팝업)
    const panelX = this.scale.width / 2;
    const panelY = this.scale.height / 2;
    const panelW = 420;
    const panelH = 360;
    
    const panel = this.add.container(panelX, panelY);
    panel.setDepth(100);
    panel.setScale(0); // 팝업 효과를 위해 크기 0에서 시작

    // 패널 배경 (흰색 둥근 사각형 + 그림자)
    const panelBg = this.add.graphics();
    // 그림자
    panelBg.fillStyle(0x000000, 0.3);
    panelBg.fillRoundedRect(-panelW/2 + 8, -panelH/2 + 8, panelW, panelH, 25);
    // 본체
    panelBg.fillStyle(0xffffff, 1);
    panelBg.fillRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 25);
    // 테두리
    panelBg.lineStyle(4, 0xffd700, 1); // 골드 테두리
    panelBg.strokeRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 25);
    panel.add(panelBg);

    // 3. 타이틀 텍스트
    const titleText = this.add.text(0, -100, 'GAME OVER', {
      fontSize: '52px',
      color: '#ff4444',
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);
    // 타이틀 그림자
    titleText.setShadow(3, 3, 'rgba(0,0,0,0.3)', 2, true, true);
    panel.add(titleText);

    // 4. 점수 레이블
    const scoreLabel = this.add.text(0, -20, 'FINAL SCORE', {
      fontSize: '24px',
      color: '#555555',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    panel.add(scoreLabel);

    // 5. 점수 (카운트 업 효과)
    const scoreText = this.add.text(0, 35, '0', {
      fontSize: '64px',
      color: '#333333',
      fontFamily: 'Arial Black',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    panel.add(scoreText);

    // 6. 재시작 버튼
    const btnW = 220;
    const btnH = 65;
    const btnY = 120;
    
    const buttonContainer = this.add.container(0, btnY);
    
    // 버튼 배경
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x4CAF50, 1); // 기본 녹색
    btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 15);
    
    const btnText = this.add.text(0, 0, 'RETRY', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    buttonContainer.add([btnBg, btnText]);
    
    // 버튼 인터랙션 영역 (Zone 사용)
    const btnZone = this.add.zone(0, 0, btnW, btnH).setInteractive();
    buttonContainer.add(btnZone);

    btnZone.on('pointerover', () => {
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
      btnBg.clear();
      btnBg.fillStyle(0x66BB6A, 1); // 밝은 녹색
      btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 15);
    });
    
    btnZone.on('pointerout', () => {
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
      btnBg.clear();
      btnBg.fillStyle(0x4CAF50, 1); // 기본 녹색
      btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 15);
    });
    
    btnZone.on('pointerdown', () => {
      this.scene.restart();
    });
    
    panel.add(buttonContainer);

    // 7. 패널 팝업 애니메이션
    this.tweens.add({
      targets: panel,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 8. 점수 카운트 업 애니메이션
    this.tweens.addCounter({
      from: 0,
      to: this.score,
      duration: 1500,
      ease: 'Power2.easeOut',
      onUpdate: (tween) => {
        const value = Math.round(tween.getValue());
        scoreText.setText(value.toLocaleString());
      }
    });
  }

  checkAndMergeFruits() {
    const fruitsToRemove = [];
    let merged = true;

    // 합쳐질 과일이 없을 때까지 반복
    while (merged) {
      merged = false;
      
      // 모든 가능한 인접 그룹 찾기
      const allGroups = this.findAllAdjacentGroups(fruitsToRemove);
      
      // 디버그: 찾은 그룹 수 로깅
      if (allGroups.length > 0) {
        console.log(`Found ${allGroups.length} groups`);
      }

      for (let group of allGroups) {
        if (group.length < 2) continue;

        // 그룹에 레인보우 과일이 있는지 확인
        const hasRainbow = group.some(f => {
          const config = this.fruitConfigs[f.level];
          return config && config.isRainbow;
        });

        // 그룹의 숫자 합 계산 (레인보우는 숫자가 0)
        const sum = group.reduce((acc, f) => acc + f.fruitNumber, 0);
        
        // 디버그: 그룹 정보 로깅
        console.log(`Group: [${group.map(f => f.fruitNumber).join(',')}], sum=${sum}, level=${group[0].level}`);

        // 합이 10이면 합치기
        if (sum === 10) {
          // 레인보우가 있는 경우: 합체 대신 동종 과일 + 레인보우 제거 효과
          if (hasRainbow) {
            const targetLevel = group
              .filter(f => !this.fruitConfigs[f.level].isRainbow)
              .reduce((max, f) => Math.max(max, f.level), 0);
            
            // 그룹 내 레인보우 과일들 찾기
            const rainbowFruitsInGroup = group.filter(f => this.fruitConfigs[f.level].isRainbow);
            
            if (targetLevel > 0) {
              // 동종 과일 + 레인보우 하이라이트 및 제거 효과 실행
              // group 전체를 넘겨서 어떤 과일과 합쳐지는지 표시
              this.playRainbowEffect(targetLevel, rainbowFruitsInGroup, group);
            }
            
            // 합체는 일어나지 않음 - 계속 진행
            continue;
          }
          
          // 일반 합체 (레인보우 없음)
          const newLevel = group[0].level + 1;
          
          // 점수 계산
          let scoreToAdd;
          if (group[0].level === 1) {
            scoreToAdd = group.length;
          } else {
            scoreToAdd = group.length * group[0].level;
          }
          
          // 첫 번째 과일 위치에서 새 과일 생성
          const newX = group[0].x;
          const newY = group[0].y;

          // 인접한 과일들 제거
          group.forEach(f => {
            if (f.fruitGraphics) f.fruitGraphics.destroy();
            if (f.fruitText) f.fruitText.destroy();
            f.destroy();
            fruitsToRemove.push(f);
          });

          // 새 과일 생성 (합쳐진 과일 갯수 전달)
          this.createMergedFruit(newX, newY, newLevel, group.length);
          
          // 모든 과일의 sleep 상태 해제 (중력 재적용)
          const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
          this.fruits.forEach(fruit => {
            // 제거될 과일은 제외하고 깨우기
            if (!fruitsToRemove.includes(fruit) && fruit.body) {
              Sleeping.set(fruit.body, false);
              fruit.body.isSleeping = false; // 강제로 깨우기
              fruit.body.sleepCounter = 0; // 수면 카운터 초기화
            }
          });
          
          // 합치기 쿨다운 설정 (2초)
          this.mergeCooldown = 2000;
          
          merged = true;
          break; // 다시 처음부터 체크
        }
      }
    }

    // 제거할 과일들 배열에서 삭제
    this.fruits = this.fruits.filter(f => !fruitsToRemove.includes(f));
  }

  findAllAdjacentGroups(fruitsToRemove) {
    const groups = [];
    const processed = new Set();

    for (let fruit of this.fruits) {
      if (fruitsToRemove.includes(fruit) || processed.has(fruit)) continue;

      // 같은 레벨의 모든 인접한 과일들을 BFS로 찾기
      const fullGroup = this.findAdjacentGroup(fruit, fruitsToRemove);
      
      if (fullGroup.length >= 2) {
        // 연결 그래프 기반으로 실제 인접 subgroup 생성
        const adjacencyMap = new Map();
        
        // 인접 관계 맵 구축
        for (let i = 0; i < fullGroup.length; i++) {
          adjacencyMap.set(fullGroup[i], []);
          for (let j = 0; j < fullGroup.length; j++) {
            if (i !== j && this.isAdjacent(fullGroup[i], fullGroup[j])) {
              adjacencyMap.get(fullGroup[i]).push(fullGroup[j]);
            }
          }
        }
        
        // 연결된 컴포넌트(서브그룹)들을 찾기
        const visited = new Set();
        const components = [];
        
        for (let startFruit of fullGroup) {
          if (visited.has(startFruit)) continue;
          
          // BFS로 이 과일과 연결된 모든 과일 찾기
          const component = [];
          const queue = [startFruit];
          visited.add(startFruit);
          
          while (queue.length > 0) {
            const current = queue.shift();
            component.push(current);
            
            const neighbors = adjacencyMap.get(current) || [];
            for (let neighbor of neighbors) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            }
          }
          
          if (component.length >= 2) {
            components.push(component);
          }
        }
        
        // 각 연결 컴포넌트 내에서 합이 10이 되는 모든 서브그룹 찾기
        for (let component of components) {
          const componentGroups = this.findSubgroupsWithSum10(component, adjacencyMap);
          groups.push(...componentGroups);
        }
        
        fullGroup.forEach(f => processed.add(f));
      }
    }

    return groups;
  }

  // 연결된 컴포넌트 내에서 합이 10이 되는 모든 서브그룹 찾기
  findSubgroupsWithSum10(component, adjacencyMap) {
    const result = [];
    const n = component.length;
    
    // 과일이 너무 많으면 (20개 이상) 효율적인 탐색 사용
    if (n > 20) {
      return this.findSubgroupsWithSum10Efficient(component, adjacencyMap);
    }
    
    // 모든 가능한 서브셋 생성 (비트마스크 사용)
    // 2개 이상의 과일만 고려
    for (let mask = 3; mask < (1 << n); mask++) {
      // 비트 카운트 (과일 개수) - 2개 미만이면 스킵
      const bitCount = this.countBits(mask);
      if (bitCount < 2) continue;
      
      const subset = [];
      let sum = 0;
      let valid = true;
      
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          // fruitNumber가 없으면 0으로 처리
          const num = component[i].fruitNumber || 0;
          subset.push(component[i]);
          sum += num;
          // 합이 이미 10을 넘으면 중단
          if (sum > 10) {
            valid = false;
            break;
          }
        }
      }
      
      // 2개 이상이고 합이 10이면 연결성 확인
      if (valid && subset.length >= 2 && sum === 10) {
        // 서브그룹이 연결되어 있는지 확인 (그래프 연결성)
        if (this.isConnected(subset, adjacencyMap)) {
          // 중복 체크
          const isDuplicate = result.some(g => 
            g.length === subset.length && 
            subset.every(f => g.includes(f))
          );
          
          if (!isDuplicate) {
            result.push(subset);
          }
        }
      }
    }
    
    // 우선순위: 1) 과일 개수가 적은 그룹부터, 2) 인덱스가 빠른 과일부터
    result.sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      // 길이가 같으면 첫 과일의 인덱스로 비교
      const aIdx = component.indexOf(a[0]);
      const bIdx = component.indexOf(b[0]);
      return aIdx - bIdx;
    });
    
    return result;
  }

  // 비트 카운트 헬퍼
  countBits(n) {
    let count = 0;
    while (n) {
      count += n & 1;
      n >>= 1;
    }
    return count;
  }

  // 대규모 그룹용 효율적 탐색 (연결된 서브셋 탐색)
  findSubgroupsWithSum10Efficient(component, adjacencyMap) {
    const result = [];
    const n = component.length;
    
    // BFS 기반으로 각 과일에서 시작해서 합이 10이 되는 연결된 서브셋 찾기
    for (let startIdx = 0; startIdx < n; startIdx++) {
      // BFS 상태: { currentSubset, sum, visitedIndices }
      // currentSubset: 현재까지 선택한 과일들의 배열
      // visitedIndices: 방문한 인덱스들의 Set
      const queue = [{
        subset: [component[startIdx]],
        sum: component[startIdx].fruitNumber,
        visited: new Set([startIdx])
      }];
      
      while (queue.length > 0) {
        const { subset, sum, visited } = queue.shift();
        
        // 합이 10이고 2개 이상이면 결과에 추가
        if (sum === 10 && subset.length >= 2) {
          // 중복 체크
          const isDuplicate = result.some(g => 
            g.length === subset.length && 
            subset.every(f => g.includes(f))
          );
          
          if (!isDuplicate) {
            result.push([...subset]);
          }
          // 계속 진행 - 더 큰 서브셋도 찾을 수 있음 (하지만 합이 10이면 더 확장 불필요)
          continue;
        }
        
        // 합이 10을 넘으면 중단
        if (sum > 10) continue;
        
        // 현재 서브셋의 모든 과일들의 이웃들을 고려
        // (서브셋 확장: 현재 서브셋에 인접하면서 아직 포함되지 않은 과일 추가)
        const expansionCandidates = new Set();
        
        for (let fruit of subset) {
          const neighbors = adjacencyMap.get(fruit) || [];
          for (let neighbor of neighbors) {
            const neighborIdx = component.indexOf(neighbor);
            if (neighborIdx !== -1 && !visited.has(neighborIdx)) {
              expansionCandidates.add(neighborIdx);
            }
          }
        }
        
        // 확장 후보들 중에서 각각 확장 시도
        for (let candidateIdx of expansionCandidates) {
          const newSum = sum + component[candidateIdx].fruitNumber;
          if (newSum <= 10) {
            queue.push({
              subset: [...subset, component[candidateIdx]],
              sum: newSum,
              visited: new Set([...visited, candidateIdx])
            });
          }
        }
      }
    }
    
    // 우선순위: 과일 개수가 적은 그룹부터
    result.sort((a, b) => a.length - b.length);
    
    return result;
  }

  // 서브그룹이 연결되어 있는지 확인
  isConnected(subset, adjacencyMap) {
    if (subset.length === 0) return false;
    if (subset.length === 1) return true;
    
    const subsetSet = new Set(subset);
    const visited = new Set();
    const queue = [subset[0]];
    visited.add(subset[0]);
    let count = 1;
    
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = adjacencyMap.get(current) || [];
      
      for (let neighbor of neighbors) {
        if (subsetSet.has(neighbor) && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          count++;
        }
      }
    }
    
    return count === subset.length;
  }

  // 두 과일 사이의 연결된 subgroup 찾기
  findConnectedSubgroup(fruitA, fruitB, adjacencyMap, fullGroup) {
    const visited = new Set([fruitA]);
    const queue = [fruitA];
    const group = [fruitA];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = adjacencyMap.get(current) || [];
      
      for (let neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          group.push(neighbor);
          queue.push(neighbor);
          
          // fruitB를 찾으면 현재까지의 그룹 반환
          if (neighbor === fruitB) {
            return group;
          }
        }
      }
    }
    
    return group;
  }

  // 배열 비교 유틸리티
  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x.level - y.level || x.x - y.x);
    const sortedB = [...b].sort((x, y) => x.level - y.level || x.x - y.x);
    return sortedA.every((item, index) => item === sortedB[index]);
  }

  findAdjacentGroup(startFruit, fruitsToRemove) {
    // 효과 중인 과일은 그룹에 포함되지 않음
    if (startFruit.isInRainbowEffect) return [];
    
    const startConfig = this.fruitConfigs[startFruit.level];
    const isStartRainbow = startConfig && startConfig.isRainbow;
    
    // 시작 과일이 레인보우면: 인접한 과일의 레벨을 따라 그룹을 여러 개 반환할 수 있음
    // 하지만 여기서는 한 그룹만 반환하므로, 첫 번째로 찾은 레벨로 고정
    if (isStartRainbow) {
      // 레인보우와 인접한 모든 과일들을 찾아서, 각 레벨별로 그룹을 분리
      const adjacentFruits = [];
      
      for (let fruit of this.fruits) {
        if (fruit.isInRainbowEffect) continue;
        if (fruitsToRemove.includes(fruit)) continue;
        if (fruit === startFruit) continue;
        
        const fruitConfig = this.fruitConfigs[fruit.level];
        if (!fruitConfig || fruitConfig.isRainbow || fruitConfig.isBomb) continue;
        
        if (this.isAdjacent(startFruit, fruit)) {
          adjacentFruits.push(fruit);
        }
      }
      
      // 인접한 과일이 없으면 빈 그룹
      if (adjacentFruits.length === 0) return [];
      
      // 첫 번째 인접 과일의 레벨을 기준으로 그룹 형성
      const baseLevel = adjacentFruits[0].level;
      const group = [startFruit, adjacentFruits[0]];
      const visited = new Set([startFruit, adjacentFruits[0]]);
      const queue = [adjacentFruits[0]];
      
      // 같은 레벨의 다른 인접 과일들도 추가
      while (queue.length > 0) {
        const current = queue.shift();
        
        for (let fruit of this.fruits) {
          if (visited.has(fruit)) continue;
          if (fruit.isInRainbowEffect) continue;
          if (fruitsToRemove.includes(fruit)) continue;
          
          const fruitConfig = this.fruitConfigs[fruit.level];
          if (!fruitConfig) continue;
          
          // 같은 레벨의 과일만 추가 (레인보우는 이미 포함됨)
          if (!fruitConfig.isRainbow && !fruitConfig.isBomb && fruit.level === baseLevel) {
            if (this.isAdjacent(current, fruit)) {
              visited.add(fruit);
              group.push(fruit);
              queue.push(fruit);
            }
          }
        }
      }
      
      return group;
    }
    
    // 레인보우가 아닌 경우: 기존 로직 유지
    const group = [startFruit];
    const queue = [startFruit];
    const visited = new Set([startFruit]);
    const baseLevel = startFruit.level;

    while (queue.length > 0) {
      const currentFruit = queue.shift();
      const currentConfig = this.fruitConfigs[currentFruit.level];
      const isCurrentRainbow = currentConfig && currentConfig.isRainbow;

      for (let fruit of this.fruits) {
        // 효과 중인 과일 제외
        if (fruit.isInRainbowEffect) continue;
        if (visited.has(fruit) || fruitsToRemove.includes(fruit)) continue;
        
        const fruitConfig = this.fruitConfigs[fruit.level];
        const isFruitRainbow = fruitConfig && fruitConfig.isRainbow;
        
        // 레인보우는 같은 레벨로 취급하여 인접 가능
        if (isFruitRainbow) {
          if (this.isAdjacent(currentFruit, fruit)) {
            visited.add(fruit);
            group.push(fruit);
            queue.push(fruit);
          }
          continue;
        }
        
        // 같은 레벨만 인접 가능
        if (fruit.level !== baseLevel) continue;

        // 인접한지 확인
        if (this.isAdjacent(currentFruit, fruit)) {
          visited.add(fruit);
          group.push(fruit);
          queue.push(fruit);
        }
      }
    }

    return group;
  }

  isAdjacent(fruit1, fruit2) {
    const distance = Phaser.Math.Distance.Between(fruit1.x, fruit1.y, fruit2.x, fruit2.y);
    const minDistance = fruit1.radius + fruit2.radius + 2; // 약간의 여유만 유지
    return distance < minDistance;
  }

  createMergedFruit(x, y, level, mergedCount = 1) {
    if (level >= this.fruitConfigs.length) return; // 최대 레벨 초과 방지

    const fruitConfig = this.fruitConfigs[level];
    const radius = fruitConfig.radius;
    const newNumber = this.getRandomNumberForLevel(level);

    // 스프라이트 기반 과일 생성
    const fruit = this.add.sprite(x, y, `fruit_${level}`);
    
    // 폭탄 과일 스케일 보정
    if (fruitConfig.isBomb) {
      fruit.setScale(radius / 142.5);
    } else {
      fruit.setScale(radius / 170);
    }
    
    fruit.setOrigin(0.5, 0.5);

    // Matter.js 물리 적용 (원형 바디 사용, 반지름을 정확히 설정)
    const Body = Phaser.Physics.Matter.Matter.Body;
    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
    
    this.matter.add.gameObject(fruit, {
      label: `fruit_${level}`,
      fruitLevel: level,
      shape: 'circle',
      circleRadius: radius
    });
    
    // 바디의 반지름을 정확히 설정
    if (fruit.body) {
      fruit.body.circleRadius = radius;
      // 바디 재설정 (slop을 0으로 설정하여 물리 엔진과의 유격을 최소화)
      const newBody = Bodies.circle(x, y, radius, {
        friction: 0.5,
        restitution: 0.2,
        density: 0.001,
        slop: 0
      });
      fruit.setExistingBody(newBody);
    }
    
    // 중력 적용을 위해 sleeping 상태 해제
    Sleeping.set(fruit.body, false);

    // 과일 정보 저장
    fruit.radius = radius;
    fruit.level = level;
    fruit.fruitNumber = newNumber;
    fruit.initialX = x;
    fruit.initialY = y;
    this.fruits.push(fruit);

    // 합쳐진 과일에도 움직임 추가
    this.addFruitMovement(fruit);

    // 레벨 생성 확인
    this.checkLevelCreation(level);

    // 과일 숫자 텍스트 추가
    let textContent = newNumber.toString();
    let textStyle = {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    };

    // 폭탄일 경우 타이머 텍스트 스타일 적용 (병합 생성 시)
    if (fruitConfig.isBomb) {
      // 폭탄 타이머 설정
      fruit.bombTimer = newNumber; 
      textContent = `${fruit.bombTimer}`;
      
      textStyle = {
        fontSize: '42px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        fontWeight: 'bold',
        align: 'center',
        stroke: '#ff4444',
        strokeThickness: 6,
        shadow: { color: '#000000', blur: 4, fill: true, stroke: true, offsetX: 2, offsetY: 2 }
      };
    }

    const fruitText = this.add.text(x, y, textContent, textStyle);
    fruitText.setOrigin(0.5, 0.5);
    fruitText.setDepth(10);
    fruit.fruitText = fruitText;

    // 점수 추가 (합쳐진 과일 갯수 * 레벨)
    // 1레벨: 합쳐진 과일 갯수만큼
    // 2레벨 이상: 합쳐진 과일 갯수 * 레벨
    let scoreToAdd;
    if (level === 1) {
      scoreToAdd = mergedCount;
    } else {
      scoreToAdd = mergedCount * level;
    }
    this.score += scoreToAdd;
    this.scoreText.setText(this.score);

    // 합쳐지는 이펙트 추가
    this.createMergeEffect(x, y, fruitConfig.color, radius);
  }

  createMergeEffect(x, y, color, radius) {
    // 파티클 이펙트 생성
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      
      const particle = this.add.circle(x, y, 4, color);
      particle.setDepth(15);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * (radius + 40),
        y: y + Math.sin(angle) * (radius + 40),
        alpha: 0,
        duration: 600,
        ease: 'Power2.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 중심 원형 펄스 이펙트
    const pulseCircle = this.add.circle(x, y, radius * 0.8, color);
    pulseCircle.setAlpha(0.6);
    pulseCircle.setDepth(14);
    
    this.tweens.add({
      targets: pulseCircle,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2.easeOut',
      onComplete: () => {
        pulseCircle.destroy();
      }
    });

    // 충격파 이펙트 (여러 개의 확장하는 원)
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 80, () => {
        const shockwave = this.add.circle(x, y, radius * 0.3, 0xffffff);
        shockwave.setAlpha(0.8);
        shockwave.setDepth(13);
        shockwave.setStrokeStyle(3, color);
        
        this.tweens.add({
          targets: shockwave,
          scaleX: 4,
          scaleY: 4,
          alpha: 0,
          duration: 600,
          ease: 'Quad.easeOut',
          onComplete: () => {
            shockwave.destroy();
          }
        });
      });
    }

    // 새 과일 텍스트만 스케일 애니메이션 (물리 바디는 건드리지 않음)
    const lastFruit = this.fruits[this.fruits.length - 1];
    if (lastFruit && lastFruit.fruitText) {
      lastFruit.fruitText.setScale(0.7);
      
      this.tweens.add({
        targets: lastFruit.fruitText,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
  }

  updatePreview(mouseX, mouseY) {
    const fruitConfig = this.fruitConfigs[this.previewLevel];
    const radius = fruitConfig.radius;

    // 미리보기 그래픽 초기화
    this.previewGraphics.clear();

    // 게임오버 경고 중이면 투명도 처리
    let alpha = 1;
    if (this.gameOverWarning) {
      alpha = 0.5; // 투명도 처리
    }

    // 숫자 텍스트 업데이트 (과일과 같은 순간에 등장하도록 먼저 처리)
    let textContent = this.previewNumber.toString();
    let textStyle = {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#333333',
      strokeThickness: 3,
      shadow: null
    };

    if (fruitConfig.isBomb) {
      textContent = `${this.previewNumber}`;
      textStyle = {
        fontSize: '42px', // 이전 미리보기 과일과 동일한 크기
        color: '#ffffff', // 흰색 (이전 미리보기 과일과 동일)
        fontFamily: 'Arial Black', // Arial Black 폰트 (이전 미리보기 과일과 동일)
        fontWeight: 'bold',
        stroke: '#ff4444', // 빨간색 테두리 (이전 미리보기 과일과 동일)
        strokeThickness: 6, // 테두리 두께 (이전 미리보기 과일과 동일)
        shadow: { color: '#000000', blur: 4, fill: true, stroke: true, offsetX: 2, offsetY: 2 } // 그림자 효과 (이전 미리보기 과일과 동일)
      };
    }

    // 스위치 모드일 때 미리보기 변경
    if (this.isSwitchMode) {
      // 텍스트를 표시하지 않음 (핵폭탄 버튼만 표시)
      textContent = '';
      textStyle = {
        fontSize: '1px',
        color: 'transparent',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        align: 'center'
      };
    }

    // 텍스트 업데이트 (스프라이트보다 먼저 처리하여 동시에 나타나도록)
    this.previewText.setText(textContent);
    this.previewText.setStyle(textStyle);
    this.previewText.setPosition(mouseX, mouseY);
    this.previewText.setAlpha(alpha);
    this.previewText.setVisible(true); // 항상 텍스트를 보이도록 설정

    // 스프라이트 기반 미리보기 (텍스처 사용)
    // sprite.scene이 없으면 destroyed된 상태이므로 새로 생성해야 함
    let textureKey = `fruit_${this.previewLevel}`;
    if (fruitConfig.isBomb) {
      textureKey = `fruit_bomb_${this.previewNumber}`;
    } else if (fruitConfig.isRainbow) {
      textureKey = 'fruit_rainbow';
    }

    // 스위치 모드일 때는 과일 모습 숨기기
    if (this.isSwitchMode) {
      if (this.previewSprite) {
        this.previewSprite.destroy(); // 완전히 제거
        this.previewSprite = null;
      }
      
      // 폭탄 버튼 디자인 (정사각형 바닥 - 더 작은 사이즈)
      this.previewGraphics.clear();
      
      // 정사각형 바닥 (회색) - 더 작게
      const baseSize = 60;
      const baseX = mouseX - baseSize / 2;
      const baseY = mouseY - baseSize / 2;
      
      // 바닥 그림자
      this.previewGraphics.fillStyle(0x000000, 0.3);
      this.previewGraphics.fillRoundedRect(baseX + 2, baseY + 2, baseSize, baseSize, 6);
      
      // 바닥 본체
      this.previewGraphics.fillStyle(0xbdc3c7, 1);
      this.previewGraphics.fillRoundedRect(baseX, baseY, baseSize, baseSize, 6);
      
      // 바닥 테두리
      this.previewGraphics.lineStyle(2, 0x95a5a6, 1);
      this.previewGraphics.strokeRoundedRect(baseX, baseY, baseSize, baseSize, 6);
      
      // 바닥 금속 질감 (그리드 선들) - 더 적은 선
      for (let i = 0; i < 4; i++) {
        // 가로 선
        const lineY = baseY + 10 + i * 10;
        this.previewGraphics.lineStyle(1, 0x95a5a6, 0.3);
        this.previewGraphics.beginPath();
        this.previewGraphics.moveTo(baseX + 6, lineY);
        this.previewGraphics.lineTo(baseX + baseSize - 6, lineY);
        this.previewGraphics.strokePath();
        
        // 세로 선
        const lineX = baseX + 10 + i * 10;
        this.previewGraphics.beginPath();
        this.previewGraphics.moveTo(lineX, baseY + 6);
        this.previewGraphics.lineTo(lineX, baseY + baseSize - 6);
        this.previewGraphics.strokePath();
      }
      
      // 버튼 그림자 (빨간색 폭탄 그림자) - 더 작게
      this.previewGraphics.fillStyle(0x990000, 1);
      this.previewGraphics.fillEllipse(mouseX, mouseY + 2, 35, 35);
      
      // 버튼 본체 (빨간색 폭탄) - 더 작게
      this.previewGraphics.fillStyle(0xe74c3c, 1);
      this.previewGraphics.fillEllipse(mouseX, mouseY, 35, 35);
      
      // 버튼 테두리 (어두운 빨간색)
      this.previewGraphics.lineStyle(2, 0xc0392b, 1);
      this.previewGraphics.strokeEllipse(mouseX, mouseY, 35, 35);
      
      // 이너 글로우 (하단부 어두운 영역) - 더 작게
      this.previewGraphics.fillStyle(0x990000, 0.6);
      this.previewGraphics.fillEllipse(mouseX, mouseY + 8, 30, 25);
      
      // 추가 하이라이트 (작은 반사광들) - 더 작게
      const highlights = [
        {x: -12, y: -4, size: 6, alpha: 0.4},
        {x: 8, y: -8, size: 4, alpha: 0.5},
        {x: -6, y: 10, size: 3, alpha: 0.3},
        {x: 12, y: 4, size: 4, alpha: 0.4}
      ];
      
      highlights.forEach(h => {
        this.previewGraphics.fillStyle(0xFFFFFF, h.alpha);
        this.previewGraphics.fillEllipse(mouseX + h.x, mouseY + h.y, h.size, h.size);
      });
      
      // "BOOM" 텍스트 - 기존 객체 재사용
      if (!this.boomText) {
        this.boomText = this.add.text(mouseX, mouseY, 'BOOM', {
          fontSize: '14px',
          color: '#FFFFFF',
          fontFamily: 'Arial Black',
          fontWeight: '900',
          align: 'center',
          stroke: 'rgba(0, 0, 0, 0.2)',
          strokeThickness: 1
        }).setOrigin(0.5);
        
        // 텍스트 그림자 효과
        this.boomText.setShadow(1, 1, 'rgba(0, 0, 0, 0.2)', 3);
      }
      
      // 텍스트 위치 업데이트
      this.boomText.setPosition(mouseX, mouseY);
      this.boomText.setVisible(true);
      this.boomText.setAlpha(alpha);
      
      // 외부 광택 효과 - 더 작게
      this.previewGraphics.fillStyle(0xFFFFFF, 0.1);
      this.previewGraphics.fillEllipse(mouseX, mouseY, 40, 40);
      
      this.previewGraphics.setAlpha(alpha);
    } else {
      // 스위치 모드가 아닐 때는 BOOM 텍스트 숨기기
      if (this.boomText) {
        this.boomText.setVisible(false);
      }
      
      if (!this.previewSprite || !this.previewSprite.active || !this.previewSprite.scene) {
        this.previewSprite = this.add.sprite(mouseX, mouseY, textureKey);
        this.previewSprite.setOrigin(0.5, 0.5);
        this.previewSprite.setDepth(5);
        this.previewSpriteRotation = 0;
      } else {
        // 기존 스프라이트 업데이트
        this.previewSprite.setTexture(textureKey);
        this.previewSprite.setPosition(mouseX, mouseY);
      }
      
      this.previewSprite.setVisible(true);
      
      // 폭탄 과일 스케일 보정 (MainScene.js dropFruit 참조)
      if (fruitConfig.isBomb) {
        this.previewSprite.setScale(radius / 142.5);
      } else {
        this.previewSprite.setScale(radius / 170);
      }

      this.previewSprite.setAlpha(alpha);
      this.previewSprite.setRotation(0);
      
      // 스위치 모드가 아닐 때는 그래픽 지우기
      this.previewGraphics.clear();
    }
  }

  playRainbowEffect(targetLevel, rainbowFruits, groupFruits) {
    // 동일 레벨의 모든 과일 찾기
    const sameLevelFruits = this.fruits.filter(f => 
      f.level === targetLevel && 
      !this.fruitConfigs[f.level].isRainbow && 
      !this.fruitConfigs[f.level].isBomb
    );
    
    // 모든 제거 대상 과일 (동종 + 레인보우)
    const allFruitsToRemove = [...sameLevelFruits, ...rainbowFruits];

    if (allFruitsToRemove.length === 0) return;
    
    // 레인보우 과일들에 효과 중 플래그 설정
    rainbowFruits.forEach(f => f.isInRainbowEffect = true);

    // 드롭 금지 설정 (3초)
    this.canDrop = false;
    this.time.delayedCall(3000, () => {
      this.canDrop = true;
    });

    // 합체 그룹 과일들 중 실제로 없어질 과일들만 하이라이트
    const highlightCircles = [];
    
    // allFruitsToRemove의 모든 과일에 하이라이트 표시
    allFruitsToRemove.forEach(fruit => {
      const isRainbow = this.fruitConfigs[fruit.level].isRainbow;
      
      if (isRainbow) {
        // 레인보우는 분홍색 링
        const highlight = this.add.circle(
          fruit.x, fruit.y, fruit.radius + 12,
          0xFF00FF, 0
        );
        highlight.setDepth(100);
        highlight.setStrokeStyle(5, 0xFF00FF);
        highlightCircles.push(highlight);
      } else {
        // 레인보우와 직접 인접 여부 확인
        const isAdjacentToRainbow = rainbowFruits.some(rf => this.isAdjacent(rf, fruit));
        
        if (isAdjacentToRainbow) {
          // 레인보우와 직접 인접한 과일 - 초록색 링
          const highlight = this.add.circle(
            fruit.x, fruit.y, fruit.radius + 12,
            0x00FF00, 0
          );
          highlight.setDepth(100);
          highlight.setStrokeStyle(5, 0x00FF00);
          highlightCircles.push(highlight);
        } else {
          // 같은 레벨이지만 레인보우와 직접 인접하지 않은 과일 - 파란색 링
          const highlight = this.add.circle(
            fruit.x, fruit.y, fruit.radius + 12,
            0x00BFFF, 0
          );
          highlight.setDepth(100);
          highlight.setStrokeStyle(5, 0x00BFFF);
          highlightCircles.push(highlight);
        }
      }
      
      // 맥동 효과 (모든 하이라이트에 적용)
      const lastHighlight = highlightCircles[highlightCircles.length - 1];
      this.tweens.add({
        targets: lastHighlight,
        scale: 1.4,
        duration: 400,
        yoyo: true,
        repeat: 4
      });
    });

    // 물리 고정
    allFruitsToRemove.forEach(fruit => {
      if (fruit.body) {
        const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
        Sleeping.set(fruit.body, true);
        fruit.body.isSleeping = true;
        fruit.body.velocity.x = 0;
        fruit.body.velocity.y = 0;
        fruit.body.angularVelocity = 0;
      }
    });

    // 2초 후 제거
    this.time.delayedCall(2000, () => {
      // 하이라이트 먼저 제거
      highlightCircles.forEach(h => h.destroy());
      
      allFruitsToRemove.forEach(fruit => {
        if (!fruit || !fruit.active) return;
        
        // 플래그 제거
        fruit.isInRainbowEffect = false;
        
        // 소멸 이펙트
        this.createSimpleVanishEffect(fruit.x, fruit.y, fruit.radius);

        if (fruit.fruitText) fruit.fruitText.destroy();
        
        const index = this.fruits.indexOf(fruit);
        if (index > -1) {
          this.fruits.splice(index, 1);
        }
        
        if (fruit.body) {
          this.matter.world.remove(fruit.body);
        }
        fruit.destroy();
      });
    });
  }

  // 간단한 소멸 이펙트 - 더 눈에 띄게
  createSimpleVanishEffect(x, y, radius = 30) {
    // 1. 중심 폭발 (흰색)
    const flash = this.add.circle(x, y, radius * 0.5, 0xFFFFFF);
    flash.setDepth(30);
    
    this.tweens.add({
      targets: flash,
      scale: 4,
      alpha: { from: 1, to: 0 },
      duration: 400,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
    
    // 2. 무지개 파티클 (8개)
    const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3, 0xFF1493];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const p = this.add.circle(x, y, 8, colors[i]);
      p.setDepth(29);
      
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * (radius + 40),
        y: y + Math.sin(angle) * (radius + 40),
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
    
    // 3. 노란색 링 확장
    const ring = this.add.circle(x, y, radius * 0.3, 0xFFD700);
    ring.setStrokeStyle(4, 0xFFD700);
    ring.setDepth(28);
    
    this.tweens.add({
      targets: ring,
      scale: 5,
      alpha: { from: 0.8, to: 0 },
      duration: 600,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
    
    // 안전장치: 1초 후 모두 제거
    this.time.delayedCall(1000, () => {
      if (flash.active) flash.destroy();
    });
  }

  // 과일에 살아있는 움직임 추가
  addFruitMovement(fruit) {
    // 표정 애니메이션 시작 (눈 깜빡임만)
    const fruitConfig = this.fruitConfigs[fruit.level];
    const isRainbow = fruitConfig && fruitConfig.isRainbow;
    
    // 레인보우 과일은 fruit_rainbow 텍스처 사용
    let currentTexture = isRainbow ? 'fruit_rainbow' : `fruit_${fruit.level}`;
    let isBlinking = false;
    
    // 눈 깜빡임 애니메이션
    const startBlinking = () => {
      if (!fruit.active || fruit.isScared) return; // 찡그린 표정일 때는 깜빡임 안 함
      
      // 깜빡임 텍스처로 변경
      const blinkTexture = isRainbow ? 'fruit_rainbow_blink' : `fruit_${fruit.level}_blink`;
      fruit.setTexture(blinkTexture);
      isBlinking = true;
      
      // 150ms 후 원래 텍스처로 복귀
      this.time.delayedCall(150, () => {
        if (fruit.active && !fruit.isScared) { // 찡그린 표정이 아닐 때만 복귀
          fruit.setTexture(currentTexture);
          isBlinking = false;
          
          // 다음 깜빡임 예약 (4-8초 후로 증가)
          fruit.blinkTimer = this.time.delayedCall(4000 + Math.random() * 4000, startBlinking);
        }
      });
    };
    
    // 첫 애니메이션 시작 (3-6초 후로 증가)
    fruit.blinkTimer = this.time.delayedCall(3000 + Math.random() * 3000, startBlinking);
    
    // 활성 상태 설정
    fruit.active = true;
  }

  // 무서운 표정 표시
  showScaredFace(fruit, duration = 1000) {
    if (!fruit.active) return;
    
    // 스프라이트인지 확인
    if (!fruit.setTexture) return;
    
    const fruitConfig = this.fruitConfigs[fruit.level];
    const isRainbow = fruitConfig && fruitConfig.isRainbow;
    
    // 폭탄은 제외
    if (fruitConfig && fruitConfig.isBomb) return;
    
    // 텍스처 키 설정
    const scaredTextureKey = isRainbow ? 'fruit_rainbow_scared' : `fruit_${fruit.level}_scared`;
    const baseTextureKey = isRainbow ? 'fruit_rainbow' : `fruit_${fruit.level}`;
    if (!this.textures.exists(scaredTextureKey)) {
      return;
    }
    
    const originalTexture = fruit.texture ? fruit.texture.key : `fruit_${fruit.level}`;
    
    // 찡그린 표정 상태 설정
    fruit.isScared = true;
    
    // 기존 눈 깜빡임 타이머 취소
    if (fruit.blinkTimer) {
      this.time.removeEvent(fruit.blinkTimer);
      fruit.blinkTimer = null;
    }
    
    try {
      fruit.setTexture(scaredTextureKey);
      
      // 지정된 시간 후 원래 텍스처로 복귀 (강제 복귀)
      const revertTimer = this.time.delayedCall(duration, () => {
        if (fruit.active && fruit.setTexture && this.textures.exists(originalTexture)) {
          fruit.setTexture(originalTexture);
          fruit.isScared = false; // 찡그린 표정 상태 해제
          
          // 눈 깜빡임 재시작
          this.restartBlinking(fruit);
        }
      });
      
      // 타이머 저장
      fruit.scaredTimer = revertTimer;
      
    } catch (error) {
      console.error(`표정 변경 실패: ${scaredTextureKey}`, error);
    }
  }

  restartBlinking(fruit) {
    if (!fruit.active || fruit.isScared) return;
    
    const fruitConfig = this.fruitConfigs[fruit.level];
    const isRainbow = fruitConfig && fruitConfig.isRainbow;
    
    let currentTexture = isRainbow ? 'fruit_rainbow' : `fruit_${fruit.level}`;
    
    const startBlinking = () => {
      if (!fruit.active || fruit.isScared) return;
      
      const blinkTexture = isRainbow ? 'fruit_rainbow_blink' : `fruit_${fruit.level}_blink`;
      fruit.setTexture(blinkTexture);
      
      this.time.delayedCall(150, () => {
        if (fruit.active && !fruit.isScared) {
          fruit.setTexture(currentTexture);
          
          // 다음 깜빡임 예약 (4-8초 후로 증가)
          fruit.blinkTimer = this.time.delayedCall(4000 + Math.random() * 4000, startBlinking);
        }
      });
    };
    
    // 재시작 시에도 3-6초 후로 증가
    fruit.blinkTimer = this.time.delayedCall(3000 + Math.random() * 3000, startBlinking);
  }
}
