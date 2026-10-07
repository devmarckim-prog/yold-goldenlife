import os

files = [
    r'c:\Users\happy\OneDrive\문서\99. App_Dev\YOLD\care_food.html',
    r'c:\Users\happy\OneDrive\문서\99. App_Dev\YOLD\travel_detail.html',
    r'c:\Users\happy\OneDrive\문서\99. App_Dev\YOLD\payment.html',
    r'c:\Users\happy\OneDrive\문서\99. App_Dev\YOLD\voice_search.html'
]

replacements = [
    '#d97706', '#8d4b00', '#b15f00', '#fef3c7', '#fed7aa', '#ffdcc3', '#f59e0b',
    '#fff8ef', '#fffdfa', '#f97316', '#eab308', '#1a2b4c', '#0f1c33', '#4b5b7f',
    '#e0e7ff', '#4338ca', '#e0f2fe', '#c7d2fe', '#eef2ff',
    'rgba(217, 119, 6,', 'rgba(141, 75, 0,', 'rgba(26, 43, 76,', '김영호'
]

for fpath in files:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"FILE: {fpath} (Lines: {len(content.splitlines())})")
        for r in replacements:
            if r in content:
                print(f"FOUND: {r}")
