// 게임 설정
const FRUITS = [
    { name: '체리', radius: 25, color: '#FF0000', number: 1, weight: 0.001 },
    { name: '딸기', radius: 35, color: '#FF3366', number: 2, weight: 0.0015 },
    { name: '포도', radius: 45, color: '#9400D3', number: 3, weight: 0.002 },
    { name: '오렌지', radius: 55, color: '#FFA500', number: 4, weight: 0.0025 },
    { name: '감', radius: 65, color: '#FF8C00', number: 5, weight: 0.003 },
    { name: '사과', radius: 75, color: '#FF6347', number: 6, weight: 0.0035 },
    { name: '배', radius: 85, color: '#ADFF2F', number: 7, weight: 0.004 },
    { name: '복숭아', radius: 95, color: '#FFC0CB', number: 8, weight: 0.0045 },
    { name: '파인애플', radius: 105, color: '#FFD700', number: 9, weight: 0.005 },
    { name: '메론', radius: 115, color: '#32CD32', number: 10, weight: 0.0055 },
    { name: '수박', radius: 125, color: '#008000', number: 11, weight: 0.006 }
];

// 과일 생성
function createFruit(x, y, fruitIndex) {
    const fruit = FRUITS[fruitIndex];
    
    // 대기 중인 과일의 숫자 사용
    const randomNumber = waitingFruitNumber;
    
    const body = Bodies.circle(x, y, fruit.radius, {
        restitution: 0.2, // 탄성 감소 (기존 0.3에서 0.2로)
        friction: 10, // 마찰력 증가 
        frictionAir: 0.005, // 공기 마찰력 증가 (기존 0.002에서 0.005로)
        density: fruit.weight, // 과일 무게 사용
        slop: 0.01, // 물체 간 겹침 허용 오차 감소
        timeScale: 1.0, // 시간 스케일 정상화
        render: {
            fillStyle: fruit.color,
            strokeStyle: fruit.color,
            lineWidth: 0
        },
        fruitIndex: fruitIndex,
        number: randomNumber, // 대기 중인 과일의 숫자 사용
        id: Date.now() + Math.random() // 고유 ID 할당
    });

    // 과일 내부에 숫자 표시
    const text = document.createElement('div');
    text.style.position = 'absolute';
    text.style.color = 'white';
    text.style.fontWeight = 'bold';
    text.style.fontSize = `${fruit.radius * 0.8}px`;
    text.style.userSelect = 'none';
    text.style.pointerEvents = 'none';
    text.style.textAlign = 'center';
    text.style.width = `${fruit.radius * 2}px`;
    text.style.height = `${fruit.radius * 2}px`;
    text.style.lineHeight = `${fruit.radius * 2}px`;
    text.textContent = randomNumber; // 대기 중인 과일의 숫자 사용
    text.id = `text-${body.id}`;  // 고유 ID 부여
    container.appendChild(text);

    // 과일 위치에 따라 숫자 위치 업데이트
    const updateTextPosition = function() {
        const textElement = document.getElementById(`text-${body.id}`);
        if (!textElement) {
            Events.off(engine, 'afterUpdate', updateTextPosition);
            return;
        }
        
        if (body.position) {
            textElement.style.left = `${body.position.x - fruit.radius}px`;
            textElement.style.top = `${body.position.y - fruit.radius}px`;
        } else {
            textElement.remove();
            Events.off(engine, 'afterUpdate', updateTextPosition);
        }
    };

    Events.on(engine, 'afterUpdate', updateTextPosition);
    
    // 과일에 텍스트 ID 저장
    body.textId = `text-${body.id}`;
    
    return body;
}

// 대기 중인 과일 업데이트 (HTML 요소)
function updateWaitingFruit() {
    const fruit = FRUITS[nextFruitIndex];
    
    // 대기 중인 과일 스타일 설정
    waitingFruitElement.style.width = `${fruit.radius * 2}px`;
    waitingFruitElement.style.height = `${fruit.radius * 2}px`;
    waitingFruitElement.style.backgroundColor = fruit.color;
    waitingFruitElement.style.fontSize = `${fruit.radius * 0.8}px`;
    waitingFruitElement.textContent = waitingFruitNumber; // 저장된 숫자 사용
    waitingFruitElement.style.left = `${mouseX}px`;
    waitingFruitElement.style.top = '100px';
    
    // 대기 중인 과일 표시
    waitingFruitElement.style.display = canDropFruit ? 'flex' : 'none';
}

// 두 과일이 접촉 중인지 확인
function areFruitsTouching(fruitA, fruitB) {
    const dx = fruitB.position.x - fruitA.position.x;
    const dy = fruitB.position.y - fruitA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radiusSum = fruitA.radius + fruitB.radius;
    return distance <= radiusSum + 5; // 5픽셀 여유 추가
}

