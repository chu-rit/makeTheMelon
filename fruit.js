// 과일 정의
const FRUITS = [
    { circleRadius: 25, color: '#E74C3C', density: 0.001, score: 1, number: 1, name: '체리' },
    { circleRadius: 30, color: '#C0392B', density: 0.001, score: 2, number: 2, name: '딸기' },
    { circleRadius: 35, color: '#9B59B6', density: 0.001, score: 4, number: 3, name: '포도' },
    { circleRadius: 40, color: '#E67E22', density: 0.001, score: 8, number: 4, name: '오렌지' },
    { circleRadius: 45, color: '#F1C40F', density: 0.001, score: 16, number: 5, name: '감귤' },
    { circleRadius: 50, color: '#2ECC71', density: 0.001, score: 32, number: 6, name: '사과' },
    { circleRadius: 55, color: '#27AE60', density: 0.001, score: 64, number: 7, name: '배' },
    { circleRadius: 60, color: '#3498DB', density: 0.001, score: 128, number: 8, name: '복숭아' },
    { circleRadius: 65, color: '#2980B9', density: 0.001, score: 256, number: 9, name: '파인애플' },
    { circleRadius: 70, color: '#1ABC9C', density: 0.001, score: 512, number: 10, name: '멜론' },
    { circleRadius: 75, color: '#A569BD', density: 0.001, score: 1024, number: 11, name: '수박' }
];

// 과일 생성
function createFruit(x, y, fruitIndex) {
    const fruit = FRUITS[fruitIndex];
    
    const body = Bodies.circle(x, y, fruit.circleRadius, {
        restitution: 0.2,
        friction: 0.01,
        frictionAir: 0.03,
        frictionStatic: 0.5,
        density: fruit.density,
        render: {
            fillStyle: fruit.color,
            strokeStyle: '#000000',
            lineWidth: 1
        }
    });
    
    body.label = 'fruit';
    body.isFruit = true;
    body.fruitIndex = fruitIndex;
    body.id = Date.now() + Math.random(); // 고유 ID 생성
    
    World.add(engine.world, body);
    
    // 과일 라벨 생성
    createFruitLabel(body, nextFruitNumber);
    
    // 과일을 fruits 배열에 추가
    fruits.push(body);
    
    return body;
}

// 과일 합치기 검사 함수 추가
function checkFruitMerging() {
    // 과일을 종류별로 그룹화
    const fruitGroups = {};
    
    for (const fruit of fruits) {
        // 쿨타임 중인 과일은 건너뛰기
        if (fruit.cooldown) continue;
        
        const index = fruit.fruitIndex;
        if (!fruitGroups[index]) {
            fruitGroups[index] = [];
        }
        fruitGroups[index].push(fruit);
    }
    
    // 각 그룹에서 합이 10이 되는 조합 찾기
    for (const index in fruitGroups) {
        const combinations = findCombinationsWithSum10(fruitGroups[index]);
        
        // 찾은 조합 중에서 접촉 중인 것만 합치기
        for (const combination of combinations) {
            if (areFruitsInContact(combination)) {
                mergeFruits(combination);
                return; // 한 번에 하나의 조합만 합치기
            }
        }
    }
}

// 합이 10이 되는 과일 조합 찾기
function findCombinationsWithSum10(fruits) {
    const result = [];
    
    // 2개 조합 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            if (fruits[i].fruitNumber + fruits[j].fruitNumber === 10) {
                result.push([fruits[i], fruits[j]]);
            }
        }
    }
    
    // 3개 조합 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            for (let k = j + 1; k < fruits.length; k++) {
                if (fruits[i].fruitNumber + fruits[j].fruitNumber + fruits[k].fruitNumber === 10) {
                    result.push([fruits[i], fruits[j], fruits[k]]);
                }
            }
        }
    }
    
    // 4개 조합 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            for (let k = j + 1; k < fruits.length; k++) {
                for (let l = k + 1; l < fruits.length; l++) {
                    if (fruits[i].fruitNumber + fruits[j].fruitNumber + fruits[k].fruitNumber + fruits[l].fruitNumber === 10) {
                        result.push([fruits[i], fruits[j], fruits[k], fruits[l]]);
                    }
                }
            }
        }
    }
    
    // 5개 이상의 조합은 재귀 함수로 찾기
    if (fruits.length >= 5) {
        findCombinationsRecursive(fruits, [], 0, 0, result);
    }
    
    return result;
}

