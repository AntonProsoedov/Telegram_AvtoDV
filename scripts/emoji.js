const EMOJI = {
  Japan: '🇯🇵',
  China: '🇨🇳',
  Korea: '🇰🇷',
};
function getEmoji (name) {
  return EMOJI[name]
}

export default getEmoji;