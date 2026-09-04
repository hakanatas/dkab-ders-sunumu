/* ══════════════════════════════════════════════════════════════
   v2 — DİNAMİK / ETKİLEŞİM KATMANI
   Orijinal işlevleri bozmadan üzerine sarar: showSlide, sinifSec,
   scaleAndFont, playMario, temizSerialize.
   ══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var $ = function(id){ return document.getElementById(id); };
var LS = { get:function(k,d){ try{ var v=localStorage.getItem(k); return v===null?d:v; }catch(_){ return d; } },
           set:function(k,v){ try{ localStorage.setItem(k,v); }catch(_){} } };
function metin(el){ return el ? (el.textContent||'').replace(/\s+/g,' ').trim() : ''; }

/* ── Bildirim (toast) ── */
var toastT=null;
window.v2Toast = function(msg, sure){
  var t=$('v2-toast'); if(!t) return;
  t.textContent=msg; t.classList.add('acik');
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('acik'); }, sure||2200);
};

/* ── Ses: sessiz modu (M) ── */
var sessiz = LS.get('dkab_sessiz','0')==='1';
function sesButonGuncelle(){ var b=$('ses-btn'); if(b){ b.innerHTML='<span class="nb-ico">'+(sessiz?'🔇':'🔊')+'</span>'; b.classList.toggle('aktif',sessiz); } }
window.sesAcKapa = function(){ sessiz=!sessiz; LS.set('dkab_sessiz',sessiz?'1':'0'); sesButonGuncelle(); v2Toast(sessiz?'🔇 Sesler kapatıldı':'🔊 Sesler açık'); };
if(typeof playMario==='function'){ var _pm=playMario; window.playMario=function(){ if(!sessiz) _pm(); }; }
if(typeof tikSes==='function'){ var _ts=tikSes; window.tikSes=function(){ if(!sessiz) _ts(); }; }
function sesYanlis(){ if(sessiz||typeof note!=='function') return; try{ AC.resume(); note(196,0,.14,.16); note(147,.13,.26,.16); }catch(_){} }
function sesAlarm(){ if(sessiz||typeof note!=='function') return; try{ AC.resume(); [0,.22,.44].forEach(function(t){ note(880,t,.16,.22); }); note(1175,.7,.45,.22); }catch(_){} }
function sesTik(){ if(sessiz||typeof note!=='function') return; try{ note(700+Math.random()*300,0,.03,.05); }catch(_){} }

/* ── Konfeti ── */
var konfetiParca=[], konfetiRAF=null;
window.konfeti = function(x, y, adet){
  var c=$('konfeti'); if(!c) return;
  c.width=innerWidth; c.height=innerHeight; c.style.display='block';
  var renkler=['#2457e6','#7a3ae8','#158a45','#f2a23a','#ff5c6c','#22b8f0','#ffd23f'];
  x = (x===undefined)? innerWidth/2 : x; y = (y===undefined)? innerHeight*0.45 : y;
  for(var i=0;i<(adet||110);i++){
    var a=Math.random()*Math.PI*2, h=6+Math.random()*9;
    konfetiParca.push({x:x,y:y,vx:Math.cos(a)*h,vy:Math.sin(a)*h-4,g:.28,w:6+Math.random()*6,h:4+Math.random()*5,r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,c:renkler[i%renkler.length],t:60+Math.random()*40});
  }
  if(!konfetiRAF) konfetiCiz();
};
function konfetiCiz(){
  var c=$('konfeti'), ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  konfetiParca=konfetiParca.filter(function(p){ return p.t>0 && p.y<c.height+20; });
  konfetiParca.forEach(function(p){
    p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.vx*=.985; p.r+=p.vr; p.t--;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.globalAlpha=Math.min(1,p.t/25);
    ctx.fillStyle=p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
  });
  if(konfetiParca.length){ konfetiRAF=requestAnimationFrame(konfetiCiz); }
  else { konfetiRAF=null; c.style.display='none'; }
}

/* ── Sahne ölçekleme: yüzen alt çubuğa yer bırak ── */
window.scaleAndFont = function(){
  var vw=innerWidth, ust=6, alt=(document.fullscreenElement && document.body.classList.contains('ui-gizli'))?6:68;
  var vh=innerHeight-ust-alt;
  var sc=Math.min(vw/1280, vh/720);
  STAGE.style.transform='scale('+sc+')';
  STAGE.style.transformOrigin='top left';
  STAGE.style.left=Math.max(0,(vw-1280*sc)/2)+'px';
  STAGE.style.top=(ust+Math.max(0,(vh-720*sc)/2))+'px';
  STAGE.style.fontSize=baseFontSize+'px';
};
window.addEventListener('resize', scaleAndFont);

