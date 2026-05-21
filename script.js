document.addEventListener('DOMContentLoaded', () => {
  // Загружаем данные
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      window.appData = data;
      // Тема
      initTheme();
      // Рендер всех разделов
      renderAll(data);
      // Навигация
      setupNavigation();
      // Поиск игроков
      setupSearch(data);
      // Анимация таблицы (сработает при первом открытии раздела Table)
      observeTableSection(data);
      // Закрытие модального окна
      document.querySelector('.close').addEventListener('click', closeModal);
      window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('match-modal')) closeModal();
      });
    })
    .catch(err => console.error('Ошибка загрузки data.json:', err));
});

/* ========== Тема ========== */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark-theme');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

/* ========== Рендер всего ========== */
function renderAll(data) {
  renderHome(data);
  renderStandings(data);    // таблица заполнится, но числа будут видны после анимации
  renderSchedule(data);
  renderPlayerStats(data.players);
  renderTeams(data.teams, data.players);
}

/* ========== Главная страница (LIVE, завершённые, ближайшие) ========== */
function renderHome(data) {
  const liveContainer = document.getElementById('home-live');
  const finishedContainer = document.getElementById('home-finished');
  const upcomingContainer = document.getElementById('home-upcoming');

  const liveMatches = data.matches.filter(m => m.status === 'live');
  const finishedMatches = data.matches.filter(m => m.status === 'finished').slice(-4).reverse();
  const upcomingMatches = data.matches.filter(m => m.status === 'upcoming');

  const buildMatchCards = (matches, showLiveBadge = false) => {
    if (!matches.length) return '<p>Нет матчей</p>';
    return `<div class="match-cards">${matches.map(m => `
      <div class="match-card" data-match-id="${m.id}">
        ${showLiveBadge ? '<span class="live-badge">LIVE</span>' : ''}
        <div class="match-teams">
          <span class="team-name">${m.homeTeam}</span>
          <span class="score">${m.homeScore !== null ? m.homeScore : '-'} : ${m.awayScore !== null ? m.awayScore : '-'}</span>
          <span class="team-name">${m.awayTeam}</span>
        </div>
        <div class="match-details">${m.date} | ${m.time} | ${m.stadium || ''}</div>
      </div>
    `).join('')}</div>`;
  };

  liveContainer.innerHTML = `<h3>🔥 Прямой эфир</h3>${buildMatchCards(liveMatches, true)}`;
  finishedContainer.innerHTML = `<h3>✅ Последние результаты</h3>${buildMatchCards(finishedMatches)}`;
  upcomingContainer.innerHTML = `<h3>📅 Ближайшие матчи</h3>${buildMatchCards(upcomingMatches)}`;

  // Вешаем клики на все карточки
  document.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.matchId);
      const match = data.matches.find(m => m.id === id);
      if (match) showMatchDetail(match, data.players);
    });
  });
}

