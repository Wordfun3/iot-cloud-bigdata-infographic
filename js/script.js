/* ── Typewriter ── */
const TW_PHRASES = ['IoT, Cloud & Big Data', 'Tiga Teknologi Raksasa', 'Sistem Informasi Cerdas'];
let twI = 0, twC = 0, twDel = false;
const twEl = document.getElementById('tw');
(function tick(){
  const p = TW_PHRASES[twI];
  twEl.textContent = p.slice(0, twC + (twDel ? 0 : 1));
  if(!twDel){ twC++; if(twC >= p.length){ twDel=true; setTimeout(tick,1900); return; }}
  else{ twC--; if(twC < 0){ twDel=false; twI=(twI+1)%TW_PHRASES.length; twC=0; }}
  setTimeout(tick, twDel ? 45 : 85);
})();

/* ── Hero counters ── */
function ctr(el, to, suf, dec, dur){
  let n=0; const step=to/(dur/16);
  const t=setInterval(()=>{
    n+=step; if(n>=to){n=to;clearInterval(t);}
    el.textContent = (dec>0?n.toFixed(dec):Math.floor(n)).toLocaleString('id')+suf;
  },16);
}
setTimeout(()=>{
  ctr(document.getElementById('tc1'), 15.1, 'M+', 1, 1400);
  ctr(document.getElementById('tc2'), 328, ' jt GB', 0, 1600);
  ctr(document.getElementById('tc3'), 5.8, ' T USD', 1, 1200);
},700);

/* ── Canvas Particle Simulation ── */
const cvs = document.getElementById('cvs');
const ctx2 = cvs.getContext('2d');
let particles = [];
let rafId;

function resizeCvs(){
  const w = cvs.parentElement;
  cvs.width = w.offsetWidth;
  cvs.height = w.offsetHeight;
}
window.addEventListener('resize', resizeCvs);
resizeCvs();

function nodeCenters(){
  const nodes = document.querySelectorAll('.node');
  const rect = cvs.getBoundingClientRect();
  return Array.from(nodes).map(n=>{
    const r = n.getBoundingClientRect();
    return { x: r.left - rect.left + r.width/2, y: r.top - rect.top + r.height/2 };
  });
}