/* ── Slayt değişimi sarmalayıcı ── */
var _showSlide = showSlide;
window.showSlide = function(n){
  var onceki=cur;
  _showSlide(n);
  var geri = (cur<onceki && !(onceki===TOTAL-1 && cur===0)) || (onceki===0 && cur===TOTAL-1);
  STAGE.dataset.dir = geri ? 'prev' : 'next';
  slaytDegisti();
};
window.s5Git = function(id){ // 5. sınıf içindekiler tıklamaları (orijinalde tanımsızdı)
  for(var i=0;i<slides.length;i++){ if(slides[i].id===id){ showSlide(i); return; } }
  v2Toast('Slayt bulunamadı: '+id);
};
function slaytDegisti(){
  if(aktifSinif) LS.set('dkab_son_'+aktifSinif, String(cur));
  try{ history.replaceState(null,'','#'+aktifSinif+'/'+(cur+1)); }catch(_){}
  konuAktifIsaretle();
  var s=slides[cur]; if(s){ var etk=s.querySelector('.tb-dk'); if(etk) etk.title='Tıkla: bu etkinlik için geri sayım başlat'; }
}

/* ── Sınıf seçimi / ana ekran sarmalayıcıları ── */
var _sinifSec = sinifSec;
window.sinifSec = function(sinif, hedef){
  _sinifSec(sinif);
  if(sinif===5||sinif===6){
    konuListesiKur(sinif);
    if(typeof hedef==='number' && hedef>=0 && hedef<TOTAL) _showSlide(hedef);
    STAGE.dataset.dir='next';
    slaytDegisti();
    dyDugmeleriKur();
    setTimeout(scaleAndFont,0);
    v2Toast(sinif+'. Sınıf sunumu · '+TOTAL+' slayt · K: konular · ?: kısayollar', 2600);
  }
};
window.devamEt = function(sinif){
  var n=parseInt(LS.get('dkab_son_'+sinif,'0'),10)||0;
  sinifSec(sinif, n);
};
var _anaGeri = anaEkranaGeri;
window.anaEkranaGeri = function(){
  _anaGeri(); konuKapat(); lazerKapat(); spotKapat(); geriSayimMenuKapat();
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(_){}
  anaEkranGuncelle();
};
function anaEkranGuncelle(){
  [5,6].forEach(function(k){
    var say=document.querySelectorAll('#stage .slide[data-sinif="'+k+'"]').length;
    var r=document.querySelector('[data-slayt-sayi="'+k+'"]'); if(r) r.textContent=say+' slayt';
    var d=document.querySelector('[data-devam="'+k+'"]');
    var son=parseInt(LS.get('dkab_son_'+k,'-1'),10);
    if(d){ if(son>0){ d.classList.add('goster'); d.textContent='▶ Kaldığın yer: '+(son+1)+'. slayt'; } else d.classList.remove('goster'); }
  });
  var ts=document.querySelector('[data-toplam-slayt]'); if(ts) ts.textContent=document.querySelectorAll('#stage .slide').length;
  var te=document.querySelector('[data-toplam-etkinlik]'); if(te) te.textContent=document.querySelectorAll('#stage .soru-item,#stage .etkinlik-kart,#stage .bd-row,#stage .dy-list').length;
  var tk=document.querySelector('[data-toplam-kavram]'); if(tk) tk.textContent=document.querySelectorAll('#stage .kcard').length;
}

/* ══════════════════════════════════════════════════════════════
   KONULAR ÇEKMECESİ
   ══════════════════════════════════════════════════════════════ */
