/* Tähtipelit: minipelit, joihin lapsi käyttää tähtiään lapsi-tilassa (lapsi.html).
   Päälle ja pois taulun asetuksista: Lapsi-tila → Tähdet. Tämä tiedosto ladataan vain, kun pelit ovat päällä,
   joten sen voi poistaa ilman että lapsi-tila hajoaa.
   Lapsi-tila antaa olion api: {child, gamesOn, pickReward(), say, sOn, sOff, sFanfare, tone, balance(), plays(), max(), trickLevel(), spend(game), addSticker(e), album(), albumPlace(), placeSave(list), changed()} */
(function(){
"use strict";
var OLD_STICKERS=[["🦊","kettu"],["🐻","karhu"],["🐰","pupu"],["🦉","pöllö"],["🐸","sammakko"],["🦔","siili"],["🐿️","orava"],["🦌","peura"],
  ["🐟","kala"],["🐞","leppäkerttu"],["🦋","perhonen"],["🐝","mehiläinen"],["🐧","pingviini"],["🦁","leijona"],["🐘","norsu"],["🦒","kirahvi"],
  ["🐢","kilpikonna"],["🐬","delfiini"],["🦄","yksisarvinen"],["🐉","lohikäärme"],["🚒","paloauto"],["🚜","traktori"],["🚀","raketti"],["🚂","juna"],
  ["🚁","helikopteri"],["⛵","purjevene"],["🌈","sateenkaari"],["🍓","mansikka"]];
/* the catalogue is in tarrat.js (shared with the board); the old 28 are used if that file is missing */
var CAT=window.TARRAT||(function(){var all=OLD_STICKERS.map(function(x){return {e:x[0],n:x[1],t:"kaikki"};});function base(k){return String(k||"").replace(/\*$/,"");}
  return {themes:[{id:"kaikki",n:"Tarrat",e:"📒",list:OLD_STICKERS}],all:all,count:all.length,base:base,shiny:function(k){return /\*$/.test(String(k||""));},
    name:function(k){var b=base(k);var x=all.filter(function(y){return y.e===b;})[0];return x?x.n:"";},theme:function(){return "kaikki";},SHINY_CHANCE:0.08};})();
var STICKERS=CAT.all.map(function(x){return [x.e,x.n];});
/* sticker element: shiny ones glitter */
function stHtml(k,cls){return '<span class="'+(cls||"")+(CAT.shiny(k)?" shiny":"")+'">'+esc(CAT.base(k))+'</span>';}
function ownedBase(have){var o={};Object.keys(have).forEach(function(k){if(have[k]>0)o[CAT.base(k)]=1;});return o;}
/* tricks: [emoji, text, count (0 = none), level 1 easy / 2 medium / 3 challenge, own phrase (no "N kertaa")] */
var TRICKS=[
  ["🐸","Hyppää kuin sammakko",3,1],["🦩","Seiso yhdellä jalalla kuin flamingo. Lasketaan viiteen!",5,1,1],["🦒","Kurkota kattoon kuin kirahvi",3,1],
  ["🌀","Pyöri ympäri",2,1],["🦁","Karju kovaa kuin leijona!",0,1],["🐻","Kävele nelinkontin kuin karhu!",0,1],["👏","Taputa käsiä",5,1],["🐰","Pomppaa kuin pupu",4,1],
  ["🐢","Kävele hitaasti kuin kilpikonna!",0,1],["🐍","Sihise kuin käärme!",0,1],["🦶","Kosketa varpaita",3,1],["🐒","Hypi kuin apina",3,1],
  ["🦆","Kävele kuin ankka ja sano kvaak!",0,1],["🐶","Hauku kuin koira",3,1],["🤪","Tee hassu naama!",0,1],
  ["🤸","Kierähdä kuperkeikka pehmeällä alustalla!",0,2],["🦵","Hyppää yhdellä jalalla",3,2],["🙈","Seiso yhdellä jalalla silmät kiinni. Lasketaan viiteen!",5,2,1],
  ["🦀","Kävele sivuttain kuin rapu!",0,2],["✈️","Tee lentokone: yksi jalka ilmaan ja kädet sivuille. Lasketaan viiteen!",5,2,1],["🦘","Hyppää tasajalkaa niin pitkälle kuin pääset!",0,2],
  ["🐛","Ryömi lattialla kuin mato!",0,2],["🗿","Pyöri ympäri ja jähmety sitten patsaaksi!",0,2],["🏋️","Tee kyykky",5,2],["🏃","Juokse paikallaan nopeasti. Lasketaan kymmeneen!",10,2,1],
  ["🤸‍♀️","Tee kärrynpyörä! Aikuinen voi auttaa.",0,3],["🙃","Seiso käsilläsi seinää vasten. Aikuinen auttaa!",0,3],["🛞","Kävele kottikärryä! Aikuinen pitää jaloista kiinni.",0,3],
  ["🌉","Tee silta: maha kohti kattoa!",0,3],["🙌","Hyppää ja taputa käsiä ilmassa",3,3],["🔄","Tee kuperkeikka taaksepäin aikuisen kanssa!",0,3],
  ["📚","Kävele huoneen poikki kirja pään päällä!",0,3],["🦩","Hypi yhdellä jalalla huoneen poikki!",0,3],["⭐","Tee tähtihyppy",5,3]];
var THINGS=[["🍎","omenaa"],["🍓","mansikkaa"],["🐟","kalaa"],["🚗","autoa"],["⭐","tähteä"],["🎈","ilmapalloa"],["🐞","leppäkerttua"],["🧸","nallea"],["🦆","ankkaa"]];
var WORDS=["nolla","yksi","kaksi","kolme","neljä","viisi","kuusi","seitsemän","kahdeksan","yhdeksän","kymmenen"];

var css='.sg{position:fixed;inset:0;z-index:50;background:linear-gradient(180deg,#ffe9a8,#fff6d6 60%,#ffe1ec);display:flex;flex-direction:column;'+
  'padding:max(12px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));gap:12px;font-family:inherit;color:#2b2a4c;-webkit-user-select:none;user-select:none}'+
  '.sg-top{display:flex;align-items:center;gap:12px}.sg-top h2{margin:0;flex:1;font-size:clamp(24px,3.2vw,34px)}'+
  '.sg-bal{background:#fff;border-radius:999px;padding:6px 16px 6px 10px;font-size:26px;font-weight:700;box-shadow:0 5px 0 rgba(43,42,76,.1)}'+
  '.sg-x{width:56px;height:56px;border-radius:50%;border:none;background:#fff;font-size:26px;box-shadow:0 5px 0 rgba(43,42,76,.1);flex:none}'+
  '.sg-body{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;overflow:auto}'+
  '.sg-menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;width:100%;max-width:900px}'+
  '.sg-card{border:none;border-radius:30px;background:#fff;box-shadow:0 7px 0 rgba(43,42,76,.12);padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;min-height:190px;justify-content:center;transition:transform .12s}'+
  '.sg-card:active{transform:scale(.96)}.sg-card .e{font-size:84px;line-height:1}.sg-card b{font-size:26px}.sg-card .c{font-size:18px;color:#6b6a8f;font-weight:600}'+
  '.sg-card.off{opacity:.45}.sg-msg{font-size:22px;font-weight:600;color:#6b6a8f;text-align:center;max-width:640px}'+
  '.sg-big{border:none;border-radius:24px;background:#ffd84d;font-size:28px;font-weight:700;padding:14px 30px;min-height:64px;box-shadow:0 6px 0 rgba(43,42,76,.12)}'+
  '.sg-big.go{background:#38c98b;color:#fff}.sg-big.alt{background:#fff}'+
  '.sg-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}'+
  '.sg-trick{background:#fff;border-radius:34px;box-shadow:0 8px 0 rgba(43,42,76,.12);width:min(520px,92%);padding:20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}'+
  '.sg-trick .e{font-size:130px;line-height:1.05}.sg-trick .t{font-size:clamp(22px,3vw,30px);font-weight:700;line-height:1.2;min-height:2.4em}'+
  '.sg-trick.spin .e{animation:sgspin .12s linear infinite}@keyframes sgspin{50%{transform:translateY(-10px) scale(.9)}}'+
  '.sg-num{font-size:90px;font-weight:700;color:#a98bff;line-height:1;height:96px}.sg-num.pop{animation:sgpop .5s ease}'+
  '@keyframes sgpop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.25);opacity:1}100%{transform:scale(1)}}'+
  '.sg-dots{display:flex;gap:8px}.sg-dots i{width:18px;height:18px;border-radius:50%;background:rgba(43,42,76,.15)}.sg-dots i.ok{background:#38c98b}.sg-dots i.now{background:#ffab5e}'+
  '.sg-q{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;background:#fff;border-radius:30px;padding:16px 20px;box-shadow:0 7px 0 rgba(43,42,76,.12);max-width:94%}'+
  '.sg-grp{display:grid;grid-template-columns:repeat(3,auto);gap:4px}.sg-grp span{font-size:54px;line-height:1.1;transition:transform .2s,filter .2s}'+
  '.sg-grp span.hl{transform:scale(1.35);filter:drop-shadow(0 0 8px #ffd84d)}.sg-plus{font-size:56px;font-weight:700;color:#a98bff}'+
  '.sg-ans{border:4px solid #e7e4f5;background:#fff;border-radius:26px;min-width:120px;min-height:120px;padding:8px 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 6px 0 rgba(43,42,76,.1)}'+
  '.sg-ans b{font-size:60px;line-height:1}.sg-ans .d{font-size:12px;letter-spacing:2px;color:#a98bff;max-width:100px;line-height:1.1;word-break:break-all}'+
  '.sg-ans.ok{border-color:#38c98b;background:#eafff4}.sg-ans.no{animation:sgshake .4s}.sg-ans.hint{animation:sgpulse .9s ease infinite}'+
  '@keyframes sgshake{25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}@keyframes sgpulse{50%{transform:scale(1.08);border-color:#ffd84d}}'+
  '.sg-prize{font-size:180px;line-height:1;animation:sgprize 1.2s cubic-bezier(.3,1.5,.5,1)}@keyframes sgprize{0%{transform:scale(0) rotate(-200deg)}100%{transform:scale(1) rotate(0)}}'+
  '.sg-album{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;width:100%;max-width:960px;align-content:start}'+
  '.sg-st{border:none;border-radius:22px;background:#fff;box-shadow:0 5px 0 rgba(43,42,76,.1);aspect-ratio:1;position:relative;font-size:54px;display:grid;place-items:center}'+
  '.sg-st.no{background:rgba(255,255,255,.5);box-shadow:none;font-size:34px;color:rgba(43,42,76,.25);font-weight:700}'+
  '.sg-st i{position:absolute;right:6px;bottom:4px;font-style:normal;font-size:15px;font-weight:700;background:#ffd84d;border-radius:999px;padding:0 7px}'+
  '.sg-fly{position:fixed;z-index:60;font-size:60px;pointer-events:none;transition:transform .9s cubic-bezier(.5,-0.3,.6,1),opacity .9s}'+
  '.sg-ask{position:fixed;inset:0;z-index:70;background:rgba(43,42,76,.4);display:grid;place-items:center}.sg-ask div{background:#fff;border-radius:30px;padding:22px;display:flex;flex-direction:column;align-items:center;gap:14px}'+
  '.sg-hard{background:#ff8fb1;color:#fff;border-radius:999px;padding:3px 14px;font-size:18px;font-weight:700}'+
  '.sg-col{display:flex;flex-direction:column;align-items:center;gap:4px}.sg-n{font-size:46px;line-height:1;color:#2b2a4c}'+
  '.sg-unk{font-size:54px;min-width:70px;justify-content:center;display:flex;flex-wrap:wrap;max-width:200px}.sg-unk.done{font-size:30px;animation:sgpop .5s}'+
  '.sg-bookbody{justify-content:flex-start!important;gap:10px!important;overflow:hidden!important}'+
  '.sg-scene{position:relative;width:100%;flex:1;min-height:200px;border-radius:26px;overflow:hidden;box-shadow:0 7px 0 rgba(43,42,76,.12);touch-action:none}'+
  '.sg-bg{position:absolute;inset:0;width:100%;height:100%}'+
  '.sg-pl{position:absolute;transform:translate(-50%,-50%);font-size:clamp(40px,6vw,64px);line-height:1;cursor:grab;touch-action:none;filter:drop-shadow(0 3px 0 rgba(255,255,255,.9)) drop-shadow(0 4px 4px rgba(0,0,0,.18))}'+
  '.sg-pages{display:flex;gap:8px;width:100%;overflow-x:auto;scrollbar-width:none;flex:none}'+
  '.sg-pg{flex:none;border:none;border-radius:999px;background:rgba(255,255,255,.6);font-family:inherit;font-size:18px;font-weight:700;color:#2b2a4c;padding:8px 16px;min-height:44px;position:relative}'+
  '.sg-pg[aria-pressed="true"]{background:#fff;box-shadow:0 4px 0 rgba(43,42,76,.12)}'+
  '.sg-pg i{font-style:normal;font-size:12px;background:#ffd84d;border-radius:999px;padding:0 6px;margin-left:6px;vertical-align:2px}'+
  '.sg-tray{display:flex;gap:8px;overflow-x:auto;width:100%;padding:6px 4px;min-height:76px;align-items:center;scrollbar-width:none}'+
  '.sg-tr{position:relative;flex:none;width:66px;height:66px;border-radius:18px;background:#fff;display:grid;place-items:center;font-size:40px;box-shadow:0 4px 0 rgba(43,42,76,.1);touch-action:none;cursor:grab}'+
  '.sg-tr.used{opacity:.35}.sg-tr.new{animation:sgpulse .9s ease infinite;border:3px solid #ffd84d}'+
  '.sg-tr i{position:absolute;right:2px;bottom:0;font-style:normal;font-size:13px;font-weight:700;background:#ffd84d;border-radius:999px;padding:0 6px}'+
  '.sg-ghost{position:fixed;z-index:80;font-size:72px;line-height:1;transform:translate(-50%,-60%) scale(1.1);pointer-events:none;filter:drop-shadow(0 8px 8px rgba(0,0,0,.25))}'+
  '.sg-pl.wig{animation:sgwig .5s ease}@keyframes sgwig{25%{transform:translate(-50%,-50%) rotate(-12deg)}75%{transform:translate(-50%,-50%) rotate(12deg)}}'+
  '.sg-tr.wig{animation:sgpop .4s}'+
  '.shiny{position:relative;display:inline-block;filter:drop-shadow(0 0 6px #ffd84d) drop-shadow(0 0 2px #fff) saturate(1.3);animation:sgshine 1.8s ease-in-out infinite}'+
  '@keyframes sgshine{50%{filter:drop-shadow(0 0 14px #ffe873) drop-shadow(0 0 4px #fff) saturate(1.6) brightness(1.15)}}'+
  '.sg-pl.shiny{display:block;animation:sgshine 1.8s ease-in-out infinite}.sg-tr.shiny{background:linear-gradient(135deg,#fff7c2,#fff 50%,#ffe7f3)}'+
  '.sg-st.shiny{background:linear-gradient(135deg,#fff7c2,#fff 50%,#ffe7f3)}'+
  '.sg-choose{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}'+
  '.sg-ch{position:relative;border:none;background:#fff;border-radius:28px;width:min(150px,28vw);aspect-ratio:1;font-size:min(80px,15vw);box-shadow:0 7px 0 rgba(43,42,76,.12);display:grid;place-items:center;transition:transform .3s,opacity .3s}'+
  '.sg-ch:active{transform:scale(.94)}.sg-ch i{position:absolute;top:-8px;right:-6px;font-style:normal;font-size:15px;font-weight:700;background:#ff8fb1;color:#fff;border-radius:999px;padding:2px 10px}'+
  '.sg-ch.away{opacity:0;transform:scale(.6)}.sg-ch.picked{transform:scale(1.2)}'+
  '.sg-th{width:100%;max-width:960px}.sg-th h3{margin:10px 0 6px;font-size:22px;display:flex;align-items:center;gap:8px}.sg-th h3 span{font-size:16px;color:#6b6a8f}.sg-th h3 b{font-size:24px}'+
  '@media (prefers-reduced-motion:reduce){.sg *{animation:none!important;transition:none!important}}';
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

var A=null,root=null,timers=[];
function T(f,ms){timers.push(setTimeout(f,ms));}
function clearT(){timers.forEach(clearTimeout);timers=[];}
function rnd(n){return Math.floor(Math.random()*n);}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

function shell(title,body,inGame){
  clearT();
  if(!root){root=document.createElement("div");root.className="sg";document.body.appendChild(root);}
  root.innerHTML='<div class="sg-top"><h2>'+title+'</h2>'+(A.gamesOn===false?"":'<span class="sg-bal">⭐ <span id="sgBal">'+A.balance()+'</span></span>')+'<button class="sg-x" type="button" aria-label="Sulje">✕</button></div><div class="sg-body">'+body+'</div>';
  root.querySelector(".sg-x").onclick=function(){if(inGame)askQuit();else close();};
  return root.querySelector(".sg-body");
}
function close(){clearT();if(window.speechSynthesis)speechSynthesis.cancel();if(root){root.remove();root=null;}A.changed();}
function askQuit(){
  var o=document.createElement("div");o.className="sg-ask";
  o.innerHTML='<div><span style="font-size:28px;font-weight:700">Lopetetaanko peli?</span><div class="sg-row"><button class="sg-big alt" type="button" data-a="no">↩ Jatketaan</button><button class="sg-big" type="button" data-a="yes">🏠 Lopetetaan</button></div></div>';
  root.appendChild(o);
  o.querySelector('[data-a="no"]').onclick=function(){o.remove();};
  o.querySelector('[data-a="yes"]').onclick=function(){menu(A);};
}

/* ---------- menu ---------- */
function menu(api){
  A=api;var bal=A.balance(),max=A.max(),played=A.plays(),full=max>0&&played>=max;
  var b=shell("Tähtipelit ⭐",
    '<div class="sg-menu">'+
      '<button class="sg-card'+(bal<1||full?" off":"")+'" type="button" data-g="trick"><span class="e">🤸</span><b>Tee temppu</b><span class="c">⭐ 1</span></button>'+
      '<button class="sg-card'+(bal<1||full?" off":"")+'" type="button" data-g="math"><span class="e">➕</span><b>Laskut</b><span class="c">⭐ 1</span></button>'+
      '<button class="sg-card" type="button" data-g="album"><span class="e">📒</span><b>Tarrakirja</b><span class="c">'+Object.keys(ownedBase(A.album())).length+' / '+CAT.count+'</span></button>'+
    '</div><p class="sg-msg">'+(full?"Pelit on pelattu tältä päivältä. Huomenna taas! 🌙":bal<1?"Tähdet saat tekemällä aamun ja illan tehtävät.":"Yksi peli maksaa yhden tähden. Pelin lopuksi saat tarran!")+'</p>');
  b.querySelectorAll("[data-g]").forEach(function(c){c.onclick=function(){
    var g=c.dataset.g;
    if(g==="album"){book();return;}
    if(full){A.sOff();A.say("Pelit on pelattu tältä päivältä. Huomenna taas!");return;}
    if(A.balance()<1){A.sOff();A.say("Tarvitset tähden. Tee aamun tai illan tehtävät, niin saat tähden!");return;}
    if(!A.spend(g))return;
    fly(root.querySelector(".sg-bal"),c,function(){if(g==="trick")trick();else math();});
  };});
  A.say(full?"Pelit on pelattu tältä päivältä.":bal>0?"Sinulla on "+bal+(bal===1?" tähti":" tähteä")+". Mitä pelataan?":"Tähdet saat tekemällä tehtävät.");
}
function fly(from,to,done){
  var a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),s=document.createElement("div");s.className="sg-fly";s.textContent="⭐";
  s.style.left=(a.left+a.width/2-30)+"px";s.style.top=(a.top)+"px";document.body.appendChild(s);
  var bal=document.getElementById("sgBal");if(bal)bal.textContent=A.balance();A.tone(880,0,.15);A.tone(1320,.15,.2);
  requestAnimationFrame(function(){s.style.transform="translate("+(b.left+b.width/2-a.left-a.width/2)+"px,"+(b.top+b.height/2-a.top)+"px) scale(1.6)";s.style.opacity="0";});
  setTimeout(function(){s.remove();done();},950);
}

/* ---------- Tee temppu: three tricks; the grown-ups choose how hard (easy, mixed, challenging) ---------- */
function trick(){
  var lv=A.trickLevel?A.trickLevel():2,plan=lv===1?[1,1,2]:lv===3?[2,3,3]:[1,2,3],used=[];
  var deck=plan.map(function(l){var pool=TRICKS.filter(function(t){return t[3]===l&&used.indexOf(t)<0;}),t=pool[rnd(pool.length)];used.push(t);return t;});
  var round=0;
  function next(){
    if(round>=3){reward();return;}
    var tr=deck[round];
    var b=shell("Tee temppu! 🤸",'<div class="sg-dots">'+[0,1,2].map(function(i){return '<i class="'+(i<round?"ok":i===round?"now":"")+'"></i>';}).join("")+'</div>'+
      '<div class="sg-trick spin">'+(tr[3]===3?'<span class="sg-hard">💪 Haastetemppu!</span>':"")+'<span class="e">❓</span><span class="t"></span><div class="sg-num"></div></div><div class="sg-row" id="sgBtns"></div>',true);
    var card=b.querySelector(".sg-trick"),em=card.querySelector(".e"),i=0,hard=card.querySelector(".sg-hard");if(hard)hard.style.visibility="hidden";
    var iv=setInterval(function(){em.textContent=TRICKS[i++%TRICKS.length][0];A.tone(500+(i%5)*80,0,.05,"square",.05);},110);timers.push(iv);
    T(function(){
      clearInterval(iv);card.classList.remove("spin");em.textContent=tr[0];if(hard)hard.style.visibility="";
      var txt=tr[4]||!tr[2]?tr[1]:tr[1]+" "+tr[2]+" kertaa!";
      card.querySelector(".t").textContent=txt;A.sOn();A.say((tr[3]===3?"Haastetemppu! ":"")+txt);
      var wait=Math.min(5200,1600+txt.length*60);
      if(tr[2]){for(var k=1;k<=tr[2];k++)(function(k){T(function(){var n=card.querySelector(".sg-num");n.textContent=k;n.classList.remove("pop");void n.offsetWidth;n.classList.add("pop");A.tone(600+k*60,0,.25,"triangle");A.say(WORDS[k]);},wait+(k-1)*1300);})(k);}
      T(function(){
        var bt=b.querySelector("#sgBtns");bt.innerHTML='<button class="sg-big go" type="button">✓ Tein sen!</button>';
        bt.firstChild.onclick=function(){A.sFanfare();A.say(tr[3]===3?["Huikeaa!","Olet tosi taitava!","Wau, mikä temppu!"][rnd(3)]:["Hienoa!","Upeaa!","Mahtavaa!","Taitavaa!"][rnd(4)]);round++;T(next,1300);};
      },tr[2]?wait+tr[2]*1300:wait);
    },1500);
  }
  next();
}

/* ---------- Laskut: five additions with pictures and numbers; the level follows how it goes ---------- */
function math(){
  var key="sg.lvl."+A.child,lvl=1;try{lvl=+localStorage.getItem(key)||1;}catch(e){}lvl=Math.max(1,Math.min(3,lvl));
  var q=0,good=0;
  function next(){
    if(q>=5){
      var nl=good>=4?Math.min(3,lvl+1):good<=2?Math.max(1,lvl-1):lvl;try{localStorage.setItem(key,String(nl));}catch(e){}
      reward();return;}
    var th=THINGS[rnd(THINGS.length)],max=lvl===1?4:lvl===2?6:10,a=1+rnd(Math.min(5,max-1)),b2=1+rnd(Math.min(5,max-a)),sum=a+b2;
    var opts=[sum];while(opts.length<3){var o=sum+[-2,-1,1,2][rnd(4)];if(o>=2&&o<=10&&opts.indexOf(o)<0)opts.push(o);}shuffle(opts);
    function grp(n,off){var h="";for(var i=0;i<n;i++)h+='<span data-i="'+(off+i)+'">'+th[0]+'</span>';return '<div class="sg-col"><div class="sg-grp">'+h+'</div><b class="sg-n">'+n+'</b></div>';}
    var body='<div class="sg-dots">'+[0,1,2,3,4].map(function(i){return '<i class="'+(i<q?"ok":i===q?"now":"")+'"></i>';}).join("")+'</div>'+
      '<div class="sg-q">'+grp(a,0)+'<span class="sg-plus">+</span>'+grp(b2,a)+'<span class="sg-plus">=</span><div class="sg-col"><div class="sg-grp sg-unk">❓</div><b class="sg-n" id="sgSum">?</b></div></div>'+
      '<div class="sg-row">'+opts.map(function(n){return '<button class="sg-ans" type="button" data-n="'+n+'"><b>'+n+'</b><span class="d">'+new Array(n+1).join("●")+'</span></button>';}).join("")+'</div>';
    var bd=shell("Laskut ➕",body,true),first=true,busy=false;
    var ask=WORDS[a]+" "+th[1]+" plus "+WORDS[b2]+" "+th[1]+". Montako yhteensä?";
    T(function(){A.say(ask);},300);
    bd.querySelector(".sg-q").onclick=function(){A.say(ask);};
    bd.querySelectorAll(".sg-ans").forEach(function(btn){btn.onclick=function(){
      if(busy)return;var n=+btn.dataset.n;
      if(n===sum){busy=true;btn.classList.remove("hint");btn.classList.add("ok");bd.querySelector("#sgSum").textContent=sum;
        var u=bd.querySelector(".sg-unk");u.textContent=new Array(sum+1).join(th[0]);u.classList.add("done");
        A.sOn();if(first)good++;A.say("Oikein! "+WORDS[a]+" plus "+WORDS[b2]+" on "+WORDS[sum]+"!");q++;T(next,2600);return;}
      btn.classList.remove("no");void btn.offsetWidth;btn.classList.add("no");A.sOff();first=false;busy=true;
      /* count together, one by one */
      var items=bd.querySelectorAll(".sg-grp span");A.say("Lasketaan yhdessä!");
      for(var i=0;i<sum;i++)(function(i){T(function(){items.forEach(function(x){x.classList.remove("hl");});items[i].classList.add("hl");A.tone(600+i*70,0,.2,"triangle");A.say(WORDS[i+1]);},1500+i*1000);})(i);
      T(function(){items.forEach(function(x){x.classList.remove("hl");});A.say("Yhteensä "+WORDS[sum]+"!");busy=false;
        bd.querySelector('[data-n="'+sum+'"]').classList.add("hint");},1500+sum*1000);
    };});
  }
  next();
}

/* ---------- reward: a random sticker, or the child picks one of five (setting on the board) ---------- */
function drawKey(have,avoid){
  var own=ownedBase(have),fresh=CAT.all.filter(function(x){return !own[x.e]&&(avoid||[]).indexOf(x.e)<0;}),
    pool=fresh.length?fresh:CAT.all.filter(function(x){return (avoid||[]).indexOf(x.e)<0;}),x=pool[rnd(pool.length)];
  return x.e+(Math.random()<CAT.SHINY_CHANCE?"*":"");
}
function reward(){
  if(A.pickReward&&A.pickReward()){choose({title:"Valitse palkinto! 🎉",game:true,onPick:function(){}});return;}
  var have=A.album(),k=drawKey(have),fresh=!ownedBase(have)[CAT.base(k)];
  A.addSticker(k);reveal(k,fresh,"Sait tarran! 🎉");
}
function reveal(k,fresh,title){
  var shiny=CAT.shiny(k),nm=CAT.name(k);
  var b=shell(title,'<div class="sg-prize">'+stHtml(k)+'</div><div style="font-size:34px;font-weight:700">'+(shiny?"✨ Kiiltotarra: ":"")+esc(nm[0].toUpperCase()+nm.slice(1))+(fresh?" · uusi!":"")+'</div>'+
    '<div class="sg-row"><button class="sg-big alt" type="button" data-a="album">📒 Liimaa tarrakirjaan</button><button class="sg-big" type="button" data-a="menu">'+(A.gamesOn===false?"✓ Valmis":"⭐ Valmis")+'</button></div>');
  A.sFanfare();if(shiny)[1568,1760,2093].forEach(function(f,i){A.tone(f,.6+i*.1,.3,"sine",.1);});
  T(function(){A.say((shiny?"Vau, kiiltotarra! ":"Sait tarran: ")+nm+"!"+(fresh?" Se on uusi!":""));},600);
  b.querySelector('[data-a="album"]').onclick=function(){book(k);};
  b.querySelector('[data-a="menu"]').onclick=function(){if(A.gamesOn===false)close();else menu(A);};
}
/* five stickers to choose from: mostly ones the child does not have yet, from different themes */
function choose(o){
  var have=A.album(),own=ownedBase(have),keys=[],themes=[];
  var fresh=shuffle(CAT.all.filter(function(x){return !own[x.e];}));
  fresh.forEach(function(x){if(keys.length<3&&themes.indexOf(x.t)<0){keys.push(x.e);themes.push(x.t);}});
  while(keys.length<5){var k=CAT.base(drawKey(have,keys));if(keys.indexOf(k)<0)keys.push(k);else if(keys.length>=CAT.count)break;}
  keys=shuffle(keys).map(function(k){return k+(Math.random()<CAT.SHINY_CHANCE?"*":"");});
  var b=shell(o.title||"Valitse tarra!",(o.why?'<p class="sg-msg" style="font-size:24px;color:#2b2a4c">'+esc(o.why)+'</p>':"")+
    '<div class="sg-choose">'+keys.map(function(k){return '<button type="button" class="sg-ch" data-k="'+esc(k)+'">'+stHtml(k)+(own[CAT.base(k)]?"":'<i>uusi</i>')+'</button>';}).join("")+'</div>'+
    '<p class="sg-msg">Napauta sitä, jonka haluat.</p>',false);
  T(function(){A.say((o.why?o.why+". ":"")+"Saat valita yhden tarran!");},300);
  /* the star is already spent in a game, so closing still gives one of the five */
  if(o.game)root.querySelector(".sg-x").onclick=function(){var x=b.querySelectorAll(".sg-ch")[rnd(keys.length)];if(x)x.onclick();};
  b.querySelectorAll(".sg-ch").forEach(function(x){x.onclick=function(){
    if(b.dataset.done)return;b.dataset.done="1";
    var k=x.dataset.k,fresh=!own[CAT.base(k)];
    b.querySelectorAll(".sg-ch").forEach(function(y){if(y!==x)y.classList.add("away");});x.classList.add("picked");
    A.addSticker(k);if(o.onPick)o.onPick(k);A.tone(880,0,.12);
    T(function(){reveal(k,fresh,"Valitsit tarran! 🎉");},700);
  };});
}
function nameOf(e){return CAT.name(e);}

/* sticker book pages; the art stays inside the band that is visible on a wide landscape screen */
function svgWrap(inner){return '<svg class="sg-bg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+inner+'</svg>';}
var PAGES=[
 {n:"Niitty",e:"🌳",svg:svgWrap('<defs><linearGradient id="sgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e4f6ff"/></linearGradient>'+
  '<linearGradient id="sgSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc4f0"/><stop offset="1" stop-color="#3a9fd8"/></linearGradient></defs>'+
  '<rect width="1000" height="560" fill="url(#sgSky)"/><circle cx="860" cy="160" r="46" fill="#ffd84d"/><circle cx="860" cy="160" r="62" fill="#ffd84d" opacity=".25"/>'+
  '<g fill="#fff" opacity=".9"><ellipse cx="180" cy="170" rx="70" ry="24"/><ellipse cx="230" cy="154" rx="46" ry="24"/><ellipse cx="560" cy="140" rx="60" ry="20"/><ellipse cx="600" cy="128" rx="36" ry="20"/></g>'+
  '<path d="M0 300 Q160 200 330 280 T680 250 T1000 270 V560 H0Z" fill="#a8dd8f"/>'+
  '<path d="M0 360 Q250 300 520 350 T1000 330 V560 H0Z" fill="#7cc66b"/>'+
  '<path d="M0 420 Q140 380 300 410 Q420 440 380 560 H0Z" fill="url(#sgSea)"/>'+
  '<path d="M560 560 Q600 450 700 400 T1000 360 V400 Q820 420 760 470 T700 560Z" fill="#e8d4a8"/>'+
  '<g><rect x="842" y="262" width="12" height="44" fill="#9a6a3f"/><circle cx="848" cy="250" r="34" fill="#4fae5a"/><rect x="452" y="296" width="10" height="38" fill="#9a6a3f"/><circle cx="457" cy="284" r="28" fill="#5cbb63"/></g>'+
  '<g fill="#ff8fb1"><circle cx="480" cy="470" r="6"/><circle cx="520" cy="500" r="6"/><circle cx="900" cy="500" r="6"/></g><g fill="#fff3a3"><circle cx="440" cy="510" r="6"/><circle cx="960" cy="470" r="6"/></g>')},
 {n:"Meri",e:"🌊",svg:svgWrap('<defs><linearGradient id="sgW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc0ea"/><stop offset="1" stop-color="#1d6fb0"/></linearGradient></defs>'+
   '<rect width="1000" height="560" fill="#bfeaff"/><circle cx="850" cy="150" r="40" fill="#ffd84d"/>'+
   '<path d="M0 200 Q60 185 120 200 T240 200 T360 200 T480 200 T600 200 T720 200 T840 200 T960 200 T1080 200 V560 H0Z" fill="url(#sgW)"/>'+
   '<path d="M0 410 Q250 370 520 405 T1000 390 V560 H0Z" fill="#f1d9a0"/>'+
   '<g fill="none" stroke="#3fae6a" stroke-width="10" stroke-linecap="round"><path d="M120 405 q-20 -40 0 -80 q20 -40 0 -80"/><path d="M150 405 q20 -30 0 -60"/><path d="M820 395 q-20 -50 0 -100 q20 -40 0 -70"/></g>'+
   '<g fill="#ff8fb1"><circle cx="420" cy="420" r="10"/><circle cx="700" cy="412" r="8"/></g><path d="M560 425 l14 -26 l14 26z" fill="#ffab5e"/>'+
   '<g fill="#fff" opacity=".55"><circle cx="300" cy="300" r="7"/><circle cx="312" cy="270" r="5"/><circle cx="305" cy="245" r="3"/><circle cx="680" cy="330" r="6"/><circle cx="690" cy="300" r="4"/></g>')},
 {n:"Avaruus",e:"🚀",svg:svgWrap('<defs><radialGradient id="sgSp" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#3b2f7a"/><stop offset="1" stop-color="#120d33"/></radialGradient></defs>'+
   '<rect width="1000" height="560" fill="url(#sgSp)"/>'+
   '<g fill="#fff">'+[[80,140],[160,260],[240,170],[330,380],[420,150],[520,300],[600,190],[700,400],[760,140],[880,330],[940,200],[60,400],[300,250],[640,320],[960,420],[200,430],[470,420]].map(function(p,i){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i%3+1.5)+'" opacity="'+(.5+i%2*.4)+'"/>';}).join("")+'</g>'+
   '<circle cx="820" cy="190" r="58" fill="#f6f1c7"/><circle cx="845" cy="175" r="58" fill="url(#sgSp)"/>'+
   '<circle cx="230" cy="330" r="60" fill="#ff9f6e"/><ellipse cx="230" cy="330" rx="105" ry="22" fill="none" stroke="#ffd84d" stroke-width="9" transform="rotate(-18 230 330)"/>'+
   '<path d="M0 470 Q300 430 600 460 T1000 450 V560 H0Z" fill="#8a84b8"/><g fill="#6d679c"><ellipse cx="200" cy="490" rx="40" ry="10"/><ellipse cx="640" cy="485" rx="30" ry="8"/><ellipse cx="860" cy="500" rx="46" ry="11"/></g>')},
 {n:"Talvi",e:"❄️",svg:svgWrap('<defs><linearGradient id="sgWs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8d8f5"/><stop offset="1" stop-color="#eef6ff"/></linearGradient></defs>'+
   '<rect width="1000" height="560" fill="url(#sgWs)"/>'+
   '<path d="M0 310 Q200 230 420 300 T1000 280 V560 H0Z" fill="#f4f9ff"/><path d="M0 380 Q300 330 600 370 T1000 350 V560 H0Z" fill="#fff"/>'+
   '<g fill="#2f7a55">'+[[130,300],[190,310],[760,290],[820,300],[900,280]].map(function(p){return '<path d="M'+p[0]+' '+(p[1]-90)+' l-36 90 h72z"/><path d="M'+p[0]+' '+(p[1]-120)+' l-26 60 h52z"/>';}).join("")+'</g>'+
   '<g fill="#fff"><circle cx="560" cy="420" r="40"/><circle cx="560" cy="358" r="28"/></g><g fill="#2b2a4c"><circle cx="551" cy="352" r="3"/><circle cx="569" cy="352" r="3"/></g><path d="M560 360 l18 5 l-18 3z" fill="#ffab5e"/>'+
   '<g fill="#fff">'+[[90,160],[300,140],[420,200],[650,150],[880,180],[960,240],[240,230],[720,230]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5"/>';}).join("")+'</g>')}
];
function book(highlight){
  var have=A.album(),place=(A.albumPlace?A.albumPlace():[]).filter(function(p){return have[p.e];});
  var pk="sg.page."+A.child,page=0;try{page=+localStorage.getItem(pk)||0;}catch(e){}if(!(page>=0&&page<PAGES.length))page=0;
  var b=shell("Tarrakirja 📒",'<div class="sg-pages" id="sgPages"></div><div class="sg-scene" id="sgScene"></div><div class="sg-tray" id="sgTray"></div>'+
    '<div class="sg-row"><button class="sg-big alt" type="button" id="sgAll">📋 Kokoelma '+Object.keys(ownedBase(have)).length+' / '+CAT.count+'</button><button class="sg-big alt" type="button" id="sgBack">⬅ Takaisin</button></div>');
  b.classList.add("sg-bookbody");
  var scene=b.querySelector("#sgScene"),tray=b.querySelector("#sgTray"),saveT=0;
  function left(k){return (have[k]||0)-place.filter(function(p){return p.e===k;}).length;}
  function save(){clearTimeout(saveT);saveT=setTimeout(function(){if(A.placeSave)A.placeSave(place);},700);}
  /* tray order: newest gift first, then catalogue order, shiny ones next to their plain twin */
  function trayKeys(){var ks=[];CAT.all.forEach(function(x){[x.e,x.e+"*"].forEach(function(k){if(have[k])ks.push(k);});});
    Object.keys(have).forEach(function(k){if(ks.indexOf(k)<0&&have[k])ks.push(k);});
    if(highlight&&ks.indexOf(highlight)>0){ks.splice(ks.indexOf(highlight),1);ks.unshift(highlight);}return ks;}
  function draw(){
    scene.innerHTML=PAGES[page].svg;
    b.querySelector("#sgPages").innerHTML=PAGES.map(function(pg,i){var n=place.filter(function(p){return (p.p||0)===i;}).length;
      return '<button type="button" class="sg-pg" data-pg="'+i+'" aria-pressed="'+(i===page)+'">'+pg.e+' '+pg.n+(n?'<i>'+n+'</i>':"")+'</button>';}).join("");
    b.querySelectorAll("[data-pg]").forEach(function(x){x.onclick=function(){page=+x.dataset.pg;try{localStorage.setItem(pk,String(page));}catch(e){}A.tone(660,0,.1);A.say(PAGES[page].n);draw();};});
    place.forEach(function(p,i){if((p.p||0)!==page)return;var el=document.createElement("span");el.className="sg-pl"+(CAT.shiny(p.e)?" shiny":"");el.textContent=CAT.base(p.e);el.style.left=p.x+"%";el.style.top=p.y+"%";el.dataset.i=i;scene.appendChild(el);drag(el,p.e,i);});
    var keys=trayKeys();
    tray.innerHTML=keys.length?keys.map(function(k){var n=left(k);return '<span class="sg-tr'+(CAT.shiny(k)?" shiny":"")+(n?"":" used")+(k===highlight&&n?" new":"")+'" data-e="'+esc(k)+'">'+esc(CAT.base(k))+(n>1?'<i>'+n+'</i>':"")+'</span>';}).join(""):'<span class="sg-msg">Tarrat saat '+(A.gamesOn===false?"aikuisilta.":"peleistä.")+'</span>';
    tray.querySelectorAll(".sg-tr").forEach(function(el){if(left(el.dataset.e))drag(el,el.dataset.e,-1);else el.onclick=function(){A.say(nameOf(el.dataset.e)+" on jo kirjassa.");};});
  }
  /* press and move: a copy follows the finger; let go on the landscape to stick it, back on the tray to take it off */
  function drag(el,e,idx){
    el.addEventListener("pointerdown",function(ev){
      ev.preventDefault();var sx=ev.clientX,sy=ev.clientY,moved=false,ghost=null;
      function mv(m){
        if(!moved&&Math.abs(m.clientX-sx)+Math.abs(m.clientY-sy)<8)return;
        if(!moved){moved=true;ghost=document.createElement("span");ghost.className="sg-ghost"+(CAT.shiny(e)?" shiny":"");ghost.textContent=CAT.base(e);document.body.appendChild(ghost);if(idx>=0)el.style.opacity=".25";A.tone(700,0,.08);}
        ghost.style.left=m.clientX+"px";ghost.style.top=m.clientY+"px";
      }
      function up(u){
        document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);
        if(!moved){A.sOn();A.say((CAT.shiny(e)?"Kiiltotarra: ":"")+nameOf(e));el.classList.remove("wig");void el.offsetWidth;el.classList.add("wig");return;}
        ghost.remove();var r=scene.getBoundingClientRect(),inside=u.clientX>r.left&&u.clientX<r.right&&u.clientY>r.top&&u.clientY<r.bottom;
        var x=Math.round((u.clientX-r.left)/r.width*1000)/10,y=Math.round((u.clientY-r.top)/r.height*1000)/10;
        var full=idx<0&&place.filter(function(q){return (q.p||0)===page;}).length>=(A.pageMax||60);
        if(inside&&full){A.sOff();A.say("Tämä sivu on täynnä! Kokeile toista sivua.");draw();return;}
        if(inside){x=Math.max(4,Math.min(96,x));y=Math.max(6,Math.min(94,y));if(idx>=0){place[idx].x=x;place[idx].y=y;}else place.push({e:e,x:x,y:y,p:page});A.tone(880,0,.12);A.tone(1180,.08,.15);}
        else if(idx>=0){place.splice(idx,1);A.sOff();}
        save();draw();
      }
      document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);
    });
  }
  draw();
  b.querySelector("#sgAll").onclick=function(){clearTimeout(saveT);if(A.placeSave)A.placeSave(place);album();};
  b.querySelector("#sgBack").onclick=function(){clearTimeout(saveT);if(A.placeSave)A.placeSave(place);if(A.gamesOn===false)close();else menu(A);};
  var free=trayKeys().filter(function(k){return left(k);}).length;
  A.say(highlight&&left(highlight)?"Vedä "+nameOf(highlight)+" sormella maisemaan!":free?"Vedä tarroja sormella maisemaan.":Object.keys(have).length?"Tässä on sinun tarrakirjasi.":"Tässä on sinun tarrakirjasi.");
}
/* collection by theme; a full theme earns a medal */
function album(){
  var have=A.album(),own=ownedBase(have),n=Object.keys(own).length,medals=0;
  var html=CAT.themes.map(function(t){var got=t.list.filter(function(x){return own[x[0]];}).length,full=got===t.list.length;if(full)medals++;
    return '<div class="sg-th"><h3>'+t.e+' '+esc(t.n)+' <span>'+got+' / '+t.list.length+'</span>'+(full?' <b>🏅</b>':"")+'</h3><div class="sg-album">'+t.list.map(function(x){
      var c=(have[x[0]]||0)+(have[x[0]+"*"]||0),sh=have[x[0]+"*"];
      return c?'<button class="sg-st'+(sh?" shiny":"")+'" type="button" data-s="'+esc((sh?"Kiiltotarra: ":"")+x[1])+'">'+x[0]+(c>1?'<i>'+c+'</i>':"")+'</button>':'<button class="sg-st no" type="button" data-q="1">?</button>';}).join("")+'</div></div>';}).join("");
  var b=shell("Kokoelma "+n+" / "+CAT.count+(medals?" · 🏅 "+medals:""),html+'<button class="sg-big alt" type="button" id="sgBack">⬅ Tarrakirjaan</button>');
  b.style.justifyContent="flex-start";
  b.querySelectorAll("[data-s]").forEach(function(x){x.onclick=function(){A.sOn();A.say(x.dataset.s);};});
  b.querySelectorAll("[data-q]").forEach(function(x){x.onclick=function(){A.say("Tämä tarra puuttuu vielä.");};});
  b.querySelectorAll(".sg-th h3").forEach(function(h){h.onclick=function(){A.say(h.textContent.replace("🏅","").replace(/(\d+) \/ (\d+)/,"$1 tarraa $2:sta")+(h.querySelector("b")?". Sait mitalin!":""));};});
  b.querySelector("#sgBack").onclick=function(){book();};
  A.say(n?"Sinulla on "+n+(n===1?" tarra":" eri tarraa")+(medals?" ja "+medals+(medals===1?" mitali.":" mitalia."):"."):"Tarrat saat "+(A.gamesOn===false?"aikuisilta.":"peleistä."));
}

window.StarGames={menu:menu,book:function(api,hl){A=api;book(hl);},choose:function(api,o){A=api;choose(o||{});},nameOf:nameOf,stickers:CAT.count};
})();
