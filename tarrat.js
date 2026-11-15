/* Tarrakirjan tarrat teemoittain. Yhteinen ilmoitustaululle (index.html) ja lapsi-tilalle (lapsi.html, tahtipelit.js).
   Uuden tarran voi lisätä mihin tahansa teemaan: [emoji, nimi]. Sama emoji vain kerran koko listassa. Vältä uusimpia emojeja (2021 jälkeen), koska vanha pad ei ehkä näytä niitä.
   Kiiltotarra tallentuu avaimella emoji + "*". */
(function(){
var THEMES=[
  {id:"metsa",n:"Metsä",e:"🌲",list:[["🦊","kettu"],["🐻","karhu"],["🐰","pupu"],["🦉","pöllö"],["🦔","siili"],["🐿️","orava"],["🦌","peura"],["🐺","susi"],
    ["🍄","sieni"],["🌲","kuusi"],["🐞","leppäkerttu"],["🦋","perhonen"],["🐝","mehiläinen"],["🐌","etana"],["🐸","sammakko"],["🐛","toukka"]]},
  {id:"maatila",n:"Maatila",e:"🚜",list:[["🐄","lehmä"],["🐴","hevonen"],["🐷","possu"],["🐑","lammas"],["🐔","kana"],["🐣","tipu"],["🐐","vuohi"],["🐶","koira"],
    ["🐱","kissa"],["🦆","ankka"],["🚜","traktori"],["🌻","auringonkukka"],["🐭","hiiri"]]},
  {id:"meri",n:"Meri",e:"🌊",list:[["🐟","kala"],["🐠","värikäs kala"],["🐬","delfiini"],["🐳","valas"],["🦈","hai"],["🐙","mustekala"],["🦀","rapu"],["🦞","hummeri"],
    ["🐚","simpukka"],["🦑","kalmari"],["🐢","kilpikonna"],["⛵","purjevene"],["🚢","laiva"],["⚓","ankkuri"],["🏝️","saari"],["🐡","pallokala"]]},
  {id:"elaintarha",n:"Eläintarha",e:"🦁",list:[["🦁","leijona"],["🐘","norsu"],["🦒","kirahvi"],["🦓","seepra"],["🦛","virtahepo"],["🐊","krokotiili"],["🐒","apina"],
    ["🦜","papukaija"],["🐧","pingviini"],["🦩","flamingo"],["🐼","panda"],["🐨","koala"],["🦘","kenguru"],["🐯","tiikeri"]]},
  {id:"avaruus",n:"Avaruus",e:"🚀",list:[["🚀","raketti"],["🛸","ufo"],["🪐","planeetta"],["🌙","kuu"],["🌠","tähdenlento"],["☄️","komeetta"],["👩‍🚀","astronautti"],
    ["🛰️","satelliitti"],["🌍","maapallo"],["👽","avaruusolio"],["☀️","aurinko"]]},
  {id:"talvi",n:"Talvi",e:"❄️",list:[["⛄","lumiukko"],["❄️","lumihiutale"],["🛷","pulkka"],["⛸️","luistin"],["🎿","sukset"],["🧤","lapaset"],["🎄","joulukuusi"],
    ["🎅","joulupukki"],["🏔️","vuori"],["🧣","kaulaliina"],["🎁","lahja"]]},
  {id:"kulkuneuvot",n:"Kulkuneuvot",e:"🚒",list:[["🚒","paloauto"],["🚓","poliisiauto"],["🚑","ambulanssi"],["🚌","bussi"],["🚂","juna"],["🚁","helikopteri"],
    ["✈️","lentokone"],["🚲","polkupyörä"],["🏎️","kilpa-auto"],["🛵","skootteri"],["🚤","moottorivene"],["🚧","tietyö"]]},
  {id:"herkut",n:"Herkut",e:"🍓",list:[["🍓","mansikka"],["🍎","omena"],["🍌","banaani"],["🍉","vesimeloni"],["🍦","jäätelö"],["🧁","kuppikakku"],["🎂","kakku"],
    ["🍪","keksi"],["🍭","tikkari"],["🥕","porkkana"],["🍕","pizza"],["🥞","lettu"],["🍇","viinirypäleet"]]},
  {id:"satu",n:"Satumaa",e:"🏰",list:[["🦄","yksisarvinen"],["🐉","lohikäärme"],["🏰","linna"],["👑","kruunu"],["🧚","keiju"],["🧜‍♀️","merenneito"],["🧙","velho"],
    ["🤖","robotti"],["🌈","sateenkaari"],["🔮","taikapallo"],["💎","timantti"],["🎈","ilmapallo"]]}
];
var ALL=[],BY={};
THEMES.forEach(function(t){t.list.forEach(function(s){if(BY[s[0]])return;var x={e:s[0],n:s[1],t:t.id};ALL.push(x);BY[s[0]]=x;});});
function base(k){return String(k||"").replace(/\*$/,"");}
window.TARRAT={
  themes:THEMES,all:ALL,count:ALL.length,
  base:base,shiny:function(k){return /\*$/.test(String(k||""));},
  name:function(k){var x=BY[base(k)];return x?x.n:"";},
  theme:function(k){var x=BY[base(k)];return x?x.t:"";},
  SHINY_CHANCE:0.08
};
})();