// 재귀적으로 합이 10이 되는 조합 찾기 (5개 이상)
function findCombinationsRecursive(fruits, currentCombination, currentIndex, currentSum, result) {
    // 현재 합이 10이고 조합의 크기가 5 이상이면 결과에 추가
    if (currentSum === 10 && currentCombination.length >= 5) {
        result.push([...currentCombination]);
        return;
    }
    
    // 합이 10을 초과하거나 모든 과일을 검사했으면 종료
    if (currentSum > 10 || currentIndex >= fruits.length) {
        return;
    }
    
    // 현재 과일을 포함하는 경우
    currentCombination.push(fruits[currentIndex]);
    findCombinationsRecursive(
        fruits,
        currentCombination,
        currentIndex + 1,
        currentSum + fruits[currentIndex].fruitNumber,
        result
    );
    currentCombination.pop();
    
    // 현재 과일을 제외하는 경우
    findCombinationsRecursive(
        fruits,
        currentCombination,
        currentIndex + 1,
        currentSum,
        result
    );
}

// 과일 라벨 제거 함수 추가
function removeFruitLabel(body) {
    if (fruitLabels[body.id]) {
        const label = fruitLabels[body.id];
        if (label && label.parentNode) {
            label.parentNode.removeChild(label);
        }
        delete fruitLabels[body.id];
    }
}

// 과일 라벨 생성 함수 추가
function createFruitLabel(body, number) {
    const label = document.createElement('div');
    label.textContent = number;
    label.style.position = 'absolute';
    label.style.left = `${body.position.x - 15}px`;
    label.style.top = `${body.position.y - 15}px`;
    label.style.color = 'white';
    label.style.fontWeight = 'bold';
    label.style.fontSize = '24px';
    label.style.textAlign = 'center';
    label.style.width = '30px';
    label.style.height = '30px';
    label.style.display = 'flex';
    label.style.justifyContent = 'center';
    label.style.alignItems = 'center';
    label.style.zIndex = 10;
    label.style.pointerEvents = 'none'; // 클릭 이벤트 무시
    
    container.appendChild(label);
    fruitLabels[body.id] = label;
}

// 과일 라벨 위치 업데이트 함수 추가
function updateFruitLabels() {
    for (let i = 0; i < engine.world.bodies.length; i++) {
        const body = engine.world.bodies[i];
        if (body.label === 'fruit' && fruitLabels[body.id]) {
            const label = fruitLabels[body.id];
            label.style.left = `${body.position.x - 15}px`;
            label.style.top = `${body.position.y - 15}px`;
        }
    }
}

// 랜덤 과일 숫자 생성 함수 (1-9, 작은 숫자 확률 높음)
function generateRandom() {
    const rand = Math.random();
    
    if (rand < 0.40) { // 40% 확률로 1-3 사이
        return Math.floor(Math.random() * 3) + 1;
    } else if (rand < 0.80) { // 40% 확률로 4-6 사이
        return Math.floor(Math.random() * 3) + 4;
    } else { // 20% 확률로 7-9 사이
        return Math.floor(Math.random() * 3) + 7;
    }
}