var UNITE_ADLARI = {
  5:['Allah İnancı','Namaz','Kur\'an-ı Kerim','Peygamber Kıssaları','Mimarîmizde Dinî Motifler'],
  6:['Peygamber ve İlahi Kitap İnancı','Ramazan ve Oruç','Ahlaki Davranışlar','Hz. Muhammed (sav)','Kültürümüzdeki Dinî Motifler']
};
function slaytTuru(s){
  var t=(metin(s.querySelector('.sn-txt'))||'').toLocaleUpperCase('tr');
  var ico='📖';
  if(/ETKİNLİK|ETKINLIK/.test(t)) ico='✏️';
  else if(/KONTROL/.test(t)) ico='✅';
  else if(/ÖLÇME|OLCME|DEĞERLENDİRME/.test(t)) ico='📝';
  else if(/KAVRAM/.test(t)) ico='🔑';
  else if(/GENELLEME|ÖĞRENDİK|KAPANIŞ/.test(t)) ico='📊';
  else if(/PLAN/.test(t)) ico='🗓️';
  else if(/İÇİNDEKİLER|KAZANIMLAR|ÇIKTI/.test(t)) ico='📚';
  else if(/BAŞLARKEN|GİRİŞ|KÖPRÜ/.test(t)) ico='🔎';
  else if(/FARKLILAŞTIRMA/.test(t)) ico='🔀';
  else if(/SUNUM|KAPAK|ÜNİTE/.test(t)) ico='📌';
  else if(/AYET|SURE|HADİS/.test(t)) ico='📜';
  return {ico:ico, tur:t.toLowerCase().replace(/(^|\s)\S/g,function(c){return c.toLocaleUpperCase('tr');})};
}
var kcOgeler=[];
function konuListesiKur(sinif){
  var liste=$('kc-liste'); if(!liste) return;
  liste.innerHTML=''; kcOgeler=[];
  $('kc-baslik-metin').textContent=sinif+'. Sınıf · Konular';
  $('kc-alt-metin').textContent=TOTAL+' slayt · tıkla ve git';
  var adlar=UNITE_ADLARI[sinif]||[];
  var uniteNo=0, grup=null, grupSayac=null;
  function yeniGrup(no, ad){
    var b=document.createElement('div'); b.className='kc-unite';
    b.innerHTML='<span class="kc-u-no">'+(no?no+'. ÜNİTE':'GİRİŞ')+'</span><span class="kc-u-ad">'+ad+'</span><span class="kc-u-sayi"></span><span class="kc-u-ok">▾</span>';
    b.onclick=function(){ b.classList.toggle('kapali'); };
    liste.appendChild(b);
    grup=document.createElement('div'); grup.className='kc-grup'; liste.appendChild(grup);
    grupSayac=b.querySelector('.kc-u-sayi'); grupSayac._n=0;
  }
  slides.forEach(function(s,i){
    var m=s.id.match(/-u(\d+)-(kapak|program)$/);
    if(m && parseInt(m[1],10)!==uniteNo){ uniteNo=parseInt(m[1],10); yeniGrup(uniteNo, adlar[uniteNo-1]||''); }
    if(!grup) yeniGrup(0, 'Kapak ve içindekiler');
    var tur=slaytTuru(s);
    var baslik=metin(s.querySelector('.title'))||metin(s.querySelector('.hero'))||metin(s.querySelector('.tb-kaz'))||('Slayt '+(i+1));
    var kod=(metin(s.querySelector('.tb-code')).match(/DKAB\.\d\.\d\.\d|\b\d\.\d\.\d\b/)||[''])[0];
    var pg=(metin(s.querySelector('.tb-pg')).match(/S\.\s*[\d–-]+/)||[''])[0];
    var o=document.createElement('div'); o.className='kc-oge'; o.dataset.i=i;
    o.innerHTML='<span class="kc-ico">'+tur.ico+'</span><span class="kc-metin"><span class="kc-ad"></span><span class="kc-tur"></span></span><span class="kc-no">'+(i+1)+'</span>';
    o.querySelector('.kc-ad').textContent=baslik;
    o.querySelector('.kc-tur').textContent=[tur.tur, kod.replace('DKAB.',''), pg].filter(Boolean).join(' · ');
    o.title=baslik; o._ara=(baslik+' '+tur.tur+' '+kod+' '+pg+' '+metin(s).slice(0,400)).toLocaleLowerCase('tr');
    o.onclick=function(){ showSlide(i); konuKapat(); };
    grup.appendChild(o); kcOgeler.push(o); grupSayac._n++; grupSayac.textContent=grupSayac._n;
  });
}
function konuAktifIsaretle(){
  var aktif=null;
  kcOgeler.forEach(function(o){ var on=parseInt(o.dataset.i,10)===cur; o.classList.toggle('aktif',on); if(on) aktif=o; });
  if(aktif && $('konu-cekmece').classList.contains('acik')){
    var u=aktif.parentElement && aktif.parentElement.previousElementSibling; if(u) u.classList.remove('kapali');
    aktif.scrollIntoView({block:'center',behavior:'smooth'});
  }
}
window.konuFiltre = function(q){
  q=(q||'').toLocaleLowerCase('tr').trim();
  kcOgeler.forEach(function(o){ o.classList.toggle('gizli', !!q && o._ara.indexOf(q)<0); });
  document.querySelectorAll('#kc-liste .kc-unite').forEach(function(u){
    var g=u.nextElementSibling; var gor=g && g.querySelector('.kc-oge:not(.gizli)');
    u.style.display=gor?'':'none'; if(q) u.classList.remove('kapali');
  });
};
window.konuAcKapa = function(){ if($('konu-cekmece').classList.contains('acik')) konuKapat(); else konuAc(); };
window.konuAc = function(){
  if(!aktifSinif||!TOTAL){ v2Toast('Önce bir sınıf seç'); return; }
  $('konu-cekmece').classList.add('acik'); $('konu-perde').classList.add('acik');
  var b=$('konu-btn'); if(b) b.classList.add('aktif');
  setTimeout(function(){ konuAktifIsaretle(); var a=$('kc-ara'); if(a && matchMedia('(hover:hover)').matches) a.focus(); },80);
};
window.konuKapat = function(){
  var c=$('konu-cekmece'); if(!c) return;
  c.classList.remove('acik'); $('konu-perde').classList.remove('acik');
  var b=$('konu-btn'); if(b) b.classList.remove('aktif');
};

