/* =============================================
   AI UX Research Intelligence Hub — main.js
   ============================================= */

'use strict';

// ── Config ──────────────────────────────────────────────────────
const SAVE_KEY   = 'aiuxr-saved-articles';
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

  const card = document.createElement('div');
  card.className = 'card article-card';
  card.dataset.theme = article.theme;
  card.dataset.id = article.id;

  card.innerHTML = `
    <div class="card-body">
      <div class="card-meta">
        <span class="theme-badge ${themeClass(article.theme)}">${article.theme}</span>
        ${monthHtml}
        ${sourceHtml}
      </div>
      <h3 style="margin-top:10px">${article.title}</h3>
      <p>${truncate(article.summary, 180)}</p>
    </div>
    <div class="card-footer">
      <a href="${externalHref}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        Read Article ↗
      </a>
      ${localLink}
      <button class="btn-save ${saved ? 'saved' : ''}" data-id="${article.id}" aria-label="Save article">
        ${saved ? '★ Saved' : '☆ Save'}
      </button>
    </div>`;

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

// ── Theme Page: render articles by theme ────────────────────────
function renderThemePage(themeName) {
  // Decode HTML entities that may appear in data-theme attribute
  const decoded = themeName.replace(/&amp;/g, '&');
  const articles = allArticles.filter(a => a.theme === decoded);
  renderArticlesGrid('theme-articles-grid', articles);
}

// ── Chatbot Widget ───────────────────────────────────────────────
const BOT_RESPONSES = [
  "Great question! I'd suggest exploring the **'Evaluating AI Outputs'** theme for structured frameworks UX researchers can apply.",
  "Try searching for articles on **trust** in AI — there's rich material on how users perceive and interact with AI systems.",
  "The **Cybernetic Teammate** article has a great breakdown on how AI collaboration changes team dynamics in research.",
  "For research workflows, check out the **Human + AI Workflows** theme — it covers mental models and productivity patterns.",
  "Interested in measuring AI effectiveness? Look at the article on **Measuring AI Ability to Complete Long Tasks** — it reframes evaluation nicely.",
  "The **'Giving your AI a Job Interview'** article is a great starting point for evaluating AI tools before using them in research.",
  "Check the **Playbook** section for structured guidance on evaluating AI outputs and designing Copilot experiences.",
  "I recommend exploring articles tagged **Evaluating AI Outputs** for practical UX research evaluation frameworks.",
];
let botIndex = 0;

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
    setTimeout(() => {
      const reply = BOT_RESPONSES[botIndex % BOT_RESPONSES.length];
      botIndex++;
      appendMsg(reply, 'bot');
    }, 600);
  }

  function appendMsg(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
  }

  if (isThemePage) {
    const themeName = document.body.dataset.theme;
    if (themeName) renderThemePage(themeName);
  }
});