/* ========== Турнирная таблица (с анимацией) ========== */
function renderStandings(data) {
  const tbody = document.querySelector('#standings-table tbody');
  if (!tbody) return;
  data.standings.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  // Сохраняем сортированный массив
  window.sortedStandings = data.standings;
  // Генерируем строки с data-атрибутами для анимации
  tbody.innerHTML = data.standings.map((t, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${t.team}</td>
      <td class="anim-num" data-target="${t.played}">0</td>
      <td class="anim-num" data-target="${t.wins}">0</td>
      <td class="anim-num" data-target="${t.draws}">0</td>
      <td class="anim-num" data-target="${t.losses}">0</td>
      <td><span class="anim-num" data-target="${t.goalsFor}">0</span>:<span class="anim-num" data-target="${t.goalsAgainst}">0</span></td>
      <td class="anim-num" data-target="${t.points}">0</td>
    </tr>
  `).join('');
}

// Анимация чисел с использованием IntersectionObserver
function observeTableSection(data) {
  const section = document.getElementById('table');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumbersInTable();
        observer.unobserve(section); // только один раз
      }
    });
  }, { threshold: 0.5 });
  observer.observe(section);
}

function animateNumbersInTable() {
  const elements = document.querySelectorAll('#standings-table .anim-num');
  elements.forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 600; // мс
    const startTime = performance.now();
    const startValue = 0;
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  });
}

/* ========== Расписание с вкладками по турам ========== */
function renderSchedule(data) {
  const tourTabs = document.getElementById('tour-tabs');
  const matchesList = document.getElementById('matches-list');
  if (!tourTabs || !matchesList) return;

  // Находим уникальные туры, сортируем
  const tours = [...new Set(data.matches.map(m => m.tour))].sort((a,b) => a-b);
  
  // Рендерим вкладки
  tourTabs.innerHTML = tours.map(tour => `
    <button class="tab-btn" data-tour="${tour}">Тур ${tour}</button>
  `).join('');

  let activeTour = tours[0];
  // Функция отображения матчей выбранного тура
  const showMatches = (tour) => {
    const matches = data.matches.filter(m => m.tour === tour);
    // Группируем по дате
    const grouped = {};
    matches.forEach(m => {
      if (!grouped[m.date]) grouped[m.date] = [];
      grouped[m.date].push(m);
    });
    let html = '';
    for (const [date, games] of Object.entries(grouped)) {
      html += `<h3>${date}</h3><div class="match-cards">`;
      games.forEach(m => {
        html += `
          <div class="match-card" data-match-id="${m.id}">
            <div class="match-teams">
              <span class="team-name">${m.homeTeam}</span>
              <span class="score">${m.homeScore !== null ? m.homeScore : '-'} : ${m.awayScore !== null ? m.awayScore : '-'}</span>
              <span class="team-name">${m.awayTeam}</span>
            </div>
            <div class="match-details">${m.time} | ${m.stadium || ''}</div>
            ${m.status === 'live' ? '<span class="live-badge">LIVE</span>' : ''}
          </div>`;
      });
      html += '</div>';
    }
    matchesList.innerHTML = html || '<p>Нет матчей в этом туре</p>';

    // Клик по карточкам
    document.querySelectorAll('#matches-list .match-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.matchId);
        const match = data.matches.find(m => m.id === id);
        if (match) showMatchDetail(match, data.players);
      });
    });
  };

  // Обработчики вкладок
  const buttons = tourTabs.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tour = parseInt(btn.dataset.tour);
      showMatches(tour);
    });
  });

  // Активируем первый тур
  if (buttons.length) {
    buttons[0].classList.add('active');
    showMatches(activeTour);
  }
}

/* ========== Детали матча (модальное окно) ========== */
function showMatchDetail(match, allPlayers) {
  const modal = document.getElementById('match-modal');
  const content = document.getElementById('match-detail-content');

  const homeLineup = match.lineups?.home || [];
  const awayLineup = match.lineups?.away || [];

  // Группируем события
  const goals = match.events.filter(e => e.type === 'goal');
  const cards = match.events.filter(e => e.type === 'yellowCard' || e.type === 'redCard');

  let eventsHtml = '';
  if (goals.length) {
    eventsHtml += `<h4>⚽ Голы</h4><ul>`;
    goals.forEach(g => {
      eventsHtml += `<li>${g.minute}' — <strong>${g.player}</strong> (${g.team})${g.assist ? ', ассист: ' + g.assist : ''}</li>`;
    });
    eventsHtml += '</ul>';
  }
  if (cards.length) {
    eventsHtml += `<h4>🟨🟥 Карточки</h4><ul>`;
    cards.forEach(c => {
      const icon = c.type === 'yellowCard' ? '🟨' : '🟥';
      eventsHtml += `<li>${c.minute}' — ${icon} <strong>${c.player}</strong> (${c.team})</li>`;
    });
    eventsHtml += '</ul>';
  }

  content.innerHTML = `
    <h2>${match.homeTeam} ${match.homeScore ?? '-'} : ${match.awayScore ?? '-'} ${match.awayTeam}</h2>
    <p><strong>Дата:</strong> ${match.date} | ${match.time}</p>
    <p><strong>Стадион:</strong> ${match.stadium || '—'}</p>
    <p><strong>Статус:</strong> ${match.status === 'live' ? 'LIVE' : match.status === 'finished' ? 'Завершён' : 'Предстоит'}</p>
    <div style="display:flex; gap:2rem; margin-top:1rem">
      <div><h3>${match.homeTeam}</h3><ul>${homeLineup.map(p => `<li>${p}</li>`).join('')}</ul></div>
      <div><h3>${match.awayTeam}</h3><ul>${awayLineup.map(p => `<li>${p}</li>`).join('')}</ul></div>
    </div>
    <div style="margin-top:1rem">${eventsHtml || '<p>Нет событий</p>'}</div>
  `;

  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('match-modal').classList.remove('show');
}

/* ========== Остальные функции (статистика, команды, поиск) остаются практически без изменений ========== */
function renderPlayerStats(players) {
  const tbody = document.querySelector('#players-stats-table tbody');
  if (!tbody) return;
  players.sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
  tbody.innerHTML = players.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.team}</td>
      <td>${p.goals}</td>
      <td>${p.assists}</td>
      <td>${p.yellowCards}</td>
      <td>${p.redCards}</td>
    </tr>
  `).join('');
}

function renderTeams(teams, players) {
  const container = document.getElementById('teams-container');
  if (!container) return;
  container.innerHTML = teams.map(team => {
    const teamPlayers = players.filter(p => p.team === team.name);
    return `
      <div class="team-card">
        <h3>${team.name}</h3>
        <p><em>${team.coach || ''}</em></p>
        <div class="team-players">
          <strong>Состав:</strong>
          <ul>${teamPlayers.map(p => `<li>${p.name} (№${p.number || '-'})</li>`).join('')}</ul>
        </div>
      </div>`;
  }).join('');
}

function setupSearch(data) {
  const input = document.getElementById('player-search');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = data.players.filter(p => p.name.toLowerCase().includes(query));
    renderPlayerStats(filtered.length ? filtered : data.players);
  });
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('.section');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      sections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(target).classList.add('active');
    });
  });
  // Активируем первый пункт по умолчанию
  if (navLinks.length) navLinks[0].classList.add('active');
}