/* ══════════════════════════════════════════════════════════════
   GERİ SAYIM
   ══════════════════════════════════════════════════════════════ */
var gs={toplam:0,kalan:0,iv:null,calisiyor:false};
var GS_CEVRE=2*Math.PI*56;
function gsYaz(){
  var m=Math.floor(gs.kalan/60), s=gs.kalan%60;
  $('gs-sure').textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  var oran=gs.toplam?gs.kalan/gs.toplam:0;
  $('gs-on').style.strokeDashoffset=String(GS_CEVRE*(1-oran));
  var k=$('gsayim'); k.classList.toggle('uyari', gs.kalan>0 && gs.kalan<=Math.max(30,gs.toplam*.15));
  k.classList.toggle('bitti', gs.kalan===0 && gs.toplam>0);
}
window.geriSayimBaslat = function(dk, etiket){
  var sn=Math.round(dk*60); if(!sn||sn<=0) return;
  clearInterval(gs.iv); gs.toplam=sn; gs.kalan=sn; gs.calisiyor=false;
  $('gs-on').style.strokeDasharray=String(GS_CEVRE);
  $('gs-etiket').textContent=etiket||('Geri sayım · '+dk+' dk');
  $('gsayim').classList.add('acik'); $('gsayim').classList.remove('bitti');
  geriSayimMenuKapat(); gsYaz(); geriSayimBasDur();
};
window.geriSayimBasDur = function(){
  if(gs.kalan<=0 && gs.toplam){ gs.kalan=gs.toplam; $('gsayim').classList.remove('bitti'); }
  gs.calisiyor=!gs.calisiyor;
  $('gs-basdur').textContent=gs.calisiyor?'⏸':'▶';
  clearInterval(gs.iv);
  if(gs.calisiyor){
    gs.iv=setInterval(function(){
      gs.kalan--; if(gs.kalan<=0){ gs.kalan=0; clearInterval(gs.iv); gs.calisiyor=false; $('gs-basdur').textContent='▶'; gsYaz(); gsBitti(); return; }
      gsYaz();
    },1000);
  }
};
function gsBitti(){
  sesAlarm();
  var f=$('gs-flash'); f.classList.remove('acik'); void f.offsetWidth; f.classList.add('acik');
  v2Toast('⏰ Süre doldu!', 3000);
  setTimeout(function(){ f.classList.remove('acik'); },2200);
}
window.geriSayimEkle = function(sn){ gs.kalan+=sn; gs.toplam=Math.max(gs.toplam,gs.kalan); $('gsayim').classList.remove('bitti'); gsYaz(); };
window.geriSayimSifirla = function(){ clearInterval(gs.iv); gs.calisiyor=false; gs.kalan=gs.toplam; $('gs-basdur').textContent='▶'; $('gsayim').classList.remove('bitti'); gsYaz(); };
window.geriSayimKapat = function(){ clearInterval(gs.iv); gs.calisiyor=false; $('gsayim').classList.remove('acik','bitti'); $('gs-basdur').textContent='▶'; };
window.geriSayimMenu = function(e){ if(e) e.stopPropagation(); var m=$('gs-menu'); m.classList.toggle('acik'); if(m.classList.contains('acik')) setTimeout(function(){ $('gs-ozel').focus(); },50); };
window.geriSayimMenuKapat = function(){ var m=$('gs-menu'); if(m) m.classList.remove('acik'); };
window.geriSayimOzel = function(){ var v=parseFloat($('gs-ozel').value); if(v>0) geriSayimBaslat(v); };
document.addEventListener('click', function(e){ var m=$('gs-menu'); if(m && m.classList.contains('acik') && !e.target.closest('#gs-menu') && !e.target.closest('#gs-btn')) geriSayimMenuKapat(); });
// Süre rozetinden dakika çıkar: "⏱ 10 dk", "⏱ 5–10 dk", "⏱ 12–24 dk" (ders dakikası aralığı)
function sureRozetiDk(t){
  var m=t.match(/(\d+)\s*[–\-]\s*(\d+)\s*dk/i);
  if(m){ var a=parseInt(m[1],10), b=parseInt(m[2],10); return Math.max(1, b-a); }
  m=t.match(/(\d+)\s*dk/i); if(m) return parseInt(m[1],10);
  return 0;
}
// Geri sayım kutusunu sürükle
(function(){
  var k=$('gsayim'); if(!k) return; var px,py,x0,y0,tas=false;
  k.addEventListener('pointerdown',function(e){ if(e.target.closest('button')) return; tas=true; px=e.clientX; py=e.clientY; var r=k.getBoundingClientRect(); x0=r.left; y0=r.top; k.setPointerCapture(e.pointerId); });
  k.addEventListener('pointermove',function(e){ if(!tas) return; k.style.right='auto'; k.style.left=(x0+e.clientX-px)+'px'; k.style.top=(y0+e.clientY-py)+'px'; });
  k.addEventListener('pointerup',function(){ tas=false; }); k.addEventListener('pointercancel',function(){ tas=false; });
})();