// 과일 합치기 함수
function mergeFruits(combination) {
    if (combination.length < 2) return;
    
    // 모든 과일이 같은 종류인지 확인
    const fruitType = combination[0].fruitIndex;
    for (let i = 1; i < combination.length; i++) {
        if (combination[i].fruitIndex !== fruitType) {
            return;
        }
    }
    
    // 합이 10인지 확인
    let sum = 0;
    for (let i = 0; i < combination.length; i++) {
        sum += combination[i].fruitNumber;
    }
    
    if (sum !== 10) {
        return;
    }
    
    // 모든 과일의 위치 평균 계산
    let avgX = 0;
    let avgY = 0;
    
    for (let i = 0; i < combination.length; i++) {
        avgX += combination[i].position.x;
        avgY += combination[i].position.y;
    }
    
    avgX /= combination.length;
    avgY /= combination.length;
    
    // 다음 과일 인덱스 계산 (최대 10까지)
    const nextFruitIndex = Math.min(fruitType + 1, 10);
    
    // 과일 제거
    for (let i = 0; i < combination.length; i++) {
        removeBody(combination[i]);
        removeFruitLabel(combination[i]);
    }
    
    // 새로운 과일 생성
    const newFruit = createFruit(avgX, avgY, nextFruitIndex);
    
    // 랜덤 숫자 생성 함수 사용
    const randomNumber = generateRandom();
    newFruit.fruitNumber = randomNumber;
    
    // 합쳐진 과일 개수에 따른 보너스 점수 계산
    const bonusMultiplier = 1 + ((combination.length - 2) * 0.5);
    const scoreToAdd = Math.round(FRUITS[nextFruitIndex].score * bonusMultiplier);
    
    // 합쳐짐 로그 추가
    const fruitName = FRUITS[fruitType].name;
    const numbersText = combination.map(fruit => fruit.fruitNumber).join(', ');
    const newFruitName = FRUITS[nextFruitIndex].name;
    const logText = `${fruitName}(${numbersText}) → ${newFruitName}(${randomNumber}) (${scoreToAdd}점, ${combination.length}개 과일 보너스: x${bonusMultiplier.toFixed(1)})`;
    console.log(logText);
    
    // 기존 과일 라벨 제거 후 새로 생성
    removeFruitLabel(newFruit);
    createFruitLabel(newFruit, randomNumber);
    
    // 쿨타임 설정 - 0.5초 동안 합치기 불가능
    newFruit.cooldown = true;
    setTimeout(() => {
        newFruit.cooldown = false;
    }, 500);
    
    // 점수 추가
    score += scoreToAdd;
    document.getElementById('score').textContent = score;
}

// 대기 중인 과일 표시
function updateWaitingFruit() {
    const fruit = FRUITS[nextFruitIndex];
    
    waitingFruitElement.style.width = `${fruit.circleRadius * 2}px`;
    waitingFruitElement.style.height = `${fruit.circleRadius * 2}px`;
    waitingFruitElement.style.backgroundColor = fruit.color;
    waitingFruitElement.style.borderRadius = '50%';
    waitingFruitElement.style.display = 'flex';
    waitingFruitElement.style.justifyContent = 'center';
    waitingFruitElement.style.alignItems = 'center';
    waitingFruitElement.style.color = 'white';
    waitingFruitElement.style.fontWeight = 'bold';
    waitingFruitElement.style.fontSize = `${fruit.circleRadius * 0.8}px`;
    waitingFruitElement.textContent = nextFruitNumber;
    waitingFruitElement.style.position = 'absolute';
    waitingFruitElement.style.left = `${mouseX - fruit.circleRadius}px`;
    waitingFruitElement.style.top = '70px';
    
    waitingFruitElement.style.display = canDropFruit ? 'flex' : 'none';
}

// 다음 과일 미리보기 생성
function generateNextPreviewFruit() {
    // 현재 점수에 따라 사용 가능한 최대 과일 인덱스 결정
    let maxFruitIndex = 0;
    
    if (score >= 500) {
        maxFruitIndex = 5; // 500점 이상: 사과까지
    } else if (score >= 400) {
        maxFruitIndex = 4; // 400점 이상: 감귤까지
    } else if (score >= 300) {
        maxFruitIndex = 3; // 300점 이상: 오렌지까지
    } else if (score >= 200) {
        maxFruitIndex = 2; // 200점 이상: 포도까지
    } else if (score >= 100) {
        maxFruitIndex = 1; // 100점 이상: 딸기까지
    } else {
        maxFruitIndex = 0; // 100점 미만: 체리만
    }
    
    // 사용 가능한 과일 범위 내에서 랜덤 선택
    afterNextFruitIndex = Math.floor(Math.random() * (maxFruitIndex + 1));
    
    // 랜덤 숫자 생성 함수 사용
    afterNextFruitNumber = generateRandom();
}

