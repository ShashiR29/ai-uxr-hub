/* =============================================
   AI UX Research Intelligence Hub — main.js
   ============================================= */

'use strict';

// ── Config ──────────────────────────────────────────────────────
const SAVE_KEY   = 'aiuxr-saved-articles';
const READ_KEY   = 'aiuxr-read-articles';
const OPEN_KEY   = 'aiuxr-opened-articles';
const THEME_META = {
  'Future of Work':          { slug: 'future-of-work',          icon: '💼', file: 'Themes/future-of-work.html' },
  'AI Technology':           { slug: 'ai-technology',           icon: '🤖', file: 'Themes/ai-technology.html' },
  'Trust & Safety in AI':    { slug: 'trust-safety',            icon: '🛡️', file: 'Themes/trust-safety.html' },
  'Human + AI Workflows':    { slug: 'human-ai-workflows',      icon: '🤝', file: 'Themes/human-ai-workflows.html' },
  'AI & Education':          { slug: 'ai-education',            icon: '🎓', file: 'Themes/ai-education.html' },
  'Evaluating AI Outputs':   { slug: 'evaluating-ai-outputs',   icon: '🔍', file: 'Themes/evaluating-ai-outputs.html' },
};

// ── Utilities ───────────────────────────────────────────────────
// Detect if the current page is inside a subfolder (Articles/, Themes/, PLaybook/)
// Works correctly for both file:// and http:// on Windows and Mac
function getSiteDepth() {
  return /\/(Articles|Themes|PLaybook)\//i.test(window.location.pathname) ? 1 : 0;
}

function getRootRelativePath(path) {
  const depth = getSiteDepth();
  const prefix = depth > 0 ? '../'.repeat(depth) : './';
  return prefix + path;
}

function themeClass(theme) {
  return 'theme-' + theme.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n).trimEnd() + '…' : str;
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Local Storage ───────────────────────────────────────────────
function getSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch { return []; }
}
function setSaved(arr) { localStorage.setItem(SAVE_KEY, JSON.stringify(arr)); }
function isSaved(id) { return getSaved().some(a => a.id === id); }

// ── Read / Open Tracking ───────────────────────────────────────
function getRead()   { try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; } }
function getOpened() { try { return JSON.parse(localStorage.getItem(OPEN_KEY) || '[]'); } catch { return []; } }
function isRead(id)   { return getRead().some(a => a.id === id); }
function isOpened(id) { return getOpened().some(a => a.id === id); }

function markOpened(article) {
  const opened = getOpened();
  if (!isOpened(article.id)) {
    opened.push({ id: article.id, theme: article.theme });
    localStorage.setItem(OPEN_KEY, JSON.stringify(opened));
    renderReadingStats();
  }
}

function toggleRead(article) {
  let read = getRead();
  if (isRead(article.id)) {
    read = read.filter(a => a.id !== article.id);
    localStorage.setItem(READ_KEY, JSON.stringify(read));
    showToast('Marked as unread');
    renderReadingStats();
    return false;
  } else {
    read.push({ id: article.id, theme: article.theme });
    localStorage.setItem(READ_KEY, JSON.stringify(read));
    showToast('Marked as read ✓');
    renderReadingStats();
    return true;
  }
}

function toggleSave(article) {
  let saved = getSaved();
  if (isSaved(article.id)) {
    saved = saved.filter(a => a.id !== article.id);
    setSaved(saved);
    showToast('Removed from saved articles');
    return false;
  } else {
    saved.push({ id: article.id, title: article.title, link: article.link, theme: article.theme, filename: article.filename || null });
    setSaved(saved);
    showToast('Article saved!');
    return true;
  }
}