/* ══════════════════════════════════════════════════════════════
   ETKİLEŞİMLİ SORULAR: çoktan seçmeli şık / doğru-yanlış düğmeleri / süre rozeti
   ══════════════════════════════════════════════════════════════ */
function dyDugmeleriKur(){
  document.querySelectorAll('#stage .dy-list .dy-row').forEach(function(r){
    if(r.querySelector('.dy-btns')) return;
    var b=document.createElement('span'); b.className='dy-btns';
    b.innerHTML='<b data-c="d" title="Doğru">D</b><b data-c="y" title="Yanlış">Y</b>';
    r.appendChild(b);
  });
}
STAGE.addEventListener('click', function(e){
  if(typeof duzenlemeAktif!=='undefined' && duzenlemeAktif) return;
  // Çoktan seçmeli şık
  var sik=e.target.closest('.mc-opts span');
  if(sik){
    e.stopPropagation(); e.preventDefault();
    var soru=sik.closest('.soru-item');
    if(sik.classList.contains('mc-ok')||sik.classList.contains('mc-hata')) return;
    if(sik.classList.contains('mc-d')){
      sik.classList.add('mc-ok'); if(soru) soru.classList.add('acik');
      playMario(); var r=sik.getBoundingClientRect(); konfeti(r.left+r.width/2, r.top+r.height/2, 70);
    } else {
      sik.classList.add('mc-hata'); sesYanlis();
      setTimeout(function(){ if(soru){ soru.classList.add('acik'); var d=soru.querySelector('.mc-opts .mc-d'); if(d) d.classList.add('mc-ok'); } }, 650);
    }
    return;
  }
  // Doğru / Yanlış düğmesi
  var dyb=e.target.closest('.dy-btns b');
  if(dyb){
    e.stopPropagation(); e.preventDefault();
    var row=dyb.closest('.dy-row'); if(!row) return;
    var yanlisMi=row.classList.contains('dy-y'), secim=dyb.dataset.c;
    row.querySelectorAll('.dy-btns b').forEach(function(x){ x.classList.remove('sec'); }); dyb.classList.add('sec');
    row.classList.remove('dy-dogru','dy-yanlis'); void row.offsetWidth;
    var dogru=(secim==='y')===yanlisMi;
    row.classList.add(dogru?'dy-dogru':'dy-yanlis');
    if(dogru){ playMario(); var rr=dyb.getBoundingClientRect(); konfeti(rr.left, rr.top, 40); } else sesYanlis();
    return;
  }
  // Süre rozeti → geri sayım
  var dk=e.target.closest('.tb-dk');
  if(dk){
    var n=sureRozetiDk(metin(dk));
    if(n>0){ e.stopPropagation(); var etiket=metin(slides[cur] && slides[cur].querySelector('.sn-txt'))||'Etkinlik'; geriSayimBaslat(n, etiket+' · '+n+' dk'); v2Toast('⏳ '+n+' dakikalık geri sayım başladı'); }
    return;
  }
}, true);

