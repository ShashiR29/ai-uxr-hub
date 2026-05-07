import xlwings as xw
import json
import re

def slugify(text):
    text = re.sub(r'[^\w\s-]', '', str(text).lower())
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')[:60]

MONTH_NAMES = [
    'january','february','march','april','may','june',
    'july','august','september','october','november','december'
]

def parse_month(date_str):
    """Extract month name from strings like '1st may', '6th March', '21st January'."""
    if not date_str:
        return ''
    s = str(date_str).lower()
    for m in MONTH_NAMES:
        if m in s:
            return m.capitalize()
    return ''

# Theme assignment logic
def assign_theme(title, summary):
    t = (str(title) + ' ' + str(summary)).lower()
    if any(k in t for k in ['job', 'work', 'career', 'employ', 'productiv', 'automat', 'ceo', 'enterprise', 'salary', 'wage', 'office', 'profession']):
        return 'Future of Work'
    if any(k in t for k in ['trust', 'safe', 'psychos', 'harm', 'risk', 'ethic', 'align', 'regulat', 'policy', 'copyright', 'fraud', 'cheat', 'delusio', 'evil', 'children', 'war', 'danger']):
        return 'Trust & Safety in AI'
    if any(k in t for k in ['workflow', 'produc', 'wizard', 'mental model', 'surgeon', 'collaborat', 'teammate', 'manager', 'prompt', 'agent', 'copilot', 'reading', 'vibe cod', 'close read', 'deep research', 'panopticon']):
        return 'Human + AI Workflows'
    if any(k in t for k in ['university', 'education', 'student', 'teacher', 'school', 'college', 'classroom', 'learn', 'textbook', 'campus', 'academic']):
        return 'AI & Education'
    if any(k in t for k in ['llm', 'model', 'benchmark', 'context window', 'token', 'hallucin', 'sycophancy', 'evaluat', 'benchmark', 'radiology', 'commentary', 'jagged', 'placement', 'capability']):
        return 'Evaluating AI Outputs'
    return 'AI Technology'

# Articles that get dedicated local pages (UXR-relevant)
FEATURED_ARTICLES = {
    11: 'llms-sycophancy.html',
    52: 'cybernetic-teammate.html',
    63: 'giving-ai-job-interview.html',
}

app = xw.App(visible=True, add_book=False)
articles = []

try:
    wb = app.books.open(r'C:\Users\shashirekha\OneDrive - Microsoft\Documents\CTQ Articles.xlsx')
    app.display_alerts = False
    ws = wb.sheets[0]
    data = ws.used_range.value

    for i, row in enumerate(data[1:], 1):
        if not row or not row[2]:
            continue
        day = row[0]
        summary = str(row[1]).strip() if row[1] else ''
        title = str(row[2]).strip().lstrip('▶️').strip()
        link = str(row[3]).strip() if row[3] else ''
        # Clean link of parenthetical word counts
        link = re.sub(r'\s*\([^)]+\)$', '', link).strip()
        link = link.lstrip('🔗').strip()

        if not title or title == 'None':
            continue

        theme = assign_theme(title, summary)
        day_num = int(day) if isinstance(day, float) else i
        slug = slugify(title)
        filename = FEATURED_ARTICLES.get(day_num, None)
        month = parse_month(day)

        articles.append({
            "id": day_num,
            "title": title,
            "summary": summary[:300] + ('...' if len(summary) > 300 else ''),
            "link": link,
            "theme": theme,
            "filename": filename,
            "slug": slug,
            "month": month
        })

    wb.close()
finally:
    app.quit()

articles.sort(key=lambda x: x['id'] if isinstance(x['id'], int) else 999)

with open(r'c:\Users\shashirekha\OneDrive - Microsoft\Documents\AI-UXR-Intelligence-Hub\Data\articles.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print(f'Written {len(articles)} articles')
print('Themes:', set(a['theme'] for a in articles))