// DFS로 연결된 과일 그룹 찾기
function dfs(index, visited, adjacencyMatrix, fruits, group) {
    visited[index] = true;
    group.push(fruits[index]);

    for (let i = 0; i < fruits.length; i++) {
        if (adjacencyMatrix[index][i] && !visited[i]) {
            dfs(i, visited, adjacencyMatrix, fruits, group);
        }
    }
}

// 모든 과일 그룹 찾기
function findAllFruitGroups(fruits) {
    const adjacencyMatrix = Array.from({ length: fruits.length }, () => Array(fruits.length).fill(false));

    // 모든 과일 쌍에 대해 접촉 여부 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            if (areFruitsTouching(fruits[i], fruits[j])) {
                adjacencyMatrix[i][j] = true;
                adjacencyMatrix[j][i] = true;
            }
        }
    }

    // 방문 여부 추적
    const visited = Array(fruits.length).fill(false);
    const allGroups = [];

    // 모든 과일에 대해 연결된 그룹 찾기
    for (let i = 0; i < fruits.length; i++) {
        if (!visited[i]) {
            const group = [];
            dfs(i, visited, adjacencyMatrix, fruits, group);
            if (group.length > 0) {
                allGroups.push(group);
            }
        }
    }

    return allGroups;
}

// 과일 드롭
function dropFruit(x) {
    if (!canDropFruit || isGameOver) return;

    canDropFruit = false;
    
    // 대기 중인 과일 숨기기
    waitingFruitElement.style.display = 'none';
    
    // 실제 물리 효과가 있는 과일 생성
    currentFruit = createFruit(x, 100, nextFruitIndex);
    World.add(engine.world, currentFruit);

    // 다음 과일 준비
    waitingFruitNumber = Math.floor(Math.random() * 9) + 1; 
    nextFruitIndex = 0; // 항상 체리(인덱스 0)로 설정
    while(waitingFruitNumber == 1) { // 체리와 다른 숫자 생성
        waitingFruitNumber = Math.floor(Math.random() * 9) + 1;
    }
    
    // 일정 시간 후 다음 과일 드롭 가능
    setTimeout(() => {
        canDropFruit = true;
        currentFruit = null;
        
        // 다음 과일 표시 업데이트
    }, 500);
}

 // 과일 그룹 확인 및 합치기 함수
 function checkFruitGroups() {
    if (isGameOver) return;
    
    // 모든 과일 가져오기
    const bodies = Composite.allBodies(engine.world);
    const fruits = bodies.filter(body => body.fruitIndex !== undefined);
    
    // 과일이 2개 미만이면 처리할 필요 없음
    if (fruits.length < 2) return;
    
    // 모든 과일 그룹 찾기
    const allGroups = findAllFruitGroups(fruits);
    
    // 각 그룹 내에서 같은 과일 종류의 숫자 합이 10인 과일 찾기
    let mergedAny = false;
    
    allGroups.forEach(group => {
        if (group.length > 1) {
            // 같은 종류의 과일끼리 그룹화
            const fruitTypeGroups = {};
            
            group.forEach(fruit => {
                const key = `${fruit.fruitIndex}`;
                if (!fruitTypeGroups[key]) {
                    fruitTypeGroups[key] = [];
                }
                fruitTypeGroups[key].push(fruit);
            });
            
            // 같은 종류의 과일 중 합이 10인 그룹 찾기
            for (const key in fruitTypeGroups) {
                const sameTypeGroup = fruitTypeGroups[key];
                if (sameTypeGroup.length >= 2) {
                    // 모든 가능한 부분 그룹 찾기
                    const subgroups = findSubgroupsWithSum10(sameTypeGroup);
                    
                    // 이미 처리된 과일 추적
                    const processedFruits = new Set();
                    
                    // 부분 그룹 합치기 (가장 큰 부분 그룹부터)
                    subgroups.sort((a, b) => b.length - a.length);
                    
                    for (const subgroup of subgroups) {
                        // 이미 처리된 과일이 있는지 확인
                        const alreadyProcessed = subgroup.some(fruit => processedFruits.has(fruit.id));
                        if (alreadyProcessed) continue;
                        
                        // 디버깅: 부분 그룹 정보 출력
                        const fruitType = FRUITS[subgroup[0].fruitIndex].name;
                        const subNumbers = subgroup.map(fruit => fruit.number).join('+');
                        console.log(`같은 종류(${fruitType})의 과일 중 합이 10인 그룹 발견: ${subNumbers} = 10`);
                        
                        // 부분 그룹 합치기
                        mergeFruits(subgroup);
                        mergedAny = true;
                        
                        // 처리된 과일 표시
                        subgroup.forEach(fruit => processedFruits.add(fruit.id));
                    }
                }
            }
        }
    });
    
    // 과일이 합쳐졌으면 다시 검사 (연쇄 반응을 위해)
    if (mergedAny) {
        setTimeout(checkFruitGroups, 100);
    }
}