/* ══════════════════════════════════════════════════════════════
   RASTGELE ÖĞRENCİ SEÇİCİ
   ══════════════════════════════════════════════════════════════ */
var sc={kaynak:LS.get('dkab_secici_kaynak','liste'), secilen:[], donuyor:false};
function seciciKaynaklar(){
  var k=[]; try{ var d=loadOgr(); Object.keys(d).forEach(function(key){ if(key.indexOf('isimler_')===0 && Array.isArray(d[key]) && d[key].length) k.push({id:key, ad:key.slice(8), isimler:d[key]}); }); }catch(_){}
  var liste=LS.get('dkab_secici_liste','').split('\n').map(function(s){return s.trim();}).filter(Boolean);
  k.push({id:'liste', ad:'Kendi listem', isimler:liste});
  return k;
}
function seciciIsimler(){ var k=seciciKaynaklar(); var b=null; k.forEach(function(x){ if(x.id===sc.kaynak) b=x; }); if(!b) b=k[0]; sc.kaynak=b.id; return b.isimler.slice(); }
function seciciCiz(){
  var kk=$('sc-kaynak'); kk.innerHTML='';
  seciciKaynaklar().forEach(function(k){
    var c=document.createElement('span'); c.className='sc-chip'+(k.id===sc.kaynak?' sec':''); c.textContent=(k.id==='liste'?'✏️ ':'🏫 ')+k.ad+' ('+k.isimler.length+')';
    c.onclick=function(){ sc.kaynak=k.id; LS.set('dkab_secici_kaynak',k.id); sc.secilen=[]; seciciCiz(); $('sc-secilenler').innerHTML=''; $('sc-gruplar').innerHTML=''; };
    kk.appendChild(c);
  });
  $('sc-liste').value=LS.get('dkab_secici_liste','');
  var n=seciciIsimler().length;
  $('sc-alt').textContent=n?(n+' öğrenci · '+sc.secilen.length+' seçildi'):'Liste boş — aşağıdan isim ekle veya Öğrenci Takibi\'nden şube seç';
}
window.seciciAc = function(){ if(typeof closeMenu==='function') closeMenu(); seciciCiz(); $('secici-modal').classList.add('open'); };
window.seciciKapat = function(){ $('secici-modal').classList.remove('open'); };
window.seciciListeKaydet = function(v){ LS.set('dkab_secici_liste', v); if(sc.kaynak==='liste'){ var n=v.split('\n').filter(function(s){return s.trim();}).length; $('sc-alt').textContent=n+' öğrenci'; var ch=$('sc-kaynak').querySelector('.sc-chip.sec'); if(ch) ch.textContent='✏️ Kendi listem ('+n+')'; } };
window.seciciSifirla = function(){ sc.secilen=[]; $('sc-secilenler').innerHTML=''; $('sc-gruplar').innerHTML=''; var i=$('sc-isim'); i.textContent='Hazır mısın?'; i.className='sc-isim'; seciciCiz(); };
window.seciciSec = function(){
  if(sc.donuyor) return;
  var hepsi=seciciIsimler(); if(!hepsi.length){ v2Toast('Önce isim listesi ekle'); $('sc-liste').closest('details').open=true; $('sc-liste').focus(); return; }
  var havuz=$('sc-tekrarsiz').checked ? hepsi.filter(function(x){ return sc.secilen.indexOf(x)<0; }) : hepsi;
  if(!havuz.length){ v2Toast('Herkes seçildi — sıfırla veya tekrarı aç'); return; }
  var kazanan=havuz[Math.floor(Math.random()*havuz.length)];
  var el=$('sc-isim'); el.className='sc-isim donuyor'; sc.donuyor=true; $('sc-sec').disabled=true;
  var adim=0, toplam=22+Math.floor(Math.random()*8);
  (function dongu(){
    el.textContent=hepsi[Math.floor(Math.random()*hepsi.length)]; sesTik(); adim++;
    if(adim<toplam){ setTimeout(dongu, 40+adim*adim*0.9); }
    else {
      el.textContent=kazanan; el.className='sc-isim secildi'; sc.donuyor=false; $('sc-sec').disabled=false;
      sc.secilen.push(kazanan); playMario();
      var r=el.getBoundingClientRect(); konfeti(r.left+r.width/2, r.top+r.height/2, 120);
      var s=$('sc-secilenler'); var b=document.createElement('span'); b.textContent=kazanan; s.appendChild(b);
      $('sc-alt').textContent=hepsi.length+' öğrenci · '+sc.secilen.length+' seçildi';
    }
  })();
};
window.seciciGrupla = function(){
  var hepsi=seciciIsimler(); if(hepsi.length<2){ v2Toast('Gruplamak için en az 2 isim gerekir'); return; }
  var n=Math.max(2, Math.min(12, parseInt($('sc-grup-n').value,10)||4));
  for(var i=hepsi.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=hepsi[i]; hepsi[i]=hepsi[j]; hepsi[j]=t; }
  var g=[]; for(var k=0;k<n;k++) g.push([]);
  hepsi.forEach(function(ad,i){ g[i%n].push(ad); });
  var kutu=$('sc-gruplar'); kutu.innerHTML='';
  g.forEach(function(grup,i){ if(!grup.length) return; var d=document.createElement('div'); d.className='sc-grup'; d.style.animationDelay=(i*60)+'ms'; d.innerHTML='<h5>Grup '+(i+1)+' · '+grup.length+' kişi</h5>'; grup.forEach(function(ad){ var s=document.createElement('div'); s.textContent=ad; d.appendChild(s); }); kutu.appendChild(d); });
  playMario(); $('sc-isim').textContent=n+' grup oluşturuldu'; $('sc-isim').className='sc-isim secildi';
};

