// script.js

// 게임 팁 배열
const gameTips = [
  "💡 동물을 많이 선택할수록 더 재미있는 경주가 됩니다!",
  "💡 달리는 중 동물이 넘어질 수 있어요. 긴장감이 가득합니다!",
  "💡 꼴찌가 갑자기 빨라져서 역전할 수도 있어요!",
  "💡 선두가 느려져서 순위가 뒤바뀔 수 있습니다!",
  "💡 마지막 20% 구간에서 극한의 긴장감을 느껴보세요!",
  "💡 동물마다 다른 속도로 달려요. 예측이 어려워요!",
  "💡 부스터를 받은 동물은 순식간에 앞으로 나갑니다!",
  "💡 결과는 완전히 랜덤이에요. 누가 이길지 모릅니다!",
  "💡 3,2,1 카운트다운 후에 경주가 시작됩니다!"
];

// 랜덤 팁 표시 함수
function showRandomTip() {
  const tipElement = document.querySelector('.tip-text');
  const randomTip = gameTips[Math.floor(Math.random() * gameTips.length)];
  tipElement.textContent = randomTip;
}

// 페이지 로드 시 팁 표시
document.addEventListener('DOMContentLoaded', () => {
  showRandomTip();
});

const animalNames = [
  '원숭이', '펭귄', '분홍 토끼', '기린', '여우',
  '코끼리', '판다', '호랑이', '코알라', '흰색 토끼'
];
const grid = document.getElementById('animal-grid');
const startBtn = document.getElementById('startBtn');
const raceContainer = document.getElementById('race-container');
const resultDiv = document.getElementById('result');
const images = animalNames.map((_, i) => `./images/animal${i + 1}.png`);

let selected = [], runners = [], trackWidth = 0, trackHeight = 60;
let animationId = null;
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

// 이미지 사전 로딩 (배경 포함)
const bgList = [
  './images/background-track.webp',
  './images/background-sand.webp',
  './images/background-savannah.webp'
];
[...images, ...bgList].forEach(src => {
  const img = new Image();
  img.src = src;
});

// 동물 선택 UI
images.forEach((src, idx) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'item';
  const img = document.createElement('img');
  img.src = src;
  img.alt = animalNames[idx];
  img.loading = "eager";
  img.addEventListener('click', () => toggleSelect(img, idx));
  const cap = document.createElement('span');
  cap.className = 'caption';
  cap.textContent = animalNames[idx];
  wrapper.append(img, cap);
  grid.appendChild(wrapper);
});

function toggleSelect(img, idx) {
  if (img.classList.contains('selected')) {
    img.classList.remove('selected');
    selected = selected.filter(i => i !== idx);
  } else if (selected.length < 10) {
    img.classList.add('selected');
    selected.push(idx);
  }
  startBtn.disabled = selected.length < 2;
}

  // 게임 시작
  startBtn.addEventListener('click', () => {
    if (selected.length < 2) return;
    
    // UI 전환
    grid.style.opacity = '0';
    grid.style.transform = 'scale(0.95)';
    startBtn.style.opacity = '0';
    startBtn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      grid.style.display = 'none';
      startBtn.style.display = 'none';
      
      // 게임 팁 숨기기
      const gameTip = document.getElementById('gameTip');
      if (gameTip) {
        gameTip.style.display = 'none';
      }
      
      raceContainer.style.display = 'block';
      raceContainer.style.opacity = '1';
      raceContainer.style.transform = 'scale(1)';
      
      startRace();
    }, 300);
  });

  // 게임 시작 함수
  function startRace() {
    const trackBgList = [
      'background-track.webp',
      'background-sand.webp',
      'background-savannah.webp'
    ];
    const trackImg = trackBgList[Math.floor(Math.random() * trackBgList.length)];

    // 레이스 컨테이너 등장 애니메이션
    raceContainer.style.opacity = '0';
    raceContainer.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      raceContainer.style.opacity = '1';
      raceContainer.style.transform = 'scale(1)';
    }, 50);
    
    adjustLayout();
    showCountdown(selected, trackImg, () => runRace(selected, trackImg));
  }

  // 카운트다운 함수 추가
