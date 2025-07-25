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
let selected = [], runners = [], trackWidth = 0, trackHeight = 60;

// ✅ 동물 선택 UI
animalNames.forEach((name, idx) => {
  const item = document.createElement('div');
  item.className = 'item';
  item.textContent = name;
  item.addEventListener('click', () => {
    if (item.classList.contains('selected')) {
      item.classList.remove('selected');
      selected = selected.filter(i => i !== idx);
    } else if (selected.length < 10) {
      item.classList.add('selected');
      selected.push(idx);
    }
    updateCountOptions();
    startBtn.disabled = selected.length < 2 || selected.length > 10;
  });
  grid.appendChild(item);
});

function updateCountOptions() {
  countSelect.innerHTML = "";
  const maxCount = selected.length || 1;
  for (let i = 1; i <= maxCount; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i + "명";
    countSelect.appendChild(opt);
  }
  countSelect.value = 1;
}

startBtn.addEventListener('click', () => {
  grid.style.display = 'none';
  startBtn.style.display = 'none';
  optionsDiv.style.display = 'none';
  raceContainer.style.display = 'block';
  trackHeight = Math.max(40, Math.min(window.innerWidth * 0.15, 60));
  raceContainer.style.height = `${selected.length * trackHeight}px`;
  runRace();
});

function runRace() {
  raceContainer.innerHTML = "";
  resultDiv.textContent = "";
  trackWidth = raceContainer.clientWidth - 60;
  runners = [];
  const finishOrder = [];

  selected.forEach((idx, i) => {
    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.style.top = `${i * trackHeight}px`;
    runner.style.width = runner.style.height = trackHeight + "px";
    runner.textContent = animalNames[idx].slice(0, 2);
    runner.style.background = randomColor();

    const rankEl = document.createElement('span');
    rankEl.className = 'rank';
    rankEl.textContent = "0위";
    runner.appendChild(rankEl);
    raceContainer.appendChild(runner);

    // ✅ baseSpeed 분산 (초반 격차)
    const totalFrames = Math.random() * 100 + 450;
    const baseSpeed = trackWidth / totalFrames;
    runners.push({ idx, el: runner, x: 0, progress: 0, baseSpeed, speed: baseSpeed, frame: 0 });
  });

  function animate() {
    runners.forEach(runner => {
      if (finishOrder.includes(runner)) return;
      runner.frame++;

      // ✅ 역전 빈번: 전 구간에서 20% 확률, 0.5~2.0배 속도 변동
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
  if (mode === "win")
    result = order.slice(0, count).map(r => animalNames[r.idx]);
  else if (mode === "lose")
    result = order.slice(-count).map(r => animalNames[r.idx]);

  resultDiv.innerHTML = `🎉 ${mode === "win" ? "당첨" : "탈락"}: ${result.join(", ")}<br><button id="next-round">재시작</button>`;
  document.getElementById("next-round").addEventListener("click", resetGame);
}

function resetGame() {
  raceContainer.style.display = "none";
  grid.style.display = "grid";
  optionsDiv.style.display = "block";
  startBtn.style.display = "block";
  resultDiv.textContent = "";
  selected = [];
  document.querySelectorAll('.item').forEach(it => it.classList.remove('selected'));
  startBtn.disabled = true;
  modeSelect.value = "win";
  updateCountOptions();
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
    runner.el.style.width = runner.el.style.height = trackHeight + "px";
  });
});

function randomColor() {
  const colors = ['#ff5722','#3f51b5','#4caf50','#e91e63','#9c27b0','#ff9800','#00bcd4','#795548','#607d8b','#cddc39'];
  return colors[Math.floor(Math.random() * colors.length)];
}

updateCountOptions();
