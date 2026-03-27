// =============================================================================
// public/js/main.js — CLIENT APPLICATION
// =============================================================================
//
// A plain-JS single-page app that consumes the Football League Tracker API.
// No frameworks — just fetch(), DOM manipulation, and event handling.
//
// =============================================================================

const BASE = '/api';

// -----------------------------------------------------------------------------
// TABS
// -----------------------------------------------------------------------------

document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');

        if (btn.dataset.tab === 'standings') loadStandings();
        if (btn.dataset.tab === 'matches')   { loadTeamSelects(); loadMatches(); }
        if (btn.dataset.tab === 'teams')     { populateCountryFilter(); loadTeams(); }
    });
});

// -----------------------------------------------------------------------------
// ALERTS
// -----------------------------------------------------------------------------

function showAlert(msg, isError = false) {
    const box = document.getElementById('alert-box');
    const el = document.createElement('div');
    el.className = `alert ${isError ? 'alert-err' : 'alert-ok'}`;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// -----------------------------------------------------------------------------
// API HELPERS
// -----------------------------------------------------------------------------

async function api(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// -----------------------------------------------------------------------------
// STANDINGS  (uses dedicated /standings endpoint — no pagination)
// -----------------------------------------------------------------------------

async function loadStandings() {
    const el = document.getElementById('standings-content');
    el.innerHTML = '<p class="loading">Loading…</p>';
    try {
        const teams = await api('GET', '/teams/standings');
        if (!teams.length) { el.innerHTML = '<p class="loading">No teams yet.</p>'; return; }

        el.innerHTML = `
          <table class="league-table">
            <thead>
              <tr>
                <th>#</th><th>Club</th><th>Country</th>
                <th>W</th><th>D</th><th>L</th>
                <th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
              </tr>
            </thead>
            <tbody>
              ${teams.map((t, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${t.name}</td>
                  <td>${t.country}</td>
                  <td>${t.wins}</td>
                  <td>${t.draws}</td>
                  <td>${t.losses}</td>
                  <td>${t.goalsFor}</td>
                  <td>${t.goalsAgainst}</td>
                  <td>${t.goalDifference >= 0 ? '+' : ''}${t.goalDifference}</td>
                  <td class="pts">${t.points}</td>
                </tr>`).join('')}
            </tbody>
          </table>`;
    } catch (e) {
        el.innerHTML = `<p style="color:red">${e.message}</p>`;
    }
}

// -----------------------------------------------------------------------------
// TEAMS tab — search, filter, sort, paginate
// -----------------------------------------------------------------------------

let teamsPage = 1;
let teamsSearchTimer = null;

function onTeamSearch() {
    clearTimeout(teamsSearchTimer);
    teamsSearchTimer = setTimeout(() => { teamsPage = 1; loadTeams(); }, 300);
}

async function loadTeams() {
    const el    = document.getElementById('teams-content');
    const pgEl  = document.getElementById('teams-pagination');
    el.innerHTML = '<p class="loading">Loading…</p>';
    pgEl.innerHTML = '';

    const q       = document.getElementById('teams-q').value.trim();
    const country = document.getElementById('teams-country').value;
    const sortBy  = document.getElementById('teams-sort').value;
    const order   = document.getElementById('teams-order').value;
    const limit   = document.getElementById('teams-limit').value;

    const params = new URLSearchParams({ sortBy, order, page: teamsPage, limit });
    if (q)       params.set('q', q);
    if (country) params.set('country', country);

    try {
        const { data: teams, pagination } = await api('GET', `/teams?${params}`);

        if (!teams.length) {
            el.innerHTML = '<p class="loading">No teams match your search.</p>';
            return;
        }

        el.innerHTML = `
          <table class="league-table">
            <thead>
              <tr><th>Name</th><th>Country</th><th>Stadium</th><th>Founded</th><th>Pts</th><th>GD</th></tr>
            </thead>
            <tbody>
              ${teams.map((t) => `
                <tr>
                  <td>${t.name}</td>
                  <td>${t.country}</td>
                  <td>${t.stadium}</td>
                  <td>${t.founded || '—'}</td>
                  <td class="pts">${t.points}</td>
                  <td>${t.goalDifference >= 0 ? '+' : ''}${t.goalDifference}</td>
                </tr>`).join('')}
            </tbody>
          </table>`;

        renderPagination(pgEl, pagination);
    } catch (e) {
        el.innerHTML = `<p style="color:red">${e.message}</p>`;
    }
}

function renderPagination(container, { page, totalPages, total, limit }) {
    if (totalPages <= 1) return;

    const from  = (page - 1) * limit + 1;
    const to    = Math.min(page * limit, total);
    const info  = `<span class="pg-info">${from}–${to} of ${total}</span>`;

    const prev  = `<button class="pg-btn" ${page <= 1 ? 'disabled' : ''} onclick="gotoPage(${page - 1})">&#8249;</button>`;
    const next  = `<button class="pg-btn" ${page >= totalPages ? 'disabled' : ''} onclick="gotoPage(${page + 1})">&#8250;</button>`;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .map((p) => `<button class="pg-btn ${p === page ? 'active' : ''}" onclick="gotoPage(${p})">${p}</button>`)
        .join('');

    container.innerHTML = `<div class="pagination-inner">${info}${prev}${pages}${next}</div>`;
}

function gotoPage(p) {
    teamsPage = p;
    loadTeams();
}

async function populateCountryFilter() {
    try {
        const { data: teams } = await api('GET', '/teams?limit=50');
        const countries = [...new Set(teams.map((t) => t.country))].sort();
        const sel = document.getElementById('teams-country');
        sel.innerHTML = `<option value="">All countries</option>` +
            countries.map((c) => `<option value="${c}">${c}</option>`).join('');
    } catch (_) {}
}

async function createTeam() {
    const name     = document.getElementById('team-name').value.trim();
    const country  = document.getElementById('team-country').value.trim();
    const stadium  = document.getElementById('team-stadium').value.trim();
    const founded  = document.getElementById('team-founded').value;

    if (!name || !country) { showAlert('Name and country are required.', true); return; }

    try {
        await api('POST', '/teams', { name, country, stadium: stadium || undefined, founded: founded ? Number(founded) : undefined });
        showAlert(`${name} added!`);
        ['team-name','team-country','team-stadium','team-founded'].forEach((id) => { document.getElementById(id).value = ''; });
        teamsPage = 1;
        loadTeams();
        populateCountryFilter();
        loadTeamSelects();
        loadStandings();
    } catch (e) {
        showAlert(e.message, true);
    }
}

// -----------------------------------------------------------------------------
// TEAM SELECTS (for match scheduling)
// -----------------------------------------------------------------------------

async function loadTeamSelects() {
    try {
        const teams = await api('GET', '/teams/standings');
        const options = teams.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
        document.getElementById('home-team-select').innerHTML = `<option value="">Home team…</option>${options}`;
        document.getElementById('away-team-select').innerHTML = `<option value="">Away team…</option>${options}`;
    } catch (_) {}
}

// -----------------------------------------------------------------------------
// MATCHES
// -----------------------------------------------------------------------------

async function loadMatches() {
    const el = document.getElementById('match-list');
    el.innerHTML = '<p class="loading">Loading…</p>';
    const status = document.getElementById('match-filter').value;
    const qs = status ? `?status=${status}` : '';

    try {
        const matches = await api('GET', `/matches${qs}`);
        if (!matches.length) { el.innerHTML = '<p class="loading">No matches found.</p>'; return; }

        // Most recent first
        matches.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
        el.innerHTML = `<div class="match-list">${matches.map(renderMatchCard).join('')}</div>`;
    } catch (e) {
        el.innerHTML = `<p style="color:red">${e.message}</p>`;
    }
}

function renderMatchCard(m) {
    const statusBadge = `<span class="match-status status-${m.status}">${m.status}</span>`;
    const dateStr = new Date(m.scheduledAt).toLocaleString();

    const homeGoals = m.goals
        .filter((g) => (g.isOwnGoal ? g.teamId === m.awayTeamId : g.teamId === m.homeTeamId))
        .map((g) => `<span>${g.minute}' ${g.scorer}${g.isOwnGoal ? ' (OG)' : ''}</span>`)
        .join('');
    const awayGoals = m.goals
        .filter((g) => (g.isOwnGoal ? g.teamId === m.homeTeamId : g.teamId === m.awayTeamId))
        .map((g) => `<span>${g.scorer}${g.isOwnGoal ? ' (OG)' : ''} ${g.minute}'</span>`)
        .join('');
    const goals = m.goals.length
        ? `<div class="goal-log">
             <div class="goal-side home">${homeGoals}</div>
             <div class="goal-side away">${awayGoals}</div>
           </div>`
        : '';

    let actions = '';
    if (m.status === 'scheduled') {
        actions = `
          <button class="btn btn-green" onclick="doStart('${m.id}')">▶ Start</button>
          <button class="btn btn-yellow" onclick="doPostpone('${m.id}')">⏸ Postpone</button>`;
    }
    if (m.status === 'live') {
        actions = `
          <button class="btn btn-green" onclick="toggleGoalForm('${m.id}')">⚽ Goal</button>
          <button class="btn btn-red" onclick="doFinish('${m.id}')">⏹ Full Time</button>`;
    }
    if (m.status === 'postponed') {
        actions = `<button class="btn btn-green" onclick="doStart('${m.id}')">▶ Start anyway</button>`;
    }

    const goalForm = m.status === 'live' ? `
      <div class="goal-form" id="goal-form-${m.id}">
        <div class="form-row">
          <select id="goal-team-${m.id}">
            <option value="${m.homeTeamId}">${m.homeTeamName}</option>
            <option value="${m.awayTeamId}">${m.awayTeamName}</option>
          </select>
          <input type="text" id="goal-scorer-${m.id}" placeholder="Scorer name" />
          <input type="number" id="goal-minute-${m.id}" placeholder="Minute" min="1" max="120" />
          <label style="display:flex;align-items:center;gap:.3rem;font-size:.85rem;">
            <input type="checkbox" id="goal-og-${m.id}" /> Own goal
          </label>
          <button class="btn btn-green" onclick="doGoal('${m.id}')">Confirm</button>
          <button class="btn btn-gray" onclick="toggleGoalForm('${m.id}')">Cancel</button>
        </div>
      </div>` : '';

    return `
      <div class="match-card ${m.status}" id="match-${m.id}">
        <div class="match-team home">${m.homeTeamName}</div>
        <div class="match-score-block">
          <div class="match-score">${m.homeScore} – ${m.awayScore}</div>
          ${statusBadge}
          <div style="font-size:.75rem;color:#888;margin-top:.2rem">${dateStr}</div>
        </div>
        <div class="match-team away">${m.awayTeamName}</div>
        ${goals}
        ${goalForm}
        ${actions ? `<div class="match-actions">${actions}</div>` : ''}
      </div>`;
}

// -----------------------------------------------------------------------------
// MATCH ACTIONS
// -----------------------------------------------------------------------------

async function scheduleMatch() {
    const homeTeamId = document.getElementById('home-team-select').value;
    const awayTeamId = document.getElementById('away-team-select').value;
    const scheduledAt = document.getElementById('match-date').value;

    if (!homeTeamId || !awayTeamId) { showAlert('Select both teams.', true); return; }
    if (homeTeamId === awayTeamId) { showAlert('A team cannot play itself.', true); return; }

    try {
        const m = await api('POST', '/matches/schedule', {
            homeTeamId, awayTeamId,
            scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        });
        showAlert(`Match scheduled: ${m.homeTeamName} vs ${m.awayTeamName}`);
        loadMatches();
    } catch (e) {
        showAlert(e.message, true);
    }
}

async function scheduleRandom() {
    try {
        const m = await api('POST', '/matches/random');
        showAlert(`Random match: ${m.homeTeamName} vs ${m.awayTeamName}`);
        loadMatches();
    } catch (e) {
        showAlert(e.message, true);
    }
}

async function doStart(id) {
    try {
        await api('PUT', `/matches/${id}/start`);
        showAlert('Match started!');
        loadMatches();
    } catch (e) {
        showAlert(e.message, true);
    }
}

async function doFinish(id) {
    try {
        const m = await api('PUT', `/matches/${id}/finish`);
        showAlert(`Full time! ${m.homeTeamName} ${m.homeScore}–${m.awayScore} ${m.awayTeamName}`);
        loadMatches();
        loadStandings();
    } catch (e) {
        showAlert(e.message, true);
    }
}

async function doPostpone(id) {
    try {
        await api('PUT', `/matches/${id}/postpone`);
        showAlert('Match postponed.');
        loadMatches();
    } catch (e) {
        showAlert(e.message, true);
    }
}

function toggleGoalForm(id) {
    const form = document.getElementById(`goal-form-${id}`);
    if (form) form.classList.toggle('open');
}

async function doGoal(matchId) {
    const teamId  = document.getElementById(`goal-team-${matchId}`).value;
    const scorer  = document.getElementById(`goal-scorer-${matchId}`).value.trim();
    const minute  = document.getElementById(`goal-minute-${matchId}`).value;
    const isOwnGoal = document.getElementById(`goal-og-${matchId}`).checked;

    try {
        const m = await api('POST', `/matches/${matchId}/goal`, {
            teamId,
            scorer: scorer || undefined,
            minute: minute ? Number(minute) : undefined,
            isOwnGoal,
        });
        showAlert(`⚽ Goal! ${m.homeTeamName} ${m.homeScore}–${m.awayScore} ${m.awayTeamName}`);
        loadMatches();
    } catch (e) {
        showAlert(e.message, true);
    }
}

// -----------------------------------------------------------------------------
// INIT
// -----------------------------------------------------------------------------
loadStandings();
loadTeamSelects();
