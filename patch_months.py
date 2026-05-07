"""
Patch articles.json with month data read from CTQ Articles.xlsx via openpyxl.
Writes output back to articles.json and regenerates articles-data.js.
"""
import openpyxl, re, json

XLSX = r'C:\Users\shashirekha\OneDrive - Microsoft\Documents\CTQ Articles.xlsx'
JSON_PATH = r'c:\Users\shashirekha\OneDrive - Microsoft\Documents\AI-UXR-Intelligence-Hub\Data\articles.json'
JS_PATH   = r'c:\Users\shashirekha\OneDrive - Microsoft\Documents\AI-UXR-Intelligence-Hub\Scripts\articles-data.js'

MONTHS = ['january','february','march','april','may','june',
          'july','august','september','october','november','december']

def parse_month(val):
    if not val:
        return ''
    s = str(val).lower()
    for m in MONTHS:
        if m in s:
            return m.capitalize()
    return ''

# --- Read date column from Excel ---
wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
ws = wb.active

# Build list of (row_index_1based, date_str) skipping header
date_map = {}   # row_number (1-based, excl header) -> month string
for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=1):
    date_val = row[0]
    date_map[i] = parse_month(date_val)

wb.close()
print(f'Read {len(date_map)} date rows from Excel')
print('Sample:', {k: date_map[k] for k in list(date_map.keys())[:5]})

# --- Patch articles.json ---
with open(JSON_PATH, encoding='utf-8') as f:
    articles = json.load(f)

matched = 0
for article in articles:
    row_idx = article['id']  # id is the 1-based row index set in read_excel.py
    month = date_map.get(row_idx, '')
    article['month'] = month
    if month:
        matched += 1

print(f'Patched {matched}/{len(articles)} articles with month data')

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

# --- Regenerate articles-data.js ---
lines = ['// Auto-generated — do not edit manually\n',
         'window.ARTICLES_DATA = ',
         json.dumps(articles, indent=2, ensure_ascii=False),
         ';\n']

with open(JS_PATH, 'w', encoding='utf-8') as f:
    f.write(''.join(lines))

print(f'Written {len(articles)} articles to articles-data.js')
