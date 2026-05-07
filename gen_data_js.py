import json

with open(r'c:\Users\shashirekha\OneDrive - Microsoft\Documents\AI-UXR-Intelligence-Hub\Data\articles.json', encoding='utf-8') as f:
    articles = json.load(f)

# Write as a JS module with inline data
lines = ['// Auto-generated from CTQ Articles.xlsx — do not edit manually\n']
lines.append('window.ARTICLES_DATA = ')
lines.append(json.dumps(articles, indent=2, ensure_ascii=False))
lines.append(';\n')

out = r'c:\Users\shashirekha\OneDrive - Microsoft\Documents\AI-UXR-Intelligence-Hub\Scripts\articles-data.js'
with open(out, 'w', encoding='utf-8') as f:
    f.write(''.join(lines))

print(f'Written {len(articles)} articles to articles-data.js')