function hex2rgba(h,a){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

class Dot{
  constructor(from,to,col,delay,bottom){
    this.from=from; this.to=to; this.col=col;
    this.p=-delay; this.sp=.014+Math.random()*.008;
    this.sz=2.5+Math.random()*2.5;
    this.trail=[]; this.bottom=bottom||false;
  }
  update(){
    this.p+=this.sp;
    if(this.p<0) return false;
    const t=Math.min(this.p,1);
    let cx,cy;
    if(this.bottom){
      cx=(this.from.x+this.to.x)/2; cy=this.from.y+90;
    } else {
      cx=(this.from.x+this.to.x)/2; cy=this.from.y-70;
    }
    const x=(1-t)*(1-t)*this.from.x+2*(1-t)*t*cx+t*t*this.to.x;
    const y=(1-t)*(1-t)*this.from.y+2*(1-t)*t*cy+t*t*this.to.y;
    this.trail.push({x,y}); if(this.trail.length>14) this.trail.shift();
    this.cx=x; this.cy=y;
    return this.p>1;
  }
  draw(c){
    if(this.p<0) return;
    for(let i=0;i<this.trail.length;i++){
      const a=(i/this.trail.length)*.35;
      c.beginPath(); c.arc(this.trail[i].x,this.trail[i].y,this.sz*(i/this.trail.length)*.65,0,Math.PI*2);
      c.fillStyle=hex2rgba(this.col,a); c.fill();
    }
    if(this.cx!==undefined){
      c.beginPath(); c.arc(this.cx,this.cy,this.sz,0,Math.PI*2);
      c.fillStyle=this.col; c.shadowBlur=14; c.shadowColor=this.col; c.fill(); c.shadowBlur=0;
    }
  }
}

function drawLines(cen){
  if(!cen||cen.length<2) return;
  ctx2.setLineDash([5,9]); ctx2.lineWidth=1;
  for(let i=0;i<cen.length-1;i++){
    const f=cen[i],t=cen[i+1];
    ctx2.beginPath();
    ctx2.moveTo(f.x,f.y);
    ctx2.quadraticCurveTo((f.x+t.x)/2,f.y-70,t.x,t.y);
    ctx2.strokeStyle='rgba(255,255,255,.05)'; ctx2.stroke();
  }
  if(cen.length>=4){
    const la=cen[cen.length-1],fi=cen[0];
    ctx2.beginPath();
    ctx2.moveTo(la.x,la.y+40);
    ctx2.bezierCurveTo(la.x,la.y+100,fi.x,la.y+100,fi.x,fi.y+40);
    ctx2.strokeStyle='rgba(251,146,60,.1)'; ctx2.stroke();
  }
  ctx2.setLineDash([]);
}

function loop(){
  ctx2.clearRect(0,0,cvs.width,cvs.height);
  const cen=nodeCenters();
  drawLines(cen);
  particles=particles.filter(d=>{ const done=d.update(); d.draw(ctx2); return !done; });
  rafId=requestAnimationFrame(loop);
}
loop();

function runSim(){
  const btn=document.getElementById('simBtn');
  btn.disabled=true; btn.textContent='⏳ Mengirim data...';
  const cen=nodeCenters();
  const nodeEls=document.querySelectorAll('.node');
  const routes=[
    {from:0,to:1,col:'#00d4ff',n:10},{from:1,to:2,col:'#a78bfa',n:10},{from:2,to:3,col:'#34d399',n:10}
  ];
  routes.forEach((r,ri)=>{
    for(let w=0;w<r.n;w++){
      setTimeout(()=>particles.push(new Dot(cen[r.from],cen[r.to],r.col,w*.12)),ri*750);
    }
    setTimeout(()=>{
      nodeEls[r.from].classList.add('lit');
      setTimeout(()=>nodeEls[r.from].classList.remove('lit'),600);
    },ri*750);
  });
  setTimeout(()=>{
    nodeEls[3].classList.add('lit');
    setTimeout(()=>nodeEls[3].classList.remove('lit'),600);
    for(let w=0;w<5;w++) setTimeout(()=>particles.push(new Dot(cen[3],cen[0],'#fb923c',w*.18,true)),w*120);
  },2600);
  setTimeout(()=>{
    btn.disabled=false; btn.textContent='🚀 Jalankan Simulasi Alur Data';
  },4200);
}

/* ── Modal Data ── */
const MData={
  iot:{
    icon:'📡', step:'01 · IoT — Layer Pengumpulan Data', col:'#00d4ff',
    title:'Internet of Things',
    body:`IoT adalah ekosistem perangkat fisik yang "merasakan" dunia nyata dan mengirim data ke internet secara otomatis. Bayangkan ratusan "tangan tak kasat mata" yang terus mengumpulkan informasi dari lingkungan sekitar kita setiap detiknya.<br><br>Data yang dikumpulkan bisa sangat beragam: angka (suhu, tekanan, kecepatan), gambar (CCTV), suara, lokasi GPS, hingga sinyal biologis (detak jantung). Semua dikirim ke cloud menggunakan protokol komunikasi ringan agar hemat baterai.`,
    tags:['Sensor Suhu','GPS Tracker','RFID Barcode','CCTV Smart','Smart Meter','Wearable','Drone Sensor','MQTT Protocol'],
    tBg:'rgba(0,212,255,.1)', tCol:'#00d4ff',
    anTitle:'🛵 Analogi GoJek', anBg:'rgba(0,212,255,.05)', anBorder:'rgba(0,212,255,.2)',
    anBody:'HP kamu yang terus kirim lokasi GPS = sensor IoT yang terus kirim data suhu. Sama-sama perangkat fisik yang "mengintip" kondisi nyata dan melaporkannya ke server!'
  },
  cloud:{
    icon:'☁️', step:'02 · Cloud Computing — Layer Infrastruktur', col:'#a78bfa',
    title:'Cloud Computing',
    body:`Cloud Computing adalah "otak dan gudang" raksasa yang bisa kamu sewa lewat internet. Alih-alih beli server mahal sendiri, kamu cukup bayar sesuai pakai — seperti bayar listrik, bukan beli PLTU!<br><br>Cloud menyediakan tiga layanan utama: <strong>IaaS</strong> (infrastruktur virtual), <strong>PaaS</strong> (platform untuk develop), dan <strong>SaaS</strong> (aplikasi siap pakai). Untuk IoT & Big Data, Cloud berperan menyimpan data masif dan menyediakan daya komputasi elastis.`,
    tags:['AWS IoT Core','Microsoft Azure','Google Cloud','Data Lake / S3','Auto Scaling','Kubernetes','Serverless','Cloud Database'],
    tBg:'rgba(167,139,250,.1)', tCol:'#a78bfa',
    anTitle:'🛵 Analogi GoJek', anBg:'rgba(167,139,250,.05)', anBorder:'rgba(167,139,250,.2)',
    anBody:'Server pusat GoJek yang tampung jutaan order dari seluruh Indonesia sekaligus = Cloud Computing. Pas lebaran order melonjak? Server langsung expand otomatis. Bukan beli server baru, tapi sewa kapasitas tambahan!'
  },
  big:{
    icon:'🔬', step:'03 · Big Data — Layer Analitik', col:'#34d399',
    title:'Big Data Analytics',
    body:`Big Data bukan sekadar "data yang banyak". Ini adalah teknologi & metode khusus untuk mengolah data dengan karakteristik <strong>5V</strong>: Volume (masif), Velocity (cepat masuk), Variety (berbagai format), Veracity (perlu dibersihkan), dan Value (harus menghasilkan nilai).<br><br>Menggunakan algoritma Machine Learning dan AI, Big Data menemukan pola tersembunyi yang mustahil dilihat manusia secara manual — misalnya pola yang tersembunyi di 500 juta baris data!`,
    tags:['Apache Spark','Hadoop HDFS','Apache Kafka','Machine Learning','Python / R','TensorFlow','Data Mining','Real-time Streaming'],
    tBg:'rgba(52,211,153,.1)', tCol:'#34d399',
    anTitle:'🛵 Analogi GoJek', anBg:'rgba(52,211,153,.05)', anBorder:'rgba(52,211,153,.2)',
    anBody:'Tim analis GoJek yang temukan: "Setiap Jumat malam di Jakarta Selatan, order naik 3x lipat — naikkan harga surge!" Mereka menganalisis jutaan data perjalanan untuk temukan pola ini. Itulah Big Data!'
  },
  si:{
    icon:'🖥️', step:'04 · SI — Layer Keputusan & Aksi', col:'#fb923c',
    title:'Sistem Informasi',
    body:`Sistem Informasi adalah "pintu akhir" dari seluruh proses — tempat insight dari Big Data disajikan dalam bentuk yang bisa dipahami dan digunakan manusia maupun mesin untuk mengambil keputusan.<br><br>SI tidak hanya menampilkan data, tapi juga bisa mengirim "perintah balik" ke perangkat IoT — membentuk <strong>feedback loop</strong> yang membuat seluruh sistem menjadi adaptif dan cerdas. Inilah yang membedakan sistem biasa dengan sistem yang benar-benar "smart".`,
    tags:['Dashboard Visual','ERP / SAP','CRM System','Alert & Notifikasi','Business Intelligence','Decision Support','REST API','Feedback Control'],
    tBg:'rgba(251,146,60,.1)', tCol:'#fb923c',
    anTitle:'🛵 Analogi GoJek', anBg:'rgba(251,146,60,.05)', anBorder:'rgba(251,146,60,.2)',
    anBody:'Tampilan di app GoJek kamu — harga surge, ETA driver, rating, promosi — semua adalah Sistem Informasi yang menyajikan hasil analisis data dalam format yang langsung kamu mengerti dan bisa dipakai buat keputusan (jadi order atau nggak)!'
  }
};

function showModal(k){
  const d=MData[k];
  document.getElementById('mIcon').textContent=d.icon;
  document.getElementById('mStep').style.color=d.col;
  document.getElementById('mStep').textContent=d.step;
  document.getElementById('mTitle').style.color=d.col;
  document.getElementById('mTitle').textContent=d.title;
  document.getElementById('mBody').innerHTML=d.body;
  document.getElementById('mTags').innerHTML=d.tags.map(t=>
    `<span class="m-tag" style="background:${d.tBg};color:${d.tCol}">${t}</span>`).join('');
  const an=document.getElementById('mAn');
  an.style.cssText=`background:${d.anBg};border:1px solid ${d.anBorder};`;
  an.innerHTML=`<div class="ma-title" style="color:${d.col}">${d.anTitle}</div><div class="ma-body">${d.anBody}</div>`;
  document.getElementById('mBg').classList.add('on');
}
function closeModal(){ document.getElementById('mBg').classList.remove('on'); }
function handleMBgClick(e){ if(e.target===document.getElementById('mBg')) closeModal(); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

/* ── Quiz ── */
let answers={q1:null,q2:null,q3:null};
function jawab(btn,qid,ok,msg){
  const opts=btn.closest('.q-opts').querySelectorAll('.q-opt');
  opts.forEach(o=>{ o.classList.add('dim'); o.style.pointerEvents='none'; });
  btn.classList.remove('dim'); btn.classList.add(ok?'ok':'no');
  const fb=document.getElementById(qid+'-fb');
  fb.textContent=(ok?'✅ ':'❌ ')+msg;
  fb.className='q-fb show '+(ok?'ok':'no');
  answers[qid]=ok;
  if(Object.values(answers).every(v=>v!==null)) setTimeout(showScore,700);
}
function showScore(){
  const tot=Object.values(answers).filter(Boolean).length;
  const sb=document.getElementById('scoreBox');
  sb.className='score-box glass show';
  const configs=[
    {score:3,emoji:'🏆',txt:'Sempurna! 3/3',col:'#34d399',sub:'Mantap banget! Kamu sudah paham alur IoT-Cloud-BigData-SI dengan baik. Siap presentasi di depan kelas? Go!'},
    {score:2,emoji:'👍',txt:'Keren! 2/3',col:'#a78bfa',sub:'Hampir sempurna! Baca ulang satu bagian yang keliru, terus coba lagi. Pasti bisa!'},
    {score:1,emoji:'💪',txt:'1/3 — Ayo coba lagi!',col:'#fb923c',sub:'Jangan nyerah! Scroll ke atas, baca bagian "Ikuti Perjalanan Data" sekali lagi. Dijamin langsung ngerti!'},
    {score:0,emoji:'🌱',txt:'0/3 — Baca ulang dulu ya!',col:'#94a3b8',sub:'Santai! Semua orang mulai dari nol. Yuk scroll ke atas dan ikuti alur ceritanya dari awal!'},
  ];
  const c=configs.find(x=>x.score===tot)||configs[3];
  document.getElementById('scoreEmoji').textContent=c.emoji;
  document.getElementById('scoreTxt').textContent=c.txt;
  document.getElementById('scoreTxt').style.color=c.col;
  document.getElementById('scoreSub').textContent=c.sub;
  sb.scrollIntoView({behavior:'smooth',block:'center'});
}

/* ── Scroll Reveal ── */
const sio=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('vis');
      /* stat counters */
      e.target.querySelectorAll('[data-to]').forEach(el=>{
        const to=parseFloat(el.dataset.to),suf=el.dataset.suf,dec=parseInt(el.dataset.dec||0);
        let n=0; const step=to/(1600/16);
        const t=setInterval(()=>{
          n+=step; if(n>=to){n=to;clearInterval(t);}
          el.textContent=(dec>0?n.toFixed(dec):Math.floor(n)).toLocaleString('id')+suf;
        },16);
      });
    }
  });
},{threshold:.12});
document.querySelectorAll('.reveal,.stat-card').forEach(el=>sio.observe(el));
