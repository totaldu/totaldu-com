// client/src/utils/championsSprite.js
// Champions sprites (Menu_CP_XXXX.png) URL 생성 유틸
// Bulbagarden Archives: URL = media/upload/{md5[0]}/{md5[0:2]}/{filename}
import SparkMD5 from 'spark-md5';
import nameToId from '@/data/pokemonNameToId.json';

const BASE_URL = 'https://archives.bulbagarden.net/media/upload';

const buildUrl = (filename) => {
  const hash = SparkMD5.hash(filename);
  return `${BASE_URL}/${hash[0]}/${hash.slice(0, 2)}/${filename}`;
};

/**
 * PokeAPI 포켓몬 이름 → Champions sprite URL
 * 스프라이트가 존재하지 않으면 null 반환 → 호출측에서 PokeAPI 스프라이트로 폴백
 *
 * 지원 폼: base / Mega / Mega_X / Mega_Y / Alola / Galar / Hisui / Paldea / Primal
 */
export const getChampionsSpriteUrl = (pokemonName) => {
  // 기본 폼 직접 조회 (하이픈 포함 기본 폼도 포함)
  if (nameToId[pokemonName] !== undefined) {
    const padded   = String(nameToId[pokemonName]).padStart(4, '0');
    return buildUrl(`Menu_CP_${padded}.png`);
  }

  // 폼 접미사 파싱
  const parts = pokemonName.split('-');
  let champSuffix = '';
  let baseParts   = [...parts];

  const megaIdx = parts.indexOf('mega');
  if (megaIdx !== -1) {
    const next = parts[megaIdx + 1];
    champSuffix = next === 'x' ? '-Mega_X' : next === 'y' ? '-Mega_Y' : '-Mega';
    baseParts   = parts.slice(0, megaIdx);
  } else if (parts.includes('primal')) {
    champSuffix = '-Primal';
    baseParts   = parts.filter(p => p !== 'primal');
  } else if (parts.includes('alola')) {
    champSuffix = '-Alola';
    baseParts   = parts.filter(p => p !== 'alola');
  } else if (parts.includes('galar')) {
    champSuffix = '-Galar';
    baseParts   = parts.filter(p => p !== 'galar');
  } else if (parts.includes('hisui')) {
    champSuffix = '-Hisui';
    baseParts   = parts.filter(p => p !== 'hisui');
  } else if (parts.includes('paldea')) {
    champSuffix = '-Paldea';
    baseParts   = parts.filter(p => p !== 'paldea');
  }

  const baseName = baseParts.join('-');
  const dexNum   = nameToId[baseName];
  if (dexNum === undefined) return null;

  const padded = String(dexNum).padStart(4, '0');
  return buildUrl(`Menu_CP_${padded}${champSuffix}.png`);
};
