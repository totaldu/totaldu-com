// client/src/utils/pokemonUtils.js
import koreanNames from '../data/pokemonKoreanNames.json';

export const getKoreanName = (name) => {
  if (!name) return '';
  if (koreanNames[name]) return koreanNames[name];
  const baseName = name.split('-')[0];
  return koreanNames[baseName] ?? name;
};

export const TYPE_COLORS = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0',
  grass: '#7AC74C', electric: '#F7D02C', ice: '#96D9D6',
  fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65',
  flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

export const getTypeBgStyle = (mainColor, subColor) => {
  if (subColor) {
    return {
      background: `linear-gradient(135deg, ${mainColor}55 0%, ${mainColor}55 50%, ${subColor}55 50%, ${subColor}55 100%)`,
    };
  }
  return {
    background: `linear-gradient(135deg, ${mainColor}33, ${mainColor}11)`,
  };
};
