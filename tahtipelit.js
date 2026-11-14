/* Tähtipelit: minipelit, joihin lapsi käyttää tähtiään lapsi-tilassa (lapsi.html).
   Päälle ja pois taulun asetuksista: Lapsi-tila → Tähdet. Tämä tiedosto ladataan vain, kun pelit ovat päällä,
   joten sen voi poistaa ilman että lapsi-tila hajoaa.
   Lapsi-tila antaa olion api: {child, say, sOn, sOff, sFanfare, tone, balance(), plays(), max(), trickLevel(), spend(game), addSticker(e), album(), albumPlace(), placeSave(list), changed()} */
(function(){
"use strict";
var STICKERS=[["🦊","kettu"],["🐻","karhu"],["🐰","pupu"],["🦉","pöllö"],["🐸","sammakko"],["🦔","siili"],["🐿️","orava"],["🦌","peura"],
  ["🐟","kala"],["🐞","leppäkerttu"],["🦋","perhonen"],["🐝","mehiläinen"],["🐧","pingviini"],["🦁","leijona"],["🐘","norsu"],["🦒","kirahvi"],
  ["🐢","kilpikonna"],["🐬","delfiini"],["🦄","yksisarvinen"],["🐉","lohikäärme"],["🚒","paloauto"],["🚜","traktori"],["🚀","raketti"],["🚂","juna"],
  ["🚁","helikopteri"],["⛵","purjevene"],["🌈","sateenkaari"],["🍓","mansikka"]];
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
  '.sg-tray{display:flex;gap:8px;overflow-x:auto;width:100%;padding:6px 4px;min-height:76px;align-items:center;scrollbar-width:none}'+
  '.sg-tr{position:relative;flex:none;width:66px;height:66px;border-radius:18px;background:#fff;display:grid;place-items:center;font-size:40px;box-shadow:0 4px 0 rgba(43,42,76,.1);touch-action:none;cursor:grab}'+
  '.sg-tr.used{opacity:.35}.sg-tr.new{animation:sgpulse .9s ease infinite;border:3px solid #ffd84d}'+
  '.sg-tr i{position:absolute;right:2px;bottom:0;font-style:normal;font-size:13px;font-weight:700;background:#ffd84d;border-radius:999px;padding:0 6px}'+
  '.sg-ghost{position:fixed;z-index:80;font-size:72px;line-height:1;transform:translate(-50%,-60%) scale(1.1);pointer-events:none;filter:drop-shadow(0 8px 8px rgba(0,0,0,.25))}'+
  '.sg-pl.wig{animation:sgwig .5s ease}@keyframes sgwig{25%{transform:translate(-50%,-50%) rotate(-12deg)}75%{transform:translate(-50%,-50%) rotate(12deg)}}'+
  '.sg-tr.wig{animation:sgpop .4s}'+
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
  root.innerHTML='<div class="sg-top"><h2>'+title+'</h2><span class="sg-bal">⭐ <span id="sgBal">'+A.balance()+'</span></span><button class="sg-x" type="button" aria-label="Sulje">✕</button></div><div class="sg-body">'+body+'</div>';
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
      '<button class="sg-card" type="button" data-g="album"><span class="e">📒</span><b>Tarrakirja</b><span class="c">'+Object.keys(A.album()).length+' / '+STICKERS.length+'</span></button>'+
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

/* ---------- reward: a sticker, new ones first ---------- */
function reward(){
  var have=A.album(),fresh=STICKERS.filter(function(s){return !have[s[0]];}),pool=fresh.length?fresh:STICKERS,s=pool[rnd(pool.length)];
  A.addSticker(s[0]);
  var b=shell("Sait tarran! 🎉",'<div class="sg-prize">'+s[0]+'</div><div style="font-size:34px;font-weight:700">'+esc(s[1][0].toUpperCase()+s[1].slice(1))+(fresh.length?" · uusi!":"")+'</div>'+
    '<div class="sg-row"><button class="sg-big alt" type="button" data-a="album">📒 Liimaa tarrakirjaan</button><button class="sg-big" type="button" data-a="menu">⭐ Valmis</button></div>');
  A.sFanfare();T(function(){A.say("Sait tarran: "+s[1]+"!"+(fresh.length?" Se on uusi!":""));},600);
  b.querySelector('[data-a="album"]').onclick=function(){book(s[0]);};b.querySelector('[data-a="menu"]').onclick=function(){menu(A);};
}
function nameOf(e){var x=STICKERS.filter(function(s){return s[0]===e;})[0];return x?x[1]:"";}

/* ---------- sticker book: a landscape where stickers are dragged and left where the child wants ---------- */
var SCENE='<svg class="sg-bg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+
  '<defs><linearGradient id="sgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e4f6ff"/></linearGradient>'+
  '<linearGradient id="sgSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc4f0"/><stop offset="1" stop-color="#3a9fd8"/></linearGradient></defs>'+
  '<rect width="1000" height="560" fill="url(#sgSky)"/><circle cx="860" cy="160" r="46" fill="#ffd84d"/><circle cx="860" cy="160" r="62" fill="#ffd84d" opacity=".25"/>'+
  '<g fill="#fff" opacity=".9"><ellipse cx="180" cy="170" rx="70" ry="24"/><ellipse cx="230" cy="154" rx="46" ry="24"/><ellipse cx="560" cy="140" rx="60" ry="20"/><ellipse cx="600" cy="128" rx="36" ry="20"/></g>'+
  '<path d="M0 300 Q160 200 330 280 T680 250 T1000 270 V560 H0Z" fill="#a8dd8f"/>'+
  '<path d="M0 360 Q250 300 520 350 T1000 330 V560 H0Z" fill="#7cc66b"/>'+
  '<path d="M0 420 Q140 380 300 410 Q420 440 380 560 H0Z" fill="url(#sgSea)"/>'+
  '<path d="M560 560 Q600 450 700 400 T1000 360 V400 Q820 420 760 470 T700 560Z" fill="#e8d4a8"/>'+
  '<g><rect x="842" y="262" width="12" height="44" fill="#9a6a3f"/><circle cx="848" cy="250" r="34" fill="#4fae5a"/><rect x="452" y="296" width="10" height="38" fill="#9a6a3f"/><circle cx="457" cy="284" r="28" fill="#5cbb63"/></g>'+
  '<g fill="#ff8fb1"><circle cx="480" cy="470" r="6"/><circle cx="520" cy="500" r="6"/><circle cx="900" cy="500" r="6"/></g><g fill="#fff3a3"><circle cx="440" cy="510" r="6"/><circle cx="960" cy="470" r="6"/></g>'+
  '</svg>';
function book(highlight){
  var have=A.album(),place=(A.albumPlace?A.albumPlace():[]).filter(function(p){return have[p.e];});
  var b=shell("Tarrakirja 📒",'<div class="sg-scene" id="sgScene">'+SCENE+'</div><div class="sg-tray" id="sgTray"></div>'+
    '<div class="sg-row"><button class="sg-big alt" type="button" id="sgAll">📋 Kokoelma '+Object.keys(have).length+' / '+STICKERS.length+'</button><button class="sg-big alt" type="button" id="sgBack">⬅ Takaisin</button></div>');
  b.classList.add("sg-bookbody");
  var scene=b.querySelector("#sgScene"),tray=b.querySelector("#sgTray"),saveT=0;
  function left(e){return (have[e]||0)-place.filter(function(p){return p.e===e;}).length;}
  function save(){clearTimeout(saveT);saveT=setTimeout(function(){if(A.placeSave)A.placeSave(place);},700);}
  function draw(){
    scene.querySelectorAll(".sg-pl").forEach(function(x){x.remove();});
    place.forEach(function(p,i){var el=document.createElement("span");el.className="sg-pl";el.textContent=p.e;el.style.left=p.x+"%";el.style.top=p.y+"%";el.dataset.i=i;scene.appendChild(el);drag(el,p.e,i);});
    var keys=STICKERS.map(function(s){return s[0];}).filter(function(e){return have[e];});
    tray.innerHTML=keys.length?keys.map(function(e){var n=left(e);return '<span class="sg-tr'+(n?"":" used")+(e===highlight&&n?" new":"")+'" data-e="'+e+'">'+e+(n>1?'<i>'+n+'</i>':"")+'</span>';}).join(""):'<span class="sg-msg">Tarrat saat peleistä.</span>';
    tray.querySelectorAll(".sg-tr").forEach(function(el){if(left(el.dataset.e))drag(el,el.dataset.e,-1);else el.onclick=function(){A.say(nameOf(el.dataset.e)+" on jo kirjassa.");};});
  }
  /* press and move: a copy follows the finger; let go on the landscape to stick it, back on the tray to take it off */
  function drag(el,e,idx){
    el.addEventListener("pointerdown",function(ev){
      ev.preventDefault();var sx=ev.clientX,sy=ev.clientY,moved=false,ghost=null;
      function mv(m){
        if(!moved&&Math.abs(m.clientX-sx)+Math.abs(m.clientY-sy)<8)return;
        if(!moved){moved=true;ghost=document.createElement("span");ghost.className="sg-ghost";ghost.textContent=e;document.body.appendChild(ghost);if(idx>=0)el.style.opacity=".25";A.tone(700,0,.08);}
        ghost.style.left=m.clientX+"px";ghost.style.top=m.clientY+"px";
      }
      function up(u){
        document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);
        if(!moved){A.sOn();A.say(nameOf(e));el.classList.remove("wig");void el.offsetWidth;el.classList.add("wig");return;}
        ghost.remove();var r=scene.getBoundingClientRect(),inside=u.clientX>r.left&&u.clientX<r.right&&u.clientY>r.top&&u.clientY<r.bottom;
        var x=Math.round((u.clientX-r.left)/r.width*1000)/10,y=Math.round((u.clientY-r.top)/r.height*1000)/10;
        if(inside){x=Math.max(4,Math.min(96,x));y=Math.max(6,Math.min(94,y));if(idx>=0){place[idx].x=x;place[idx].y=y;}else place.push({e:e,x:x,y:y});A.tone(880,0,.12);A.tone(1180,.08,.15);}
        else if(idx>=0){place.splice(idx,1);A.sOff();}
        save();draw();
      }
      document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);
    });
  }
  draw();
  b.querySelector("#sgAll").onclick=album;b.querySelector("#sgBack").onclick=function(){clearTimeout(saveT);if(A.placeSave)A.placeSave(place);menu(A);};
  var free=STICKERS.filter(function(s){return have[s[0]]&&left(s[0]);}).length;
  A.say(highlight&&left(highlight)?"Vedä "+nameOf(highlight)+" sormella maisemaan!":free?"Vedä tarroja sormella maisemaan.":Object.keys(have).length?"Tässä on sinun tarrakirjasi.":"Tarrat saat peleistä.");
}
function album(){
  var have=A.album(),n=Object.keys(have).length;
  var b=shell("Kokoelma "+n+" / "+STICKERS.length,'<div class="sg-album">'+STICKERS.map(function(s){var c=have[s[0]]||0;
    return c?'<button class="sg-st" type="button" data-s="'+esc(s[1])+'">'+s[0]+(c>1?'<i>'+c+'</i>':"")+'</button>':'<button class="sg-st no" type="button" data-q="1">?</button>';}).join("")+'</div>'+
    '<button class="sg-big alt" type="button" id="sgBack">⬅ Tarrakirjaan</button>');
  b.style.justifyContent="flex-start";
  b.querySelectorAll("[data-s]").forEach(function(x){x.onclick=function(){A.sOn();A.say(x.dataset.s);};});
  b.querySelectorAll("[data-q]").forEach(function(x){x.onclick=function(){A.say("Tämä tarra puuttuu vielä.");};});
  b.querySelector("#sgBack").onclick=function(){book();};
  A.say(n?"Sinulla on "+n+(n===1?" tarra.":" tarraa."):"Tarrat saat peleistä.");
}

window.StarGames={menu:menu,stickers:STICKERS.length};
})();
