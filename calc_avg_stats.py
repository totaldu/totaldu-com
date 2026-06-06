import subprocess, json, time
from concurrent.futures import ThreadPoolExecutor, as_completed

# LAST_VERSION에서 Champions인 ID 목록
CHAMPIONS_IDS = [
    # Gen 1
    3,6,9,15,17,24,25,26,36,38,59,65,68,71,80,94,115,121,123,128,130,132,133,134,135,136,142,143,149,
    # Gen 2
    154,157,160,168,181,184,186,197,199,205,208,212,214,227,229,248,
    # Gen 3
    279,282,297,302,308,310,319,323,324,334,350,351,354,358,359,362,
    # Gen 4
    389,392,395,405,407,409,411,428,442,445,448,450,452,460,461,464,470,471,472,473,475,478,479,
    # Gen 5
    497,500,503,510,512,514,516,526,530,531,547,560,569,571,579,581,584,587,609,614,623,635,637,
    # Gen 6
    652,655,658,662,663,666,670,671,673,676,678,681,683,685,693,695,697,699,700,701,702,706,707,709,711,713,715,
    # Gen 7
    724,727,730,733,740,745,746,750,752,758,763,765,766,775,776,778,779,780,781,783,784,
    # Gen 8
    854,866,869,877,887,899,900,902,903,
    # Gen 9
    908,911,914,925,936,937,939,940,952,956,957,963,964,967,977,979,980,983,998,1019,
]

STAT_KEYS = ['hp','attack','defense','special-attack','special-defense','speed']

def fetch_stats(pid):
    url = f'https://pokeapi.co/api/v2/pokemon/{pid}'
    r = subprocess.run(['curl','-s','-A','Mozilla/5.0',url], capture_output=True, text=True, timeout=15)
    data = json.loads(r.stdout)
    result = {}
    for s in data['stats']:
        name = s['stat']['name']
        if name in STAT_KEYS:
            result[name] = s['base_stat']
    return pid, result

sums = {k: 0 for k in STAT_KEYS}
count = 0
errors = []

print(f"Fetching stats for {len(CHAMPIONS_IDS)} Champions Pokemon...")

with ThreadPoolExecutor(max_workers=10) as ex:
    futures = {ex.submit(fetch_stats, pid): pid for pid in CHAMPIONS_IDS}
    for i, future in enumerate(as_completed(futures)):
        pid = futures[future]
        try:
            pid, stats = future.result()
            for k in STAT_KEYS:
                sums[k] += stats.get(k, 0)
            count += 1
            if (i+1) % 20 == 0:
                print(f"  {i+1}/{len(CHAMPIONS_IDS)} done...")
        except Exception as e:
            errors.append((pid, str(e)))
            print(f"  ERROR {pid}: {e}")

if errors:
    print(f"\nErrors: {errors}")

averages = {k: round(sums[k] / count, 1) for k in STAT_KEYS}
print(f"\nTotal: {count} Pokemon")
print(f"\nAverages:")
for k, v in averages.items():
    print(f"  {k}: {v}")

# JS 상수 출력
print("\n// JS constant:")
print("export const CHAMPIONS_AVG_STATS = {")
for k, v in averages.items():
    print(f"  '{k}': {v},")
print("};")
