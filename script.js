document.addEventListener('DOMContentLoaded', () => {
  // Загружаем данные из data.json
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      // Сохраняем в глобальную переменную для фильтрации
      window.appData = data;
      renderAll(data);
      setupNavigation();
      setupSearch(data);
    })
    .catch(err => console.error('Ошибка загрузки data.json:', err));
});

function renderAll(data) {
  renderLatestResults(data.matches);
  renderStandings(data.standings);
  renderMatches(data.matches);
  renderPlayerStats(data.players);
  renderTeams(data.teams, data.players);
}

// Навигация между разделами
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
  if (navLinks.length > 0) navLinks[0].classList.add('active');
}

// Главная: последние результаты
function renderLatestResults(matches) {
  const container = document.querySelector('.latest-results');
  if (!container) return;
  const last = matches.slice(-4).reverse(); // 4 последних
  let html = '<h3>Последние матчи</h3>';
  last.forEach(m => {
    html += `
      <div class="match-card">
        <div class="match-teams">
          <span class="team-name">${m.homeTeam}</span>
          <span class="score">${m.homeScore} : ${m.awayScore}</span>
          <span class="team-name">${m.awayTeam}</span>
        </div>
        <div class="match-details">${m.date} | ${m.time}</div>
      </div>`;
  });
  container.innerHTML = html;
}

// Турнирная таблица
function renderStandings(standings) {
  const tbody = document.querySelector('#standings-table tbody');
  if (!tbody) return;
  // Сортируем по очкам, затем по разнице мячей (можно упростить)
  standings.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  tbody.innerHTML = standings.map((t, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${t.team}</td>
      <td>${t.played}</td>
      <td>${t.wins}</td>
      <td>${t.draws}</td>
      <td>${t.losses}</td>
      <td>${t.goalsFor}:${t.goalsAgainst}</td>
      <td><strong>${t.points}</strong></td>
    </tr>
  `).join('');
}

// Расписание (все матчи по дням)
function renderMatches(matches) {
  const container = document.getElementById('matches-list');
  if (!container) return;
  // Группируем по дате
  const grouped = {};
  matches.forEach(m => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });

  let html = '';
  for (const [date, games] of Object.entries(grouped)) {
    html += `<h3>${date}</h3><div class="matches-day">`;
    games.forEach(m => {
      html += `
        <div class="match-card">
          <div class="match-teams">
            <span class="team-name">${m.homeTeam}</span>
            <span class="score">${m.homeScore} : ${m.awayScore}</span>
            <span class="team-name">${m.awayTeam}</span>
          </div>
          <div class="match-details">${m.time} | Стадион: ${m.stadium || 'Не указан'}</div>
        </div>`;
    });
    html += '</div>';
  }
  container.innerHTML = html;
}

// Статистика игроков
function renderPlayerStats(players) {
  const tbody = document.querySelector('#players-stats-table tbody');
  if (!tbody) return;
  // Сортируем по голам
  players.sort((a, b) => b.goals - a.goals || b.name.localeCompare(a.name));
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

// Команды и составы
function renderTeams(teams, players) {
  const container = document.getElementById('teams-container');
  if (!container) return;
  let html = '';
  teams.forEach(team => {
    const teamPlayers = players.filter(p => p.team === team.name);
    html += `
      <div class="team-card">
        <h3>${team.name}</h3>
        <p><em>${team.coach || ''}</em></p>
        <div class="team-players">
          <strong>Состав:</strong>
          <ul>
            ${teamPlayers.map(p => `<li>${p.name} (№${p.number || '-'})</li>`).join('')}
          </ul>
        </div>
      </div>`;
  });
  container.innerHTML = html;
}

// Поиск по игрокам
function setupSearch(data) {
  const input = document.getElementById('player-search');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = data.players.filter(p => p.name.toLowerCase().includes(query));
    renderPlayerStats(filtered);
    // Если пусто, показываем всех
    if (!query) renderPlayerStats(data.players);
  });
}