function showCountdown(arr, trackImg, onComplete) {
  // 먼저 동물들을 트랙에 배치 (아직 움직이지 않음)
  prepareRunners(arr, trackImg);
  
  const countdownDiv = document.createElement('div');
  countdownDiv.id = 'countdown';
  countdownDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 60px;
    font-weight: bold;
    color: #fff;
    text-shadow: 4px 4px 8px rgba(0,0,0,0.8);
    z-index: 2000;
    opacity: 0;
    transition: all 0.3s ease;
    text-align: center;
    white-space: nowrap;
  `;
  
  document.body.appendChild(countdownDiv);
  
  let count = 3;
  
  function showNumber() {
    if (count > 0) {
      countdownDiv.textContent = count;
      countdownDiv.style.opacity = '1';
      countdownDiv.style.transform = 'translate(-50%, -50%) scale(1.2)';
      
      setTimeout(() => {
        countdownDiv.style.opacity = '0';
        countdownDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
      }, 800);
      
      count--;
      setTimeout(showNumber, 1000);
    } else {
      // START!
      countdownDiv.textContent = 'START!';
      countdownDiv.style.opacity = '1';
      countdownDiv.style.transform = 'translate(-50%, -50%) scale(1.1)';
      countdownDiv.style.color = '#FFFFFF';
      
      setTimeout(() => {
        countdownDiv.style.opacity = '0';
        countdownDiv.style.transform = 'translate(-50%, -50%) scale(0.5)';
        
        setTimeout(() => {
          countdownDiv.remove();
          onComplete();
        }, 300);
      }, 1000);
    }
  }
  
  showNumber();
}

// 동물들을 트랙에 미리 배치하는 함수
function prepareRunners(arr, trackImg) {
  raceContainer.innerHTML = "";
  resultDiv.textContent = "";
  trackWidth = raceContainer.clientWidth - 60;
  runners = [];
  const finishOrder = [];
  lastTime = performance.now();
  const gameStartTime = performance.now(); // 게임 시작 시간 추가

  arr.forEach((idx, i) => {
    // 각 동물마다 개별 트랙 생성
    const track = document.createElement('div');
    track.className = 'track';
    track.style.top = `${i * trackHeight}px`;
    track.style.height = trackHeight + "px";
    track.style.backgroundImage = `url(./images/${trackImg})`;
    track.style.backgroundRepeat = "repeat-x";
    track.style.backgroundSize = "auto 100%";
    track.style.backgroundPosition = "0px center";
    track.style.borderRadius = '0px';
    track.style.border = 'none';
    
    if (i === arr.length - 1) track.style.borderBottom = "none";
    
    raceContainer.appendChild(track);

    // 러너 생성
    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.style.top = `${i * trackHeight}px`;
    runner.style.height = trackHeight + "px";

    const img = document.createElement('img');
    img.src = images[idx];
    img.loading = "eager";
    img.style.width = (trackHeight * 0.65) + "px";

    const rankEl = document.createElement('span');
    rankEl.className = 'rank';
    rankEl.textContent = "0위";
    rankEl.style.fontSize = (trackHeight * 0.3) + "px";
    rankEl.style.opacity = 0;

    runner.appendChild(img);
    runner.appendChild(rankEl);
    raceContainer.appendChild(runner);

    // 일관된 속도 계산 (시간 기반) - 더 긴 시간으로 조정
    const baseDuration = 12000 + Math.random() * 6000; // 12-18초 (기존 6-8초에서 2배 증가)
    const baseSpeed = trackWidth / (baseDuration / 16.67); // 60fps 기준

    // 후반부 속도 변동 프레임 (더 극적으로)
    const changeFrames = [];
    const changeCount = Math.floor(Math.random() * 4) + 6; // 6-9회 (기존 4-6회에서 증가)
    while (changeFrames.length < changeCount) {
      const f = Math.floor(Math.random() * (baseDuration / 16.67) * 0.9);
      if (!changeFrames.includes(f)) changeFrames.push(f);
    }
    changeFrames.sort((a, b) => a - b);

    runners.push({
      idx,
      el: runner,
      track: track, // 트랙 요소 참조 추가
      x: 0,
      progress: 0,
      baseSpeed,
      speed: baseSpeed,
      changeFrames,
      frame: 0,
      slowCount: 0,
      boostCount: 0,
      boostFrames: 0,
      lastUpdate: 0,
      // 넘어짐 관련 속성 추가
      isFallen: false,
      fallFrames: 0,
      fallCount: 0,
      // 출발 차이 추가
      startDelay: Math.random() * 1500 + 500, // 0.5~2초 랜덤 출발 지연
      hasStarted: false
    });
  });
}

function runRace(arr, trackImg) {
  // 이미 동물들이 배치되어 있으므로 바로 애니메이션 시작
  const finishOrder = [];
  lastTime = performance.now();
  const gameStartTime = performance.now(); // 게임 시작 시간 추가

  // 배경 이동 효과 - 각 트랙별로 개별 처리
  let bgOffset = 0;

  function animate(currentTime) {
    if (finishOrder.length >= runners.length) {
      return;
    }

    const deltaTime = currentTime - lastTime;
    
    if (deltaTime >= frameInterval) {
      lastTime = currentTime - (deltaTime % frameInterval);
      
      // 각 트랙별로 배경 이동 (더 빠른 속도로 조정)
      bgOffset -= 8; // 기존 3에서 8로 증가 (약 2.7배 빠름)
      runners.forEach(runner => {
        if (runner.track) {
          runner.track.style.backgroundPosition = `${bgOffset}px center`;
        }
      });

      const minX = Math.min(...runners.map(r => r.x));
      const maxX = Math.max(...runners.map(r => r.x));

      runners.forEach(runner => {
        if (finishOrder.includes(runner)) return;
        
        runner.frame++;
        runner.lastUpdate = currentTime;

        // 출발 지연 처리 (수정된 로직)
        if (!runner.hasStarted) {
          if (currentTime - gameStartTime >= runner.startDelay) {
            runner.hasStarted = true;
          } else {
            return; // 아직 출발하지 않음
          }
        }

        // 넘어짐 상태 처리
        if (runner.isFallen) {
          runner.fallFrames--;
          if (runner.fallFrames <= 0) {
            runner.isFallen = false;
            runner.el.classList.remove('fallen');
            // 넘어짐 후 부스터 효과
            runner.boostFrames = 100;
          } else {
            // 넘어짐 중에는 움직이지 않음
            return;
          }
        }

        // 넘어짐 이벤트 (매우 낮은 확률)
        if (!runner.isFallen && runner.fallCount < 1 && Math.random() < 0.0002) {
          runner.isFallen = true;
          runner.fallFrames = 90; // 1.5초간 멈춤
          runner.fallCount++;
          runner.el.classList.add('fallen');
          
          // 넘어짐 애니메이션 효과
          const fallIcon = document.createElement('div');
          fallIcon.className = 'fall-icon';
          fallIcon.textContent = '💥';
          fallIcon.style.position = 'absolute';
          fallIcon.style.right = '10px';
          fallIcon.style.top = '50%';
          fallIcon.style.transform = 'translateY(-50%)';
          fallIcon.style.fontSize = '20px';
          fallIcon.style.zIndex = '10';
          runner.el.appendChild(fallIcon);
          
          setTimeout(() => fallIcon.remove(), 1000);
        }

        let speedFactor = 1;

        // 중간 지점에서 갑작스러운 스퍼트 (아이콘 없이, 적당한 효과)
        if (runner.progress > 0.2 && runner.progress < 0.8 && Math.random() < 0.015) { // 0.02에서 0.015로 감소
          speedFactor *= Math.random() * 1.5 + 1.5; // 1.5~3.0× (더 적당하게)
          runner.boostFrames = 100;
        }

        // 후반부 역전/부스터 로직 (아이콘 없이, 적당한 효과)
        if (runner.progress > 0.5) {
          if (
            runner.x === maxX &&
            runner.slowCount < 2 && // 3에서 2로 감소
            Math.random() < 0.2 // 0.3에서 0.2로 감소
          ) {
            // 선두가 갑자기 느려짐 (적당하게)
            speedFactor = Math.random() * 0.3 + 0.5; // 0.5~0.8× (너무 느려지지 않게)
            runner.slowCount++;
            
          } else if (
            runner.x === minX &&
            runner.boostCount < 2 && // 3에서 2로 감소
            Math.random() < 0.25 // 0.4에서 0.25로 감소
          ) {
            // 꼴찌가 갑자기 빨라짐 (적당하게)
            speedFactor = Math.random() * 1.5 + 2.0;   // 2.0~3.5× (더 적당하게)
            runner.boostCount++;
            runner.boostFrames = 120;

            // 부스터 효과 표시 (캐릭터 앞쪽)
            const boostIcon = document.createElement('div');
            boostIcon.className = 'boost-icon';
            boostIcon.textContent = '⚡';
            boostIcon.style.position = 'absolute';
            boostIcon.style.right = '-30px';
            boostIcon.style.top = '50%';
            boostIcon.style.transform = 'translateY(-50%)';
            boostIcon.style.fontSize = '20px';
            boostIcon.style.zIndex = '10';
            runner.el.appendChild(boostIcon);
            setTimeout(() => boostIcon.remove(), 500);
          } else if (Math.random() < 0.15) { // 0.25에서 0.15로 감소
            // 일반적인 속도 변동 (적당하게)
            speedFactor = Math.random() < 0.5
              ? Math.random() * 0.2 + 0.6  // 0.6~0.8× (너무 느려지지 않게)
              : Math.random() * 0.8 + 1.2; // 1.2~2.0× (적당하게 빨라짐)
          }
        }

        // 부스터 지속 처리 (적당한 효과)
        if (runner.boostFrames > 0) {
          speedFactor *= 1.5; // 2.0에서 1.5로 감소
          runner.boostFrames--;
        }
        // 일반 변동 (적당한 빈도, 적당한 효과)
        else if (runner.changeFrames.includes(runner.frame)) {
          speedFactor = Math.random() < 0.4
            ? Math.random() * 0.2 + 0.6  // 0.6~0.8× (너무 느려지지 않게)
            : Math.random() * 0.6 + 1.2; // 1.2~1.8× (적당하게 빨라짐)
        }

        // 기본 속도 보정 (아이템이 없어도 적당한 속도 유지)
        if (speedFactor < 0.7) {
          speedFactor = 0.7; // 너무 느려지지 않도록 최소 속도 보장
        }

        runner.speed = runner.baseSpeed * speedFactor;
        runner.x += runner.speed;
        runner.progress = runner.x / trackWidth;
        
        // 더 역동적인 움직임 (빠른 움직임 느낌 강화)
        const wobble = Math.sin(runner.frame / 8) * 2.5; // 기존 12에서 8로, 1.2에서 2.5로 증가
        const rotation = Math.sin(runner.frame / 15) * 3; // 새로운 회전 효과 추가
        const bounce = Math.abs(Math.sin(runner.frame / 10)) * 1.5; // 새로운 바운스 효과 추가
        
        runner.el.style.transform = `translate3d(${runner.x}px, ${wobble + bounce}px, 0) rotate(${rotation}deg)`;

        // 피니시 라인 긴장감 (마지막 20% 구간)
        if (runner.progress > 0.8) {
          // 피니시 근처 극한 속도 변화
          if (Math.random() < 0.08) { // 더 자주 발생
            if (runner.x === maxX) {
              // 선두가 갑자기 느려짐 (극한 긴장감)
              speedFactor = Math.random() * 0.2 + 0.3; // 0.3~0.5× (더 극적으로 느려짐)
              
              // 슬로우 효과 표시 (피니시에서는 아이콘 표시)
              const slowIcon = document.createElement('div');
              slowIcon.className = 'slow-icon';
              slowIcon.textContent = '🐌';
              slowIcon.style.position = 'absolute';
              slowIcon.style.left = '-30px';
              slowIcon.style.top = '50%';
              slowIcon.style.transform = 'translateY(-50%)';
              slowIcon.style.fontSize = '20px';
              slowIcon.style.zIndex = '10';
              runner.el.appendChild(slowIcon);
              setTimeout(() => slowIcon.remove(), 1000);
              
            } else if (runner.x === minX) {
              // 꼴찌가 갑자기 빨라짐 (극한 역전)
              speedFactor = Math.random() * 2.0 + 3.0; // 3.0~5.0× (더 극적으로 빨라짐)
              runner.boostFrames = 150;

              // 부스터 효과 표시 (피니시에서는 더 큰 아이콘)
              const boostIcon = document.createElement('div');
              boostIcon.className = 'boost-icon';
              boostIcon.textContent = '⚡';
              boostIcon.style.position = 'absolute';
              boostIcon.style.right = '-30px';
              boostIcon.style.top = '50%';
              boostIcon.style.transform = 'translateY(-50%)';
              boostIcon.style.fontSize = '24px';
              boostIcon.style.zIndex = '10';
              runner.el.appendChild(boostIcon);
              setTimeout(() => boostIcon.remove(), 800);
              
            } else {
              // 중간 순위들의 극한 변동
              speedFactor = Math.random() < 0.5
                ? Math.random() * 0.3 + 0.4  // 0.4~0.7× (느려짐)
                : Math.random() * 1.5 + 2.0; // 2.0~3.5× (빨라짐)
            }
          }
        }

        if (runner.x >= trackWidth) {
          finishOrder.push(runner);
          runner.el.classList.add('jump');
          const rank = runner.el.querySelector('.rank');
          rank.style.opacity = 1;
          rank.textContent = `${finishOrder.length}위`;
          
          // 순위별 색상 차별화
          if (finishOrder.length === 1) {
            rank.style.color = '#FFD700'; // 금색
            rank.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
          } else if (finishOrder.length === 2) {
            rank.style.color = '#C0C0C0'; // 은색
          } else if (finishOrder.length === 3) {
            rank.style.color = '#CD7F32'; // 동색
          }
          
          if (finishOrder.length === runners.length) {
            setTimeout(() => showResult(finishOrder), 800);
          }
        }
      });
    }

    animationId = requestAnimationFrame(animate);
  }

  animationId = requestAnimationFrame(animate);
}

function showResult(order) {
  const winner = order[0];
  const rest = order.slice(1)
    .map((r, i) => `${i+2}위: ${animalNames[r.idx]}`)
    .join('<br>');

  // 배경 오버레이 생성
  const backdrop = document.createElement('div');
  backdrop.className = 'result-backdrop';
  document.body.appendChild(backdrop);

  const overlay = document.createElement('div');
  overlay.id = "result-overlay";
  overlay.innerHTML = `
    <div class="winner">🎉 당첨: ${animalNames[winner.idx]}</div>
    <div class="others">${rest}</div>
    <button id="next-round">다시 시작</button>
  `;

  // body에 직접 추가 (전체 화면 덮기)
  document.body.appendChild(overlay);

  document.getElementById("next-round").addEventListener("click", () => {
    overlay.style.opacity = '0';
    backdrop.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      backdrop.remove();
      resetGame();
    }, 150);
  });
}

function resetGame() {
  // 애니메이션 정리
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  raceContainer.style.opacity = '0';
  raceContainer.style.transform = 'scale(0.9)';
  
  setTimeout(() => {
    raceContainer.style.display = "none";
    grid.style.display = "grid";
    startBtn.style.display = "block";
    
    // 초기 상태로 복원
    grid.style.opacity = '1';
    grid.style.transform = 'scale(1)';
    startBtn.style.opacity = '1';
    startBtn.style.transform = 'scale(1)';
    
    // 게임 팁 다시 보이기
    const gameTip = document.getElementById('gameTip');
    if (gameTip) {
      gameTip.style.display = 'block';
    }
    
    resultDiv.textContent = "";
    selected = [];
    document.querySelectorAll('.item img').forEach(img => img.classList.remove('selected'));
    startBtn.disabled = true;
    
    // 새로운 팁 표시
    showRandomTip();
  }, 300);
}

function adjustLayout() {
  // 트랙 높이를 동일하게 고정 (동물 수와 무관)
  trackHeight = 60;
  
  // 트랙 컨테이너 높이를 트랙 크기에 정확히 맞춤
  const containerHeight = trackHeight * selected.length;
  raceContainer.style.height = `${containerHeight}px`;

  runners.forEach((runner, i) => {
    runner.el.style.top = `${i * trackHeight}px`;
    runner.el.style.height = `${trackHeight}px`;
    runner.el.querySelector("img").style.width = `${trackHeight * 0.65}px`;

    const rankEl = runner.el.querySelector(".rank");
    rankEl.style.fontSize = `${trackHeight * 0.3}px`;
    rankEl.style.left = `-${trackHeight * 0.55}px`;
  });
}

window.addEventListener("resize", adjustLayout);

// 초기 버튼 비활성화
startBtn.disabled = true;