// 다음 과일 미리보기 업데이트
function updatePreviewFruit() {
    const fruit = FRUITS[afterNextFruitIndex];
    
    previewFruitElement.style.width = `${fruit.circleRadius * 1.5}px`;
    previewFruitElement.style.height = `${fruit.circleRadius * 1.5}px`;
    previewFruitElement.style.backgroundColor = fruit.color;
    previewFruitElement.style.borderRadius = '50%';
    previewFruitElement.style.display = 'flex';
    previewFruitElement.style.justifyContent = 'center';
    previewFruitElement.style.alignItems = 'center';
    previewFruitElement.style.color = 'white';
    previewFruitElement.style.fontWeight = 'bold';
    previewFruitElement.style.fontSize = `${fruit.circleRadius * 0.6}px`;
    previewFruitElement.textContent = afterNextFruitNumber;
}

// 과일들이 서로 접촉 중인지 확인
function areFruitsInContact(fruits) {
    if (fruits.length <= 1) return true;
    
    // 모든 과일이 직접 접촉하는지 확인 (그래프 연결 확인)
    const n = fruits.length;
    const connected = Array(n).fill().map(() => Array(n).fill(false));
    
    // 각 과일 쌍에 대해 접촉 여부 확인
    for (let i = 0; i < n; i++) {
        connected[i][i] = true; // 자기 자신과는 연결됨
        
        for (let j = i + 1; j < n; j++) {
            const dx = fruits[i].position.x - fruits[j].position.x;
            const dy = fruits[i].position.y - fruits[j].position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const fruitA = FRUITS[fruits[i].fruitIndex];
            const fruitB = FRUITS[fruits[j].fruitIndex];
            const minDistance = fruitA.circleRadius + fruitB.circleRadius;
            
            // 접촉 여부 확인 (여유 공간 추가)
            if (distance <= minDistance + 5) {
                connected[i][j] = connected[j][i] = true;
            }
        }
    }
    
    // 모든 과일이 하나의 연결된 그룹을 형성하는지 확인 (BFS 사용)
    const visited = Array(n).fill(false);
    const queue = [0]; // 첫 번째 과일부터 시작
    visited[0] = true;
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        for (let i = 0; i < n; i++) {
            if (connected[current][i] && !visited[i]) {
                visited[i] = true;
                queue.push(i);
            }
        }
    }
    
    // 모든 과일이 방문되었는지 확인
    return visited.every(v => v);
}

// 과일 드롭
function dropFruit() {
    if (!canDropFruit) return;
    
    canDropFruit = false;
    
    const x = mouseX;
    const y = 120;
    
    // 과일 생성
    const fruit = createFruit(x, y, nextFruitIndex);
    
    // 생성된 과일에 대기 중이던 과일의 숫자 할당
    fruit.fruitNumber = nextFruitNumber;
    
    // 다음 과일 준비
    updateNextFruit();
    
    // 일정 시간 후 다시 과일 드롭 가능하도록 설정
    setTimeout(() => {
        canDropFruit = true;
        updateWaitingFruit();
    }, 500);
}

// 다음 과일 준비
function updateNextFruit() {
    // 현재 대기 중인 과일을 다음 미리보기 과일로 업데이트
    nextFruitIndex = afterNextFruitIndex;
    nextFruitNumber = afterNextFruitNumber;
    
    // 새로운 다음 과일 미리보기 생성
    generateNextPreviewFruit();
    
    // 대기 중인 과일 업데이트
    updateWaitingFruit();
    
    // 다음 과일 미리보기 업데이트
    updatePreviewFruit();
}