// 그룹 내에서 합이 10이 되는 부분 그룹 찾기
function findSubgroupsWithSum10(group) {
    const subgroups = [];
    
    // 모든 과일 쌍에 대해 접촉 여부 확인
    const adjacencyMatrix = Array(group.length).fill().map(() => Array(group.length).fill(false));
    
    for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
            if (areFruitsTouching(group[i], group[j])) {
                adjacencyMatrix[i][j] = true;
                adjacencyMatrix[j][i] = true;
            }
        }
    }
    
    // 모든 가능한 부분 그룹 찾기
    const findConnectedSubgroups = (startIdx, visited = new Set(), currentGroup = []) => {
        visited.add(startIdx);
        currentGroup.push(group[startIdx]);
        
        // 현재 부분 그룹의 합 계산
        const sum = currentGroup.reduce((total, fruit) => total + fruit.number, 0);
        
        // 합이 10이면 부분 그룹 추가
        if (sum === 10) {
            subgroups.push([...currentGroup]);
        }
        
        // 합이 10보다 작으면 계속 탐색
        if (sum < 10) {
            for (let i = 0; i < group.length; i++) {
                if (!visited.has(i) && adjacencyMatrix[startIdx][i]) {
                    findConnectedSubgroups(i, new Set([...visited]), [...currentGroup]);
                }
            }
        }
    };
    
    // 모든 과일에서 시작하여 부분 그룹 찾기
    for (let i = 0; i < group.length; i++) {
        findConnectedSubgroups(i, new Set(), []);
    }
    
    // 중복 제거 (동일한 과일 조합은 하나만 유지)
    const uniqueSubgroups = [];
    const seen = new Set();
    
    for (const subgroup of subgroups) {
        // 과일 ID를 정렬하여 고유 키 생성
        const key = subgroup.map(fruit => fruit.id).sort().join(',');
        if (!seen.has(key)) {
            seen.add(key);
            uniqueSubgroups.push(subgroup);
        }
    }
    
    return uniqueSubgroups;
}

// 모든 과일 그룹 찾기 함수
function findAllFruitGroups(fruits) {
    // 과일 간의 접촉 여부를 저장하는 인접 행렬
    const adjacencyMatrix = Array(fruits.length).fill().map(() => Array(fruits.length).fill(false));
    
    // 모든 과일 쌍에 대해 접촉 여부 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            if (areFruitsTouching(fruits[i], fruits[j])) {
                adjacencyMatrix[i][j] = true;
                adjacencyMatrix[j][i] = true;
            }
        }
    }
    
    // 방문 여부 추적
    const visited = Array(fruits.length).fill(false);
    const allGroups = [];
    
    // 모든 과일에 대해 연결된 그룹 찾기
    for (let i = 0; i < fruits.length; i++) {
        if (!visited[i]) {
            const group = [];
            dfs(i, visited, adjacencyMatrix, fruits, group);
            if (group.length > 0) {
                allGroups.push(group);
            }
        }
    }
    
    return allGroups;
}

// DFS로 연결된 과일 그룹 찾기
function dfs(index, visited, adjacencyMatrix, fruits, group) {
    visited[index] = true;
    group.push(fruits[index]);
    
    for (let i = 0; i < fruits.length; i++) {
        if (adjacencyMatrix[index][i] && !visited[i]) {
            dfs(i, visited, adjacencyMatrix, fruits, group);
        }
    }
}

// 두 과일이 접촉 중인지 확인
function areFruitsTouching(fruitA, fruitB) {
    const dx = fruitB.position.x - fruitA.position.x;
    const dy = fruitB.position.y - fruitA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 두 과일의 반지름 합
    const radiusSum = FRUITS[fruitA.fruitIndex].radius + FRUITS[fruitB.fruitIndex].radius;
    
    // 거리가 반지름 합보다 작거나 같으면 접촉 중
    return distance <= radiusSum + 5; // 5픽셀 여유 추가
}

// 과일 합치기 함수
function mergeFruits(group) {
    // 그룹의 중심 위치 계산
    let centerX = 0;
    let centerY = 0;
    group.forEach(fruit => {
        centerX += fruit.position.x;
        centerY += fruit.position.y;
    });
    centerX /= group.length;
    centerY /= group.length;
    
    // 텍스트 요소 제거
    group.forEach(fruit => {
        if (fruit.textId) {
            const text = document.getElementById(fruit.textId);
            if (text) text.remove();
        }
        
        // 과일 제거
        World.remove(engine.world, fruit);
    });
    
    // 현재 과일보다 한 단계 큰 과일 생성
    const currentFruitIndex = group[0].fruitIndex;
    const nextFruitIndex = Math.min(currentFruitIndex + 1, FRUITS.length - 1);
    const newFruit = createFruit(centerX, centerY, nextFruitIndex);
    World.add(engine.world, newFruit);
    
    // 점수 업데이트
    const bonusScore = 100 + (group.length * 10); // 기본 100점 + 과일당 10점
    score += bonusScore;
    document.getElementById('score').textContent = `점수: ${score}`;
    
    // 합쳐진 과일 로그
    console.log(`과일 합치기 완료! 보너스 점수: ${bonusScore}`);
}