// ── Article Card Factory ────────────────────────────────────────
function createArticleCard(article) {
  const saved = isSaved(article.id);
  const externalHref = article.link || '#';
  const prefix = getSiteDepth() > 0 ? '../' : './';
  const localLink = article.filename
    ? `<a href="${prefix}Articles/${article.filename}" class="btn btn-outline btn-sm">In-depth →</a>`
    : '';
  const monthHtml = article.month
    ? `<span class="article-month">${article.month}</span>`
    : '';
  const sourceHtml = article.source
    ? `<span class="source-badge">${article.source}</span>`
    : '';

  const read   = isRead(article.id);
  const opened  = isOpened(article.id);

  const card = document.createElement('div');
  card.className = 'card article-card';
  card.dataset.theme = article.theme;
  card.dataset.id = article.id;
  if (read) card.classList.add('is-read');

  card.innerHTML = `
    <div class="card-body">
      <div class="card-meta">
        <span class="theme-badge ${themeClass(article.theme)}">${article.theme}</span>
        ${monthHtml}
        ${sourceHtml}
        ${read ? '<span class="read-badge">✓ Read</span>' : (opened ? '<span class="opened-badge">👁 Opened</span>' : '')}
      </div>
      <h3 style="margin-top:10px">${article.title}</h3>
      <p>${truncate(article.summary, 180)}</p>
    </div>
    <div class="card-footer">
      <a href="${externalHref}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" data-track-open>
        Read Article ↗
      </a>
      ${localLink}
      <button class="btn-read ${read ? 'read' : ''}" data-id="${article.id}" aria-label="Mark as read">
        ${read ? '✓ Read' : '○ Mark read'}
      </button>
      <button class="btn-save ${saved ? 'saved' : ''}" data-id="${article.id}" aria-label="Save article">
        ${saved ? '★ Saved' : '☆ Save'}
      </button>
    </div>`;

  card.querySelector('[data-track-open]').addEventListener('click', () => {
    markOpened(article);
    const badge = card.querySelector('.opened-badge, .read-badge');
    if (!badge && !isRead(article.id)) {
      const meta = card.querySelector('.card-meta');
      const span = document.createElement('span');
      span.className = 'opened-badge';
      span.textContent = '👁 Opened';
      meta.appendChild(span);
    }
  });

  card.querySelector('.btn-read').addEventListener('click', function () {
    const nowRead = toggleRead(article);
    this.textContent = nowRead ? '✓ Read' : '○ Mark read';
    this.classList.toggle('read', nowRead);
    card.classList.toggle('is-read', nowRead);
    const meta = card.querySelector('.card-meta');
    const existingBadge = meta.querySelector('.read-badge, .opened-badge');
    if (existingBadge) existingBadge.remove();
    if (nowRead) {
      const span = document.createElement('span');
      span.className = 'read-badge';
      span.textContent = '✓ Read';
      meta.appendChild(span);
    } else if (isOpened(article.id)) {
      const span = document.createElement('span');
      span.className = 'opened-badge';
      span.textContent = '👁 Opened';
      meta.appendChild(span);
    }
  });

  card.querySelector('.btn-save').addEventListener('click', function () {
    const nowSaved = toggleSave(article);
    this.textContent = nowSaved ? '★ Saved' : '☆ Save';
    this.classList.toggle('saved', nowSaved);
    renderSavedSection();
  });

  return card;
}

// ── Saved Section ───────────────────────────────────────────────
function renderSavedSection() {
  const wrap = document.getElementById('saved-section');
  if (!wrap) return;
  const saved = getSaved();
  if (!saved.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  const list = wrap.querySelector('.saved-list');
  if (!list) return;
  list.innerHTML = '';
  saved.forEach(a => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    item.innerHTML = `
      <a href="${a.link || '#'}" target="_blank" rel="noopener noreferrer">${a.title}</a>
      <span class="theme-badge ${themeClass(a.theme)}" style="margin:0 8px">${a.theme}</span>
      <button class="btn-unsave" data-id="${a.id}" title="Remove">✕</button>`;
    item.querySelector('.btn-unsave').addEventListener('click', function () {
      let s = getSaved().filter(x => x.id !== a.id);
      setSaved(s);
      renderSavedSection();
      refreshSaveButtons();
      showToast('Removed from saved');
    });
    list.appendChild(item);
  });
}

function refreshSaveButtons() {
  document.querySelectorAll('.btn-save[data-id]').forEach(btn => {
    const id = Number(btn.dataset.id);
    const saved = isSaved(id);
    btn.textContent = saved ? '★ Saved' : '☆ Save';
    btn.classList.toggle('saved', saved);
  });
}

// ── Articles Grid (Homepage / Theme pages) ──────────────────────
let allArticles = [];
let activeThemeFilter = 'all';
let searchQuery = '';