/* ══════════════════════════════════════════════════════════════
   LAZER · SPOT
   ══════════════════════════════════════════════════════════════ */
var lazerAcikMi=false, spotAcikMi=false, spotR=170;
window.lazerAcKapa = function(){ lazerAcikMi?lazerKapat():lazerAc(); };
function lazerAc(){ lazerAcikMi=true; $('lazer-nokta').classList.add('acik'); document.body.classList.add('lazer-aktif'); $('lazer-btn').classList.add('aktif'); v2Toast('🔦 Lazer açık — L ile kapat'); }
function lazerKapat(){ lazerAcikMi=false; var n=$('lazer-nokta'); if(n) n.classList.remove('acik'); document.body.classList.remove('lazer-aktif'); var b=$('lazer-btn'); if(b) b.classList.remove('aktif'); }
window.spotAcKapa = function(){ spotAcikMi?spotKapat():spotAc(); };
function spotAc(){ spotAcikMi=true; $('spot-perde').classList.add('acik'); $('spot-btn').classList.add('aktif'); v2Toast('🔆 Spot ışığı — + / − ile büyüt-küçült, S ile kapat', 2600); }
function spotKapat(){ spotAcikMi=false; var p=$('spot-perde'); if(p) p.classList.remove('acik'); var b=$('spot-btn'); if(b) b.classList.remove('aktif'); }
document.addEventListener('pointermove', function(e){
  if(lazerAcikMi){ var n=$('lazer-nokta'); n.style.left=e.clientX+'px'; n.style.top=e.clientY+'px'; }
  if(spotAcikMi){ var p=$('spot-perde'); p.style.setProperty('--spot-x', e.clientX+'px'); p.style.setProperty('--spot-y', e.clientY+'px'); p.style.setProperty('--spot-r', spotR+'px'); }
  uiGoster();
}, {passive:true});

/* ══════════════════════════════════════════════════════════════
   KISAYOLLAR · KLAVYE · DOKUNMA · OTOMATİK GİZLEME
   ══════════════════════════════════════════════════════════════ */
