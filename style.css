/* === Базовые стили === */
:root {
  --bg-color: #f5f5f5;
  --bg-image: url(''); /* можно добавить свою картинку */
  --text-color: #333;
  --header-bg: #1a1a2e;
  --header-text: #fff;
  --accent: #e94560;
  --card-bg: #fff;
  --table-border: #ddd;
  --shadow: 0 2px 5px rgba(0,0,0,0.1);
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  background-color: var(--bg-color);
  background-image: var(--bg-image);
  background-size: cover;
  background-attachment: fixed;
  color: var(--text-color);
  line-height: 1.6;
}

header {
  background: var(--header-bg);
  color: var(--header-text);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
}

nav a {
  color: var(--header-text);
  text-decoration: none;
  margin-left: 1.5rem;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s;
}

nav a:hover, nav a.active {
  border-bottom-color: var(--accent);
}

main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.section {
  display: none;
  animation: fadeIn 0.4s ease;
}

.section.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === Карточки и таблицы === */
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  box-shadow: var(--shadow);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--table-border);
}

th {
  background: var(--header-bg);
  color: var(--header-text);
}

tr:hover td {
  background: #f0f0f0;
}

.latest-results, .matches-day {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.match-card, .team-card {
  background: var(--card-bg);
  box-shadow: var(--shadow);
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.match-card:hover {
  transform: translateY(-2px);
}

.match-teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.team-name {
  font-weight: 600;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 1rem;
  color: var(--accent);
}

.match-details {
  font-size: 0.9rem;
  color: #666;
}

#player-search {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--table-border);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.team-players {
  margin-top: 1rem;
}

footer {
  text-align: center;
  padding: 1rem;
  background: var(--header-bg);
  color: var(--header-text);
  margin-top: 2rem;
}

/* === Контакты === */
.contact-info p {
  margin: 0.5rem 0;
}

/* === Адаптивность === */
@media (max-width: 600px) {
  header {
    flex-direction: column;
    text-align: center;
  }
  nav a {
    margin: 0 0.5rem;
  }
}
