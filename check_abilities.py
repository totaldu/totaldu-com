import subprocess, json

HIDDEN_FORM_SUFFIXES = {
    'busted','totem-busted','battle-bond',
    '50-power-construct','10',
    'orange-meteor','yellow-meteor','green-meteor',
    'blue-meteor','indigo-meteor','violet-meteor',
    'curly-mega','droopy-mega',
    'limited-build','sprinting-build',
    'swimming-build','gliding-build'
}

def is_hidden_form(name):
    parts = name.split('-')
    if len(parts) > 1:
        suffix = '-'.join(parts[1:])
        return suffix in HIDDEN_FORM_SUFFIXES
    return False

def curl(url):
    r = subprocess.run(['curl','-s','-A','Mozilla/5.0', url], capture_output=True, timeout=20)
    return json.loads(r.stdout.decode('utf-8'))

empty_ability_forms = []

print("Checking #1 ~ #1025 ...")
for pid in range(1, 1026):
    try:
        base = curl(f'https://pokeapi.co/api/v2/pokemon/{pid}')
        species = curl(base['species']['url'])
        varieties = species['varieties']

        if len(varieties) > 1:
            for v in varieties:
                form_name = v['pokemon']['name']
                if is_hidden_form(form_name):
                    continue
                form = curl(v['pokemon']['url'])
                if not form.get('abilities'):
                    empty_ability_forms.append(f"#{pid} {form_name}")
        else:
            if not base.get('abilities'):
                empty_ability_forms.append(f"#{pid} {base['name']}")

    except Exception as e:
        print(f"  ERROR #{pid}: {e}")

    if pid % 100 == 0:
        print(f"  {pid}/1025 done, found {len(empty_ability_forms)} so far")

print(f"\n=== 특성 없는 폼 ({len(empty_ability_forms)}개) ===")
for f in empty_ability_forms:
    print(f)