// Uses window.ARTICLES_DATA from articles-data.js (works with file:// and http://)
function loadArticles() {
  if (window.ARTICLES_DATA && window.ARTICLES_DATA.length) {
    allArticles = window.ARTICLES_DATA;
  } else {
    console.error('ARTICLES_DATA not found. Ensure articles-data.js is loaded before main.js.');
    allArticles = [];
  }
}

function getFilteredArticles() {
  return allArticles.filter(a => {
    let matchTheme;
    if (activeThemeFilter === 'all') {
      matchTheme = true;
    } else if (activeThemeFilter === '__compete') {
      matchTheme = a.source === 'AI Compete News';
    } else {
      matchTheme = a.theme === activeThemeFilter;
    }
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q);
    return matchTheme && matchSearch;
  });
}

function renderArticlesGrid(containerId, articles) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';
  if (!articles.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No articles found. Try a different filter or search term.</p></div>`;
    return;
  }
  articles.forEach(a => grid.appendChild(createArticleCard(a)));
}

function renderHomepageArticles() {
  renderArticlesGrid('articles-grid', getFilteredArticles());
}

// ── Theme Filter Buttons ────────────────────────────────────────
function initFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeThemeFilter = btn.dataset.theme || 'all';
      renderHomepageArticles();
    });
  });
}

// ── Search ──────────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value;
    renderHomepageArticles();
  });
}

// ── Featured Themes (homepage cards) ────────────────────────────
function renderFeaturedThemes() {
  const grid = document.getElementById('themes-grid');
  if (!grid) return;
  const themeCounts = {};
  allArticles.forEach(a => { themeCounts[a.theme] = (themeCounts[a.theme] || 0) + 1; });
  grid.innerHTML = '';
  const prefix = getSiteDepth() > 0 ? '../' : './';
  Object.entries(THEME_META).forEach(([name, meta]) => {
    const count = themeCounts[name] || 0;
    const a = document.createElement('a');
    a.href = prefix + meta.file;
    a.className = 'theme-card';
    a.innerHTML = `
      <div class="theme-card-icon">${meta.icon}</div>
      <h3>${name}</h3>
      <p>${count} article${count !== 1 ? 's' : ''}</p>`;
    grid.appendChild(a);
  });
}

// ── AI Compete News Section ───────────────────────────
function renderCompeteNewsSection() {
  const grid = document.getElementById('compete-news-grid');
  if (!grid) return;
  const articles = allArticles.filter(a => a.source === 'AI Compete News');
  const preview  = articles.slice(0, 6);
  grid.innerHTML = '';
  preview.forEach(a => grid.appendChild(createArticleCard(a)));

  const toggleBtn = document.getElementById('compete-news-toggle');
  if (!toggleBtn) return;
  if (articles.length <= 6) { toggleBtn.style.display = 'none'; return; }

  toggleBtn.textContent = `Show all ${articles.length} →`;
  let expanded = false;
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    grid.innerHTML = '';
    (expanded ? articles : preview).forEach(a => grid.appendChild(createArticleCard(a)));
    toggleBtn.textContent = expanded ? 'Show less ↑' : `Show all ${articles.length} →`;
    if (!expanded) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ── Reading Stats Panel ─────────────────────────────────────────
function renderReadingStats() {
  const panel = document.getElementById('reading-stats');
  if (!panel) return;

  const read   = getRead();
  const opened = getOpened();
  const total  = allArticles.length;

  const readCount   = read.length;
  const openedCount = opened.length;

  // theme breakdown for read articles
  const byTheme = {};
  read.forEach(a => { byTheme[a.theme] = (byTheme[a.theme] || 0) + 1; });
  const topThemes = Object.entries(byTheme).sort((a,b) => b[1]-a[1]).slice(0, 4);

  const pct = n => total ? Math.round((n / total) * 100) : 0;

  panel.innerHTML = `
    <h3 class="stats-heading">📊 Your Reading Stats</h3>
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-num">${openedCount}</span>
        <span class="stat-label">Opened</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">${readCount}</span>
        <span class="stat-label">Marked Read</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">${total - readCount}</span>
        <span class="stat-label">Unread</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">${total}</span>
        <span class="stat-label">Total</span>
      </div>
    </div>
    <div class="stats-bar-wrap" title="${pct(readCount)}% read">
      <div class="stats-bar-opened" style="width:${pct(openedCount)}%"></div>
      <div class="stats-bar-read" style="width:${pct(readCount)}%"></div>
    </div>
    <p class="stats-pct">${pct(readCount)}% marked read &nbsp;&middot;&nbsp; ${pct(openedCount)}% opened</p>
    ${topThemes.length ? `
    <div class="stats-themes">
      <p class="stats-themes-label">Most read themes</p>
      ${topThemes.map(([theme, count]) =>
        `<div class="stats-theme-row">
          <span>${THEME_META[theme]?.icon || ''} ${theme}</span>
          <span class="stats-theme-count">${count}</span>
        </div>`
      ).join('')}
    </div>` : '<p class="stats-empty">Click ○ Mark read on any article to track your progress</p>'}
  `;
}

// ── Theme Page: render articles by theme ────────────────────────
function renderThemePage(themeName) {
  // Decode HTML entities that may appear in data-theme attribute
  const decoded = themeName.replace(/&amp;/g, '&');
  const articles = allArticles.filter(a => a.theme === decoded);
  renderArticlesGrid('theme-articles-grid', articles);
}

// ── Chatbot Widget ───────────────────────────────────────────────
const CHAT_RULES = [
  {
    keywords: ['trust','safe','safety','risk','danger','harmful','bias'],
    reply: 'The **Trust & Safety in AI** theme has the most coverage. Key articles:\n• <a href="https://techcrunch.com/2026/03/18/meta-is-having-trouble-with-rogue-ai-agents/" target="_blank">Meta's rogue AI agents ↗</a>\n• <a href="https://www.404media.co/ceo-ignores-lawyers-asks-chatgpt-how-to-void-250-million-contract-loses-terribly-in-court/" target="_blank">CEO uses ChatGPT to void contract ↗</a>\n• <a href="https://futurism.com/artificial-intelligence/ai-grandmother-jail-mistake" target="_blank">AI jails innocent grandmother ↗</a>'
  },
  {
    keywords: ['evaluat','assess','measur','quality','output','hallucin'],
    reply: 'For evaluating AI outputs try:\n• <a href="https://shashir29.github.io/ai-uxr-hub/Articles/giving-ai-job-interview.html" target="_blank">Giving Your AI a Job Interview ↗</a>\n• <a href="https://arstechnica.com/google/2026/04/analysis-finds-google-ai-overviews-is-wrong-10-percent-of-the-time/" target="_blank">Google AI Overviews wrong 10% of the time ↗</a>\n• <a href="https://shashir29.github.io/ai-uxr-hub/Articles/llms-sycophancy.html" target="_blank">LLM Sycophancy ↗</a>'
  },
  {
    keywords: ['work','job','employ','productiv','workflow','team','collab'],
    reply: 'On AI and the future of work:\n• <a href="https://shashir29.github.io/ai-uxr-hub/Articles/cybernetic-teammate.html" target="_blank">The Cybernetic Teammate ↗</a>\n• <a href="https://futurism.com/artificial-intelligence/ai-brain-fry" target="_blank">AI Brain Fry: burnout from AI tools ↗</a>\n• <a href="https://fortune.com/2026/03/24/perplexity-ceo-ai-layoffs-not-bad-people-hate-jobs-entrepreneurship/" target="_blank">Perplexity CEO on AI layoffs ↗</a>'
  },
  {
    keywords: ['education','learn','student','school','teach','university'],
    reply: 'On AI in education:\n• <a href="https://www.techdirt.com/2026/03/06/were-training-students-to-write-worse-to-prove-theyre-not-robots-and-its-pushing-them-to-use-more-ai/" target="_blank">Training students to write worse ↗</a>\n• The **AI & Education** theme has more — use the filter buttons above.'
  },
  {
    keywords: ['agent','autonom','agentic'],
    reply: 'On AI agents going rogue or behaving unexpectedly:\n• <a href="https://futurism.com/artificial-intelligence/ai-agent-crypto-mining" target="_blank">AI agent starts mining crypto ↗</a>\n• <a href="https://techcrunch.com/2026/03/18/meta-is-having-trouble-with-rogue-ai-agents/" target="_blank">Meta's rogue AI agent Sev-1 incidents ↗</a>\n• <a href="https://www.cio.com/article/4152601/without-controls-an-ai-agent-can-cost-more-than-an-employee.html" target="_blank">AI agents can cost more than employees ↗</a>'
  },
  {
    keywords: ['privacy','surveil','data','track','spy'],
    reply: 'On AI and privacy:\n• <a href="https://www.reuters.com/sustainability/boards-policy-regulation/meta-start-capturing-employee-mouse-movements-keystrokes-ai-training-data-2026-04-21/" target="_blank">Meta tracking employee keystrokes ↗</a>\n• <a href="https://techcrunch.com/2026/03/05/meta-sued-over-ai-smartglasses-privacy-concerns-after-workers-reviewed-nudity-sex-and-other-footage/" target="_blank">Meta smart glasses lawsuit ↗</a>'
  },
  {
    keywords: ['law','legal','court','sue','lawsuit','copyright'],
    reply: 'On AI and legal issues:\n• <a href="https://techcrunch.com/2026/01/29/music-publishers-sue-anthropic-for-3b-over-flagrant-piracy-of-20000-works/" target="_blank">Music publishers sue Anthropic $3B ↗</a>\n• <a href="https://www.reuters.com/legal/litigation/sullivan-cromwell-law-firm-apologizes-ai-hallucinations-court-filing-2026-04-21/" target="_blank">Law firm apologizes for AI hallucinations ↗</a>\n• <a href="https://techcrunch.com/2026/02/15/longtime-npr-host-david-greene-sues-google-over-notebooklm-voice/" target="_blank">NPR host sues Google over NotebookLM voice ↗</a>'
  },
  {
    keywords: ['playbook','prompt','framework','method','how to','research'],
    reply: 'Check the <a href="./PLaybook/index.html">UX Research Playbook ↗</a> for structured frameworks and Copilot prompts designed for UX researchers.'
  },
  {
    keywords: ['save','saved','bookmark','read','progress','stat'],
    reply: 'You can **Save** any article using the ☆ button on the card, and **Mark as Read** using the ○ button. Your reading stats are shown in the panel on the right side of the page.'
  },
];

const FALLBACK_REPLIES = [
  'Try using the **search bar** or **theme filter buttons** to find articles on that topic.',
  'I\'m best at finding articles by topic. Try keywords like "trust", "agents", "education", or "privacy".',
  'The **All Articles** section below is searchable — type a keyword to filter instantly.',
];
let fallbackIdx = 0;

function getBotReply(text) {
  const q = text.toLowerCase();
  for (const rule of CHAT_RULES) {
    if (rule.keywords.some(k => q.includes(k))) return rule.reply;
  }
  // search allArticles for a title match
  const match = allArticles.find(a => a.title.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w)));
  if (match) {
    return `I found a relevant article: <strong>${match.title}</strong><br><a href="${match.link}" target="_blank" rel="noopener noreferrer">Read it here ↗</a>`;
  }
  return FALLBACK_REPLIES[fallbackIdx++ % FALLBACK_REPLIES.length];
}

function initChatbot() {
  const widget = document.getElementById('chat-widget');
  if (!widget) return;
  const toggle = widget.querySelector('.chat-toggle');
  const panel  = widget.querySelector('.chat-panel');
  const input  = widget.querySelector('.chat-input');
  const send   = widget.querySelector('.chat-send');
  const body   = widget.querySelector('.chat-body');

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    appendMsg(text, 'user');
    input.value = '';
    setTimeout(() => appendMsg(getBotReply(text), 'bot'), 500);
  }

  function appendMsg(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}

// ── Mobile nav ──────────────────────────────────────────────────
function initMobileNav() {
  const btn   = document.querySelector('.nav-menu-btn');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => links.classList.toggle('open'));
}

// ── Active nav link ─────────────────────────────────────────────
function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.endsWith(href.replace(/^\.\.\/|^\.\//,''))) a.classList.add('active');
  });
}

// ── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  markActiveNav();
  initChatbot();

  const isHomepage  = !!document.getElementById('articles-grid');
  const isThemePage = !!document.getElementById('theme-articles-grid');

  if (isHomepage || isThemePage) {
    loadArticles();
  }

  if (isHomepage) {
    renderFeaturedThemes();
    renderCompeteNewsSection();
    initFilterButtons();
    initSearch();
    renderHomepageArticles();
    renderSavedSection();
    renderReadingStats();
  }

  if (isThemePage) {
    const themeName = document.body.dataset.theme;
    if (themeName) renderThemePage(themeName);
  }
});
