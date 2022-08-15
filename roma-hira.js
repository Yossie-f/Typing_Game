// License: Public Domain
var roman2hiragana = {
  'a':'ア', 'i':'イ', 'u':'ウ', 'e':'エ', 'o':'オ',
  'ka':'カ', 'ki':'キ', 'ku':'ク', 'ke':'ケ', 'ko':'コ',
  'sa':'サ', 'si':'シ', 'su':'ス', 'se':'セ', 'so':'ソ', 'shi':'シ',
  'ta':'タ', 'ti':'チ', 'tu':'ツ', 'te':'テ', 'to':'ト', 'chi':'チ', 'tsu':'ツ',
  'na':'ナ', 'ni':'ニ', 'nu':'ヌ', 'ne':'ネ', 'no':'ノ',
  'ha':'ハ', 'hi':'ヒ', 'hu':'フ', 'he':'ヘ', 'ho':'ホ', 'fu':'フ',
  'ma':'マ', 'mi':'ミ', 'mu':'ム', 'me':'メ', 'mo':'モ',
  'ya':'ヤ', 'yi':'イ', 'yu':'ユ', 'ye':'イェ', 'yo':'ヨ',
  'ra':'ラ', 'ri':'リ', 'ru':'ル', 're':'レ', 'ro':'ロ',
  'wa':'ワ', 'wyi':'ヰ', 'wu':'ウ', 'wye':'ヱ', 'wo':'ヲ',
  'nn':'ン',
  'ga':'ガ', 'gi':'ギ', 'gu':'グ', 'ge':'ゲ', 'go':'ゴ',
  'za':'ザ', 'zi':'ジ', 'zu':'ズ', 'ze':'ゼ', 'zo':'ゾ', 'ji':'ジ',
  'da':'ダ', 'di':'ヂ', 'du':'ヅ', 'de':'デ', 'do':'ド',
  'ba':'バ', 'bi':'ビ', 'bu':'ブ', 'be':'ベ', 'bo':'ボ',
  'pa':'パ', 'pi':'ピ', 'pu':'プ', 'pe':'ペ', 'po':'ポ',
  'kya':'キャ', 'kyu':'キュ', 'kyo':'キョ',
  'sya':'シャ', 'syu':'シュ', 'syo':'ショ','sha':'シャ', 'shu':'シュ', 'she':'シェ', 'sho':'ショ',
  'tya':'チャ', 'tyi':'チィ', 'tyu':'チュ', 'tye':'チェ', 'tyo':'チョ', 'cha':'チャ', 'chu':'チュ', 'che':'チェ', 'cho':'チョ',
  'nya':'ニャ', 'nyi':'ニィ', 'nyu':'ニュ', 'nye':'ニェ', 'nyo':'ニョ',
  'hya':'ヒャ', 'hyi':'ヒィ', 'hyu':'ヒュ', 'hye':'ヒェ', 'hyo':'ヒョ',
  'mya':'ミャ', 'myi':'ミィ', 'myu':'ミュ', 'mye':'ミェ', 'myo':'ミョ',
  'rya':'リャ', 'ryi':'リィ', 'ryu':'リュ', 'rye':'リェ', 'ryo':'リョ',
  'gya':'ギャ', 'gyi':'ギィ', 'gyu':'ギュ', 'gye':'ギェ', 'gyo':'ギョ',
  'zya':'ジャ', 'zyi':'ジィ', 'zyu':'ジュ', 'zye':'ジェ', 'zyo':'ジョ',
  'ja':'ジャ', 'ju':'ジュ', 'je':'ジェ', 'jo':'ジョ', 'jya':'ジャ', 'jyi':'ジィ', 'jyu':'ジュ', 'jye':'ジェ', 'jyo':'ジョ',
  'dya':'ヂャ', 'dyi':'ヂィ', 'dyu':'ヂュ', 'dye':'ヂェ', 'dyo':'ヂョ',
  'bya':'ビャ', 'byi':'ビィ', 'byu':'ビュ', 'bye':'ビェ', 'byo':'ビョ',
  'pya':'ピャ', 'pyi':'ピィ', 'pyu':'ピュ', 'pye':'ピェ', 'pyo':'ピョ',
  'fa':'ファ', 'fi':'フィ', 'fe':'フェ', 'fo':'フォ',
  'fya':'フャ', 'fyu':'フュ', 'fyo':'フョ',
  'xa':'ァ', 'xi':'ィ', 'xu':'ゥ', 'xe':'ェ', 'xo':'ォ', 'la':'ァ', 'li':'ィ', 'lu':'ゥ', 'le':'ェ', 'lo':'ォ',
  'xya':'ャ', 'xyu':'ュ', 'xyo':'ョ',
  'xtu':'ッ', 'xtsu':'ッ',
  'wi':'ウィ', 'we':'ウェ',
  'va':'ヴァ', 'vi':'ヴィ', 'vu':'ヴ', 've':'ヴェ', 'vo':'ヴォ',
  '-':'ー',
};

/*
 * roman -> hiragana
 *
 * @param (String) roman:
 * @return (String): hiragana
 */
function r2h(roman) {
  var i, iz, match, regex,
      hiragana = '', table = roman2hiragana;

  regex = new RegExp((function(table){
    var key, s = '^(?:';
    for (key in table) if (table.hasOwnProperty(key)) {
      s += key + '|';
    }
    return s + '(?:n(?![aiueo]|y[aiueo]|$))|' + '([^aiueon])\\1)';
  })(table));

  for (i = 0 ; i < roman.length; ++i) {
    //正規表現にマッチする文字を含んでいればtrue, なければnullなのでfalse
    if (match = roman.slice(i).match(regex)) { 
      if (match[0] === 'n') {
        hiragana += 'ン';
      } else if (/^([^n])\1$/.test(match[0])) {
        hiragana += 'ッ';
        --i;
      } else {
        hiragana += table[match[0]];
      }
      i += match[0].length - 1;
    } else {
      hiragana += roman[i];
    }
  }
  return hiragana;
}