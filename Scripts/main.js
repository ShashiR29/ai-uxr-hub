/* =============================================
   AI UX Research Intelligence Hub — main.js
   ============================================= */

'use strict';

// ── Dark mode (apply saved preference ASAP to reduce flash) ──────
(function applySavedColorMode() {
  try {
    if (localStorage.getItem('colorMode') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) { /* localStorage unavailable */ }
})();

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
  const newHtml = article.isNew
    ? '<span class="new-badge">✨ New</span>'
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
        ${newHtml}
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
const ARTICLES_PER_PAGE = 18;
let homepageShown = ARTICLES_PER_PAGE;

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
  const filtered = getFilteredArticles();
  renderArticlesGrid('articles-grid', filtered.slice(0, homepageShown));
  updateShowMoreButton(filtered.length);
}

function updateShowMoreButton(total) {
  const btn = document.getElementById('articles-show-more');
  if (!btn) return;
  const remaining = total - homepageShown;
  if (remaining > 0) {
    btn.style.display = '';
    btn.textContent = `Show more articles (${remaining} more) ↓`;
  } else {
    btn.style.display = 'none';
  }
}

function initShowMore() {
  const btn = document.getElementById('articles-show-more');
  if (!btn) return;
  btn.addEventListener('click', () => {
    homepageShown += ARTICLES_PER_PAGE;
    renderHomepageArticles();
  });
}

// ── Theme Filter Buttons ────────────────────────────────────────
function initFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeThemeFilter = btn.dataset.theme || 'all';
      homepageShown = ARTICLES_PER_PAGE;
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
    homepageShown = ARTICLES_PER_PAGE;
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

// ── Newly Added Section ───────────────────────
function renderNewlyAddedSection() {
  const grid = document.getElementById('newly-added-grid');
  if (!grid) return;
  const articles = allArticles.filter(a => a.isNew);
  grid.innerHTML = '';
  if (!articles.length) {
    grid.closest('section').style.display = 'none';
    return;
  }
  articles.forEach(a => grid.appendChild(createArticleCard(a)));
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
// Theme synonyms used to recognise what the user is asking about
const CHAT_THEMES = {
  'Future of Work':        { emoji: '💼', words: ['work','job','jobs','employ','employment','employee','career','careers','workforce','productivity','layoff','layoffs','automation','enterprise','adoption','company','companies','organisation','organization'] },
  'AI Technology':         { emoji: '🤖', words: ['technology','tech','model','models','llm','llms','gpt','agent','agents','agentic','tooling','infrastructure','capability','capabilities','reasoning','multimodal'] },
  'Trust & Safety in AI':  { emoji: '🛡️', words: ['trust','safety','safe','risk','risks','harm','harmful','bias','biased','danger','dangerous','security','misuse','deception','reliable','reliability','privacy','surveillance'] },
  'Human + AI Workflows':  { emoji: '🤝', words: ['workflow','workflows','collaborate','collaboration','teammate','copilot','pairing','augment','augmentation','assistant','assisted','human'] },
  'AI & Education':        { emoji: '🎓', words: ['education','learn','learning','student','students','school','schools','teach','teaching','teacher','university','academic','classroom','exam','homework'] },
  'Evaluating AI Outputs': { emoji: '🔍', words: ['evaluate','evaluating','evaluation','assess','assessment','measure','quality','output','outputs','accuracy','accurate','hallucinate','hallucination','benchmark','testing','validate','validation'] },
};

const CHAT_STOPWORDS = new Set(['a','an','the','is','are','am','be','do','does','did','how','what','which','who','whom','where','when','why','can','could','would','should','i','you','we','they','it','to','for','of','on','at','in','about','me','my','your','our','with','and','or','but','any','some','that','this','these','those','find','show','tell','give','get','got','want','wanted','need','looking','look','please','help','article','articles','read','reads','reading','uxr','uxrs','researcher','researchers','more','most','best','good','great','topic','topics','related','around','covering','cover','have','has','there','their','from','into','like','know']);

function chatTokens(str) {
  return (str || '').toLowerCase().match(/[a-z0-9]+/g) || [];
}

function chatArticles() {
  return (window.ARTICLES_DATA && window.ARTICLES_DATA.length) ? window.ARTICLES_DATA : (allArticles || []);
}

function detectTheme(q) {
  let best = null, bestScore = 0;
  for (const [name, info] of Object.entries(CHAT_THEMES)) {
    let s = 0;
    for (const w of info.words) if (q.includes(w)) s++;
    if (s > bestScore) { bestScore = s; best = name; }
  }
  return best;
}

// Relevance score: title matches weigh most, then summary, then theme
function scoreArticles(tokens) {
  const keys = [...new Set(tokens.filter(t => t.length > 2 && !CHAT_STOPWORDS.has(t)))];
  if (!keys.length) return [];
  return chatArticles().map(a => {
    const title   = (a.title || '').toLowerCase();
    const summary = (a.summary || '').toLowerCase();
    const theme   = (a.theme || '').toLowerCase();
    let score = 0;
    for (const k of keys) {
      if (title.includes(k))   score += 5;
      if (summary.includes(k)) score += 2;
      if (theme.includes(k))   score += 1;
    }
    return { a, score };
  }).filter(x => x.score > 0).sort((x, y) => y.score - x.score);
}

function formatArticleList(articles) {
  return articles.map(a =>
    `• <a href="${a.link || '#'}" target="_blank" rel="noopener noreferrer">${a.title} ↗</a>`
  ).join('\n');
}

function getBotReply(text) {
  const q = (text || '').toLowerCase().trim();
  const tokens = chatTokens(q);

  // Conversational intents
  if (tokens.length <= 3 && tokens.some(t => ['hi','hello','hey','yo','hiya','howdy','sup'].includes(t))) {
    return 'Hey! 👋 Tell me a topic — like <em>trust</em>, <em>AI agents</em>, <em>education</em>, or <em>evaluating outputs</em> — and I\'ll pull up the most relevant articles.';
  }
  if (/\b(thanks|thank you|thank u|thx|ty|cheers|appreciate)\b/.test(q)) {
    return 'Anytime! 😊 Ask me about another topic whenever you\'re ready.';
  }
  if (/\b(help|what can you do|how do you work|how do i use)\b/.test(q)) {
    return 'I search all the articles for you. Try things like:\n• "articles about AI trust"\n• "how do I evaluate AI outputs?"\n• "future of work"\nYou can also **Save** (☆) and **Mark as read** (○) any article.';
  }
  if (/\b(save|saved|bookmark|mark as read|progress|my stats|reading stat)\b/.test(q)) {
    return 'You can **Save** any article with the ☆ button and **Mark as read** with the ○ button. Your reading stats appear in the panel on the right of the homepage.';
  }
  if (/\b(go deeper|playbook|deep dive|next step|next steps|experiment|prompt|prompts|framework)\b/.test(q)) {
    return 'Check out <a href="./PLaybook/index.html">Go Deeper ↗</a> for reading paths, research ideas, experiments to try, and Copilot prompts.';
  }

  // Article relevance search across the full dataset
  const scored = scoreArticles(tokens);
  const theme  = detectTheme(q);

  if (scored.length) {
    const top = scored.slice(0, 3).map(x => x.a);
    const intro = top.length === 1
      ? 'I found one article that fits'
      : `Here ${top.length === 2 ? 'are 2 reads' : 'are 3 reads'} that match`;
    let reply = `${intro}:\n${formatArticleList(top)}`;
    if (theme) {
      const count = chatArticles().filter(a => a.theme === theme).length;
      if (count > top.length) {
        reply += `\n\nThere are ${count} articles in the **${theme}** theme — use the filter buttons to see them all.`;
      }
    }
    return reply;
  }

  // No keyword hits, but we recognised a theme
  if (theme) {
    const info = CHAT_THEMES[theme];
    const inTheme = chatArticles().filter(a => a.theme === theme).slice(0, 3);
    if (inTheme.length) {
      return `${info.emoji} The **${theme}** theme is a great fit. A few to start with:\n${formatArticleList(inTheme)}`;
    }
  }

  return 'I couldn\'t find a direct match for that. Try a keyword like <em>trust</em>, <em>agents</em>, <em>productivity</em>, <em>education</em>, or <em>hallucination</em> — or use the theme filters above to browse.';
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

// ── Dark mode toggle ────────────────────────────────────────────
function initThemeToggle() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle-btn';
  const sync = () => {
    const dark = document.documentElement.classList.contains('dark');
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    btn.setAttribute('aria-label', btn.title);
    btn.setAttribute('aria-pressed', String(dark));
  };
  sync();
  btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('colorMode', dark ? 'dark' : 'light'); } catch (e) { /* noop */ }
    sync();
  });
  navLinks.appendChild(btn);
}

// ── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  markActiveNav();
  initThemeToggle();
  initChatbot();

  const isHomepage  = !!document.getElementById('articles-grid');
  const isThemePage = !!document.getElementById('theme-articles-grid');

  if (isHomepage || isThemePage) {
    loadArticles();
  }

  if (isHomepage) {
    renderFeaturedThemes();
    renderNewlyAddedSection();
    renderCompeteNewsSection();
    initFilterButtons();
    initSearch();
    initShowMore();
    renderHomepageArticles();
    renderSavedSection();
    renderReadingStats();
  }

  if (isThemePage) {
    const themeName = document.body.dataset.theme;
    if (themeName) renderThemePage(themeName);
  }
});