window.kisayolAc = function(){ if(typeof closeMenu==='function') closeMenu(); $('kisayol-modal').classList.add('open'); };
window.kisayolKapat = function(){ $('kisayol-modal').classList.remove('open'); };
document.addEventListener('keydown', function(e){
  var t=e.target;
  if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  var k=e.key;
  if(k==='Escape'){ konuKapat(); seciciKapat(); kisayolKapat(); geriSayimMenuKapat(); if(lazerAcikMi) lazerKapat(); if(spotAcikMi) spotKapat(); return; }
  if(!aktifSinif||!TOTAL){ if(k==='?') kisayolAc(); return; }
  if(k===' '||k==='PageDown'){ e.preventDefault(); nextSlide(); }
  else if(k==='Backspace'||k==='PageUp'){ e.preventDefault(); prevSlide(); }
  else if(k==='Home'){ showSlide(0); }
  else if(k==='End'){ showSlide(TOTAL-1); }
  else if(k==='k'||k==='K'||k==='o'||k==='O'){ konuAcKapa(); }
  else if(k==='l'||k==='L'){ lazerAcKapa(); }
  else if(k==='s'||k==='S'){ spotAcKapa(); }
  else if(k==='t'||k==='T'){ geriSayimMenu(); }
  else if(k==='r'||k==='R'){ seciciAc(); }
  else if(k==='m'||k==='M'){ sesAcKapa(); }
  else if(k==='?'||k==='h'||k==='H'){ kisayolAc(); }
  else if(spotAcikMi && (k==='+'||k==='=')){ spotR=Math.min(500,spotR+25); $('spot-perde').style.setProperty('--spot-r',spotR+'px'); }
  else if(spotAcikMi && (k==='-'||k==='_')){ spotR=Math.max(60,spotR-25); $('spot-perde').style.setProperty('--spot-r',spotR+'px'); }
});
// Dokunmatik kaydırma (tablet / akıllı tahta)
(function(){
  var x0=null,y0=null,t0=0;
  STAGE.addEventListener('touchstart',function(e){ if(e.touches.length!==1) return; x0=e.touches[0].clientX; y0=e.touches[0].clientY; t0=Date.now(); },{passive:true});
  STAGE.addEventListener('touchend',function(e){
    if(x0===null) return; if(typeof cizimAktif!=='undefined' && cizimAktif) return; if(typeof duzenlemeAktif!=='undefined' && duzenlemeAktif) return;
    var dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0; x0=null;
    if(Date.now()-t0<600 && Math.abs(dx)>70 && Math.abs(dy)<80){ dx<0?nextSlide():prevSlide(); }
  },{passive:true});
})();
// Tam ekranda boşta kalınca çubuğu gizle
var uiT=null;
function uiGoster(){
  if(!document.body.classList.contains('ui-gizli') && !document.fullscreenElement) return;
  if(document.body.classList.contains('ui-gizli')){ document.body.classList.remove('ui-gizli'); scaleAndFont(); }
  clearTimeout(uiT);
  if(document.fullscreenElement) uiT=setTimeout(function(){ if(document.fullscreenElement && !document.querySelector('.modal-ov.open') && !$('hmenu').style.display.match('flex')){ document.body.classList.add('ui-gizli'); scaleAndFont(); } }, 3200);
}
document.addEventListener('fullscreenchange', function(){ clearTimeout(uiT); if(document.fullscreenElement) uiT=setTimeout(function(){ document.body.classList.add('ui-gizli'); scaleAndFont(); },3200); else { document.body.classList.remove('ui-gizli'); } setTimeout(scaleAndFont,120); });
document.addEventListener('keydown', function(){ uiGoster(); }, true);

/* ══════════════════════════════════════════════════════════════
   KAYDETME TEMİZLİĞİ: v2'nin eklediği geçici öğeler dosyaya yazılmasın
   ══════════════════════════════════════════════════════════════ */
if(typeof temizSerialize==='function'){
  var _tsr=temizSerialize;
  window.temizSerialize=function(){
    var html=_tsr();
    try{
      var doc=new DOMParser().parseFromString(html,'text/html');
      doc.querySelectorAll('.dy-btns').forEach(function(e){ e.remove(); });
      doc.querySelectorAll('.dy-dogru,.dy-yanlis,.mc-ok,.mc-hata').forEach(function(e){ e.classList.remove('dy-dogru','dy-yanlis','mc-ok','mc-hata'); });
      var kl=doc.getElementById('kc-liste'); if(kl) kl.innerHTML='';
      ['konu-cekmece','konu-perde','gsayim','gs-menu','gs-flash','secici-modal','kisayol-modal','lazer-nokta','spot-perde','v2-toast'].forEach(function(id){ var e=doc.getElementById(id); if(e){ e.classList.remove('acik','open'); e.removeAttribute('style'); } });
      var st=doc.getElementById('stage'); if(st) st.removeAttribute('data-dir');
      doc.body.classList.remove('ui-gizli','lazer-aktif','anim-kapali');
      doc.querySelectorAll('.nb.aktif').forEach(function(b){ if(b.id!=='ses-btn') b.classList.remove('aktif'); });
      return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
    }catch(_){ return html; }
  };
}
// Dışa aktarma sırasında animasyonları kapat
if(typeof sunumDisaAktar==='function'){
  var _sda=sunumDisaAktar;
  window.sunumDisaAktar=async function(f){ document.body.classList.add('anim-kapali'); try{ await _sda(f); } finally{ document.body.classList.remove('anim-kapali'); } };
}

/* ── Başlangıç ── */
sesButonGuncelle();
anaEkranGuncelle();
(function(){
  var m=(location.hash||'').match(/^#(\d)(?:\/(\d+))?$/);
  if(m){ var s=parseInt(m[1],10), n=m[2]?parseInt(m[2],10)-1:0; if(s===5||s===6) sinifSec(s, n); else if(s===7||s===8) sinifSec(s); }
})();
})();
