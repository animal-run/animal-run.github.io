const animalNames = [
  '원숭이', '펭귄', '분홍 토끼', '기린', '여우',
  '코끼리', '판다', '호랑이', '코알라', '흰색 토끼'
];
const grid = document.getElementById('animal-grid');
const startBtn = document.getElementById('start-btn');
const raceContainer = document.getElementById('race-container');
const resultDiv = document.getElementById('result');
const optionsDiv = document.getElementById('options');
const modeSelect = document.getElementById('mode');
const countSelect = document.getElementById('count');
const images = animalNames.map((_, i) => `./images/animal${i + 1}.png`);
let selected = [], runners = [], trackWidth = 0, trackHeight = 60;

// ✅ 이미지 사전 로딩
const bgList = ['./images/background-track.webp', './images/background-sand.webp', './images/background-savannah.webp'];
[...images, ...bgList].forEach(src => { const img = new Image(); img.src = src; });

// ✅ 동물 선택 UI
images.forEach((src, idx) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'item';
  const img = document.createElement('img');
  img.src = src; img.alt = animalNames[idx]; img.loading = "eager";
  img.addEventListener('click', () => toggleSelect(img, idx));
  const cap = document.createElement('span');
  cap.className = 'caption'; cap.textContent = animalNames[idx];
  wrapper.append(img, cap); grid.appendChild(wrapper);
});

function toggleSelect(img, idx) {
  if (img.classList.contains('selected')) {
    img.classList.remove('selected');
    selected = selected.filter(i => i !== idx);
  } else if (selected.length < 10) {
    img.classList.add('selected');
    selected.push(idx);
  }
  updateCountOptions();
  startBtn.disabled = selected.length < 2 || selected.length > 10;
}

function updateCountOptions() {
  countSelect.innerHTML = "";
  const maxCount = selected.length || 1;
  for (let i = 1; i <= maxCount; i++) {
    const opt = document.createElement("option");
    opt.value = i; opt.textContent = i + "명";
    countSelect.appendChild(opt);
  }
  countSelect.value = 1;
}

startBtn.addEventListener('click', () => {
  const trackBgList = ['background-track.webp', 'background-sand.webp', 'background-savannah.webp'];
  const trackImg = trackBgList[Math.floor(Math.random() * trackBgList.length)];
  raceContainer.style.background =
    trackImg.includes('sand') || trackImg.includes('savannah')
      ? `url('./images/${trackImg}') center/cover no-repeat` : 'none';

  grid.style.display = 'none'; startBtn.style.display = 'none'; optionsDiv.style.display = 'none';
  raceContainer.style.display = 'block';

  trackHeight = Math.max(40, Math.min(window.innerWidth * 0.15, 60));
  raceContainer.style.height = `${selected.length * trackHeight}px`;
  runRace(selected, trackImg);
});

function runRace(arr, trackImg) {
  raceContainer.innerHTML = ""; resultDiv.textContent = "";
  trackWidth = raceContainer.clientWidth - 60; runners = []; const finishOrder = [];

  arr.forEach((idx, i) => {
    const track = document.createElement('div');
    track.className = 'track'; track.style.top = `${i * trackHeight}px`;
    track.style.height = trackHeight + "px";
    if (i === arr.length - 1) track.style.borderBottom = "none";
    track.style.backgroundImage = trackImg.includes('track') ? `url('./images/${trackImg}')` : 'none';
    raceContainer.appendChild(track);

    const runner = document.createElement('div');
    runner.className = 'runner'; runner.style.top = `${i * trackHeight}px`;
    runner.style.height = trackHeight + "px";

    const img = document.createElement('img');
    img.src = images[idx]; img.loading = "eager";
    img.style.width = (trackHeight * 0.65) + "px";

    const rankEl = document.createElement('span');
    rankEl.className = 'rank';
    rankEl.textContent = "0위";
    rankEl.style.fontSize = (trackHeight * 0.3) + "px";

    runner.appendChild(img);
    runner.appendChild(rankEl);
    raceContainer.appendChild(runner);

    // ✅ baseSpeed 분산 (초반 격차 발생)
    const totalFrames = Math.random() * 100 + 450; 
    const baseSpeed = trackWidth / totalFrames;

    runners.push({
      idx, el: runner, x: 0, progress: 0,
      baseSpeed, speed: baseSpeed, frame: 0
    });
  });

  function animate() {
    runners.forEach(runner => {
      if (finishOrder.includes(runner)) return;
      runner.frame++;

      // ✅ 역전 빈번: 전 구간 20% 확률, 0.5~2.0배 속도 변동
      if (Math.random() < 0.2) {
        const fluctuation = Math.random() * 1.5 + 0.5;
        runner.speed = runner.baseSpeed * fluctuation;
      }

      const wobble = Math.sin(runner.frame / 5) * 2;
      runner.x += runner.speed;
      runner.progress = runner.x / trackWidth;
      runner.el.style.transform = `translate(${runner.x}px, ${wobble}px)`;

      if (runner.x >= trackWidth) {
        finishOrder.push(runner);
        runner.el.style.transform = `translate(${trackWidth}px,0)`;
        const rank = runner.el.querySelector('.rank');
        rank.style.color = "#333";
        rank.textContent = `${finishOrder.length}위`;
        if (finishOrder.length === runners.length) showResult(finishOrder);
      }
    });

    if (finishOrder.length < runners.length) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function showResult(order) {
  const mode = modeSelect.value;
  const count = Math.min(parseInt(countSelect.value), selected.length);
  let result = [];
  if (mode === "win") result = order.slice(0, count).map(r => animalNames[r.idx]);
  else if (mode === "lose") result = order.slice(-count).map(r => animalNames[r.idx]);
  resultDiv.innerHTML = `🎉 ${mode === "win" ? "당첨" : "탈락"}: ${result.join(", ")}<br><button id="next-round">재시작</button>`;
  document.getElementById("next-round").addEventListener("click", resetGame);
}

function resetGame() {
  raceContainer.style.display = "none"; grid.style.display = "grid";
  optionsDiv.style.display = "flex"; startBtn.style.display = "block";
  resultDiv.textContent = ""; selected = [];
  document.querySelectorAll('.item img').forEach(img => img.classList.remove('selected'));
  startBtn.disabled = true; modeSelect.value = "win"; updateCountOptions();
}

window.addEventListener("resize", () => {
  if (!runners.length) return;
  trackWidth = raceContainer.clientWidth - 60;
  trackHeight = Math.max(40, Math.min(window.innerWidth * 0.15, 60));
  raceContainer.style.height = `${selected.length * trackHeight}px`;
  runners.forEach((runner, i) => {
    runner.x = runner.progress * trackWidth;
    runner.el.style.transform = `translate(${runner.x}px,0)`;
    runner.el.style.top = `${i * trackHeight}px`;
    runner.el.style.height = trackHeight + "px";
    runner.el.querySelector("img").style.width = (trackHeight * 0.65) + "px";
    runner.el.querySelector(".rank").style.fontSize = (trackHeight * 0.3) + "px";
  });
});

updateCountOptions();
