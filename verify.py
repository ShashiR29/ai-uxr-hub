import json
with open(r'c:\Users\shashirekha\OneDrive - Microsoft\Documents\AI-UXR-Intelligence-Hub\Data\articles.json', encoding='utf-8') as f:
    articles = json.load(f)
print(f'Total articles: {len(articles)}')
themes = {a["theme"] for a in articles}
print('Themes:', themes)
print()
print('Articles with dedicated pages:')
for a in articles:
    if a.get("filename"):
        print(f'  #{a["id"]}: {a["title"][:55]} -> {a["filename"]}')
print()
print('Sample:')
for a in articles[:3]:
    print(f'  #{a["id"]}: {a["title"][:60]} | {a["theme"]}')
