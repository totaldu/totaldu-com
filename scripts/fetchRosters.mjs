// scripts/fetchRosters.mjs
// lolesports API에서 각 팀의 선수 로스터를 가져와 lolRosters.json 생성

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

// short → lolesports team ID
const TEAM_IDS = {
  // LCK
  GEN: '100205573495116443',
  T1:  '98767991853197861',
  HLE: '100205573496804586',
  KT:  '99566404579461230',
  DK:  '100725845018863243',
  BFX: '100725845022060229',
  KRX: '99566404585387054',
  BRO: '105505619546859895',
  NS:  '102747101565183056',
  DNS: '99566404581868574',
  // LPL
  BLG: '99566404853854212',
  TES: '99566404854685458',
  JDG: '99566404852189289',
  AL:  '99566404856367466',
  WBG: '99566404853058754',
  NIP: '101388912914513220',
  IG:  '99566404848691211',
  WE:  '98767991887166787',
  LNG: '99566404850008779',
  TT:  '101388912911039804',
  LGD: '99566404846951820',
  EDG: '98767991882270868',
  UP:  '103461966986776720',
  OMG: '99566404845279652',
  // LEC
  G2:   '98767991926151025',
  FNC:  '98767991866488695',
  VIT:  '99322214695067838',
  KC:   '111692118851466302',
  SK:   '101383793567806688',
  GX:   '101383793572656373',
  MKOI: '103461966965149786',
  SHFT: '107563714667537640',
  TH:   '109637393694097670',
  NAVI: '114868016111590239',
  // LCS
  LYON: '99566405941863385',
  C9:   '98767991877340524',
  FLY:  '98926509892121852',
  TLAW: '98926509885559666',
  DIG:  '98926509883054987',
  DSG:  '110428362822825796',
  SR:   '111504538396430510',
  // LCP
  TSW: '113661839307879869',
  GAM: '98767991954244555',
  DCG: '107700204561086446',
  CFO: '107700199633958891',
  MVK: '107251245690956393',
  SHG: '103535282119620510',
  GZ:  '109675490370327425',
  DFM: '100285330168091787',
  // CBLOL
  FUR:  '100205576309502431',
  RED:  '99566408221961358',
  LOUD: '105397404796640412',
  PAIN: '99566408217955692',
  VKS:  '99566408219409348',
  LOS:  '109480204628225868',
  FX:   '109480056092207899',
  LEV:  '107598699275015260',
};

const ROLE_ORDER = ['top', 'jungle', 'mid', 'bottom', 'support'];

async function fetchTeam(id) {
  const res = await fetch(
    `https://esports-api.lolesports.com/persisted/gw/getTeams?hl=ko-KR&id=${id}`,
    { headers: { 'x-api-key': API_KEY } }
  );
  const json = await res.json();
  return json?.data?.teams?.[0] ?? null;
}

async function main() {
  const rosters = {};
  const shorts = Object.keys(TEAM_IDS);

  for (const short of shorts) {
    const id = TEAM_IDS[short];
    process.stdout.write(`Fetching ${short}...`);
    try {
      const team = await fetchTeam(id);
      if (!team) { console.log(' no data'); continue; }
      const players = (team.players ?? [])
        .filter(p => ROLE_ORDER.includes(p.role))
        .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))
        .map(p => ({
          name: p.summonerName,
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          role: p.role,
          image: p.image || '',
        }));
      rosters[short] = { id, players };
      console.log(` ${players.length} players`);
    } catch (e) {
      console.log(` ERROR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 80));
  }

  const out = {
    updatedAt: new Date().toISOString().slice(0, 10),
    rosters,
  };
  const outPath = resolve(__dirname, '../client/src/data/lolRosters.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main();
