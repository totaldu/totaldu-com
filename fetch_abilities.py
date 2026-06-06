import subprocess, json

def curl(url):
    r = subprocess.run(['curl','-s','-A','Mozilla/5.0', url], capture_output=True, timeout=20)
    return json.loads(r.stdout.decode('utf-8'))

meta = curl('https://pokeapi.co/api/v2/ability?limit=1')
total = meta['count']
print(f"Total abilities: {total}")

all_list = curl(f'https://pokeapi.co/api/v2/ability?limit={total}')['results']
print(f"Fetching {len(all_list)} abilities...")

mapping = {}
for i, entry in enumerate(all_list):
    try:
        data = curl(entry['url'])
        ko = next((n['name'] for n in data['names'] if n['language']['name'] == 'ko'), None)
        if ko:
            mapping[entry['name']] = ko
    except Exception as e:
        print(f"  ERROR {entry['name']}: {e}")
    if (i+1) % 50 == 0:
        print(f"  {i+1}/{len(all_list)}  mapped={len(mapping)}")

print(f"\nDone. {len(mapping)}/{len(all_list)} mapped.")

with open('client/src/data/abilityKoreanNames.json', 'w', encoding='utf-8') as fp:
    json.dump(mapping, fp, ensure_ascii=False, indent=2, sort_keys=True)
print("Saved.")
