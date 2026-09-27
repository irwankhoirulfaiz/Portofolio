
/* ===== inline script id: (no id) ===== */

(function(){
  const hero=document.getElementById('heroReference');
  if(!hero) return;
  const update=()=>document.body.classList.toggle('reference-scrolled', window.scrollY>Math.max(40, hero.offsetHeight*0.55));
  update();
  window.addEventListener('scroll', update, {passive:true});
})();


/* ===== inline script id: hero-portrait-3d-final ===== */

(function(){
  const hero=document.querySelector('.hero-v2');
  const portrait=hero?.querySelector('.hero-v2-portrait');
  const img=portrait?.querySelector('img');
  if(!hero||!portrait||!img)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  let tx=0,ty=0,cx=0,cy=0;
  hero.addEventListener('mousemove',e=>{
    const r=hero.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5);
    ty=((e.clientY-r.top)/r.height-.5);
  },{passive:true});
  hero.addEventListener('mouseleave',()=>{tx=0;ty=0;},{passive:true});
  function tick(){
    cx+=(tx-cx)*.045; cy+=(ty-cy)*.045;
    img.style.setProperty('--p-x',(cx*12).toFixed(2)+'px');
    img.style.setProperty('--p-y',(cy*8).toFixed(2)+'px');
    img.style.setProperty('--p-rx',(-cy*3.0).toFixed(2)+'deg');
    img.style.setProperty('--p-ry',(cx*4.2).toFixed(2)+'deg');
    img.style.setProperty('--p-z',(Math.abs(cx)+Math.abs(cy))*8+'px');
    requestAnimationFrame(tick);
  }
  tick();
})();


/* ===== inline script id: (no id) ===== */


/* ---------- background: flowing "parcel stream" field ---------- */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06080b, 0.045);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 60);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* ---- liquid wave shader plane (the moving glow background) ---- */
const shaderUniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uScroll: { value: 0 }
};

const waveVertex = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const waveFragment = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScroll;

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    float aspect = uResolution.x / uResolution.y;
    float time = uTime * 0.09;
    float scroll = uScroll;

    vec2 warped = uv;
    float deform = scroll * 4.0;
    warped.x += sin(uv.y * 2.2 + time * 0.25 + deform) * 0.4;
    warped.y += cos(uv.x * 2.2 - time * 0.18 - deform * 0.7) * 0.4;
    warped.x += sin(uv.y * 1.1 - time * 0.12 - deform * 1.3) * 0.28;
    warped.y += cos(uv.x * 1.1 + time * 0.2 + deform * 1.1) * 0.28;
    warped += vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);

    vec2 dir1 = vec2(cos(0.6), sin(0.6));
    vec2 dir2 = vec2(cos(-0.7), sin(-0.7));
    vec2 dir3 = vec2(cos(1.2), sin(1.2));

    float w1 = sin(dot(warped, dir1) * 2.3 + time * 1.0);
    float w2 = cos(dot(warped, dir2) * 3.0 - time * 1.3 + w1 * 0.4);
    float w3 = sin(dot(warped, dir3) * 3.8 + time * 1.7 + w2 * 0.5);
    float field = w1 * 0.5 + w2 * 0.35 + w3 * 0.15;

    float sheen = pow(max(0.0, 1.0 - abs(field - 0.1)), 2.5);
    float spec  = pow(max(0.0, 1.0 - abs(field - 0.15)), 8.0);
    float crest = sheen * 0.5 + spec * 0.9;

    /* amber (top / physical floor) -> cyan (bottom / digital systems) */
    vec3 shadowCol = mix(vec3(0.02,0.012,0.02), vec3(0.01,0.015,0.03), scroll);
    vec3 bodyCol   = mix(vec3(0.22,0.10,0.035), vec3(0.03,0.11,0.19), scroll);
    vec3 midCol    = mix(vec3(0.38,0.19,0.07),  vec3(0.05,0.19,0.30), scroll);
    vec3 crestCol  = mix(vec3(1.0,0.6,0.32),     vec3(0.42,0.86,1.0),  scroll);

    vec3 color = shadowCol;
    color = mix(color, bodyCol, smoothstep(-0.6, 0.2, field));
    color = mix(color, midCol,  smoothstep(0.0, 0.8, field));
    color += crestCol * crest * 1.3;

    float vignette = 1.0 - dot(uv, uv) * 0.1;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;
const waveMaterial = new THREE.ShaderMaterial({
  vertexShader: waveVertex,
  fragmentShader: waveFragment,
  uniforms: shaderUniforms,
  depthWrite: false,
  depthTest: false
});
const wavePlane = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), waveMaterial);
wavePlane.position.set(0, 0, -10);
wavePlane.renderOrder = -10;

const COUNT = 900;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
const speeds = new Float32Array(COUNT);
const laneOffsets = new Float32Array(COUNT);

for (let i = 0; i < COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 12;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  speeds[i] = 0.3 + Math.random() * 0.9;
  laneOffsets[i] = Math.random() * Math.PI * 2;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

function makeDotTexture() {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 16);
  return new THREE.CanvasTexture(c);
}

const material = new THREE.PointsMaterial({
  size: 0.09,
  color: 0xff8f3f,
  map: makeDotTexture(),
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const points = new THREE.Points(geometry, material);
scene.add(points);
camera.add(wavePlane);
scene.add(camera);

const colorTop = new THREE.Color(0xff8f3f);
const colorBottom = new THREE.Color(0x4fd1ff);

let targetMouseX = 0, targetMouseY = 0, mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  shaderUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
let scrollFrac = 0;

function updateScroll() {
  const heroHeight = document.querySelector('.hero').offsetHeight;
  scrollFrac = Math.min(1, window.scrollY / heroHeight);
}
window.addEventListener('scroll', updateScroll, { passive: true });

function animateBG() {
  requestAnimationFrame(animateBG);
  const dt = clock.getDelta();
  const t = clock.getElapsedTime();

  mouseX += (targetMouseX - mouseX) * 0.04;
  mouseY += (targetMouseY - mouseY) * 0.04;

  const pos = geometry.attributes.position.array;
  for (let i = 0; i < COUNT; i++) {
    const idx = i * 3;
    pos[idx + 1] += speeds[i] * dt * 0.6;
    pos[idx] += Math.sin(t * 0.4 + laneOffsets[i]) * 0.0015;
    if (pos[idx + 1] > 4.5) {
      pos[idx + 1] = -4.5;
      pos[idx] = (Math.random() - 0.5) * 12;
      pos[idx + 2] = (Math.random() - 0.5) * 8;
    }
  }
  geometry.attributes.position.needsUpdate = true;

  camera.position.x = mouseX * 0.6;
  camera.position.y = -mouseY * 0.3;
  camera.lookAt(0, 0, 0);

  const mixed = colorTop.clone().lerp(colorBottom, scrollFrac);
  material.color.copy(mixed);

  shaderUniforms.uTime.value = t;
  shaderUniforms.uMouse.value.set(mouseX, -mouseY);
  shaderUniforms.uScroll.value = scrollFrac;

  const opacity = Math.max(0, 1 - scrollFrac * 1.3);
  canvas.style.opacity = opacity;

  renderer.render(scene, camera);
}
animateBG();
updateScroll();

/* ---------- cursor ---------- */
let cx = window.innerWidth / 2, cy = window.innerHeight / 2, ox = cx, oy = cy;
const inner = document.querySelector('.cursor-inner');
const outer = document.querySelector('.cursor-outer');
window.addEventListener('mousemove', (e) => {
  cx = e.clientX; cy = e.clientY;
  inner.style.left = cx + 'px'; inner.style.top = cy + 'px';
});
document.querySelectorAll('a, .module-card, .chip, .role-btn, .project-pick, .overlay-close').forEach(el => {
  el.addEventListener('mouseenter', () => outer.classList.add('hover'));
  el.addEventListener('mouseleave', () => outer.classList.remove('hover'));
});
function cursorLoop() {
  requestAnimationFrame(cursorLoop);
  ox += (cx - ox) * 0.2; oy += (cy - oy) * 0.2;
  outer.style.left = ox + 'px'; outer.style.top = oy + 'px';
}
cursorLoop();

/* ---------- progress bar ---------- */
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
}, { passive: true });


/* ---------- journey: role selector ---------- */
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.role;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.role-panel').forEach(p => p.classList.toggle('active', p.dataset.role === id));
  });
});

/* ---------- projects: open/close full-page overlay (same tab, same dashboard) ---------- */
document.querySelectorAll('.project-pick').forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = document.getElementById('overlay-' + btn.dataset.project);
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  });
});
document.querySelectorAll('.overlay-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.project-overlay').classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ---------- smooth nav ---------- */
document.querySelectorAll('.nav-link, .contact-btn').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


/* ---------- section atmosphere interaction ---------- */
const atmosphereSections = [...document.querySelectorAll('#overview,#journey,#projects,#skills')];
const atmoObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>entry.target.classList.toggle('atmosphere-active', entry.isIntersecting));
},{threshold:.18});
atmosphereSections.forEach(sec=>atmoObserver.observe(sec));
window.addEventListener('mousemove',(e)=>{
  const x=((e.clientX/window.innerWidth)-.5)*24;
  const y=((e.clientY/window.innerHeight)-.5)*18;
  document.querySelectorAll('section:not(.hero)').forEach(sec=>{
    sec.style.setProperty('--mx',x.toFixed(1)+'px');
    sec.style.setProperty('--my',y.toFixed(1)+'px');
  });
},{passive:true});

/* ---------- skills data scan ---------- */
const skillRows = document.querySelectorAll('#skills .skill-row');
const skillObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('in-view'); });
},{threshold:.35});
skillRows.forEach(row=>skillObserver.observe(row));

/* ---------- active navigation ---------- */
const navLinks = [...document.querySelectorAll('.nav-link')];
const navObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(link=>link.classList.toggle('is-current',link.getAttribute('href')==='#'+entry.target.id));
    }
  });
},{rootMargin:'-42% 0px -48% 0px',threshold:0});
['home','overview','journey','projects','skills','contact'].map(id=>document.getElementById(id)).filter(Boolean).forEach(sec=>navObserver.observe(sec));



/* ===== inline script id: premium-wow-script ===== */

(() => {
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];

  /* Soft section reveals */
  qsa('#overview .metric-card,#journey .role-btn,#projects .project-pick,#skills .skill-row,#contact .contact-card').forEach((el,i)=>{
    el.classList.add('reveal-soft'); el.style.transitionDelay=Math.min(i%6*45,225)+'ms';
  });
  const revealObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');revealObs.unobserve(e.target)}}),{threshold:.12});
  qsa('.reveal-soft').forEach(el=>revealObs.observe(el));

  /* Count only numeric metric values; preserve suffix/prefix. */
  const parseCount=(el)=>{
    const raw=(el.textContent||'').trim(); const m=raw.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/); return m?{pre:m[1],num:parseFloat(m[2]),post:m[3],raw}:null;
  };
  const countObs=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(!e.isIntersecting)return; const el=e.target, d=parseCount(el); if(!d)return;
    const start=performance.now(), dur=900;
    const tick=t=>{const p=Math.min(1,(t-start)/dur), eased=1-Math.pow(1-p,3), val=d.num*eased; el.textContent=d.pre+(Number.isInteger(d.num)?Math.round(val):val.toFixed(1))+d.post; if(p<1)requestAnimationFrame(tick)};
    requestAnimationFrame(tick); countObs.unobserve(el);
  }),{threshold:.6});
  qsa('.metric-value').forEach(el=>{if(/\d/.test(el.textContent))countObs.observe(el)});

  /* Magnetic-feeling CTAs, intentionally tiny. */
  qsa('.hero a,.contact-btn').forEach(el=>{
    el.addEventListener('mousemove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.045,y=(e.clientY-r.top-r.height/2)*.045;el.style.transform=`translate(${x}px,${y}px)`});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });

  /* Reading rail */
  const rail=qs('#readingRail i');
  const updateRail=()=>{const max=document.documentElement.scrollHeight-innerHeight;rail.style.height=(max>0?(scrollY/max)*100:0)+'vh'};
  addEventListener('scroll',updateRail,{passive:true}); updateRail();

  /* Command palette: navigation + project actions, no external dependency. */
  const palette=qs('#commandPalette'), input=qs('#commandInput'), list=qs('#commandList');
  const commands=[
    ['Overview','#overview','Section'],['Journey','#journey','Section'],['Projects','#projects','Section'],['Skills','#skills','Section'],['Contact','#contact','Section']
  ];
  const render=(filter='')=>{list.innerHTML='';commands.filter(c=>c[0].toLowerCase().includes(filter.toLowerCase())).forEach((c,i)=>{const b=document.createElement('button');b.className='command-item';b.innerHTML=`<span>${c[0]}</span><span>${c[2]}</span>`;b.onclick=()=>{close();qs(c[1])?.scrollIntoView({behavior:'smooth'});};list.appendChild(b)});};
  const open=()=>{palette.classList.add('open');palette.setAttribute('aria-hidden','false');render();setTimeout(()=>input.focus(),20)};
  const close=()=>{palette.classList.remove('open');palette.setAttribute('aria-hidden','true');input.value=''};
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()} if(e.key==='Escape'&&palette.classList.contains('open'))close()});
  palette.addEventListener('click',e=>{if(e.target===palette)close()}); input.addEventListener('input',()=>render(input.value)); render();

  /* Keyboard support for journey and projects. */
  qsa('.role-btn').forEach((btn,i)=>btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();qsa('.role-btn')[(i+1)%qsa('.role-btn').length].focus()} if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();const a=qsa('.role-btn');a[(i-1+a.length)%a.length].focus()}}));

  /* Project overlay polish: Escape closes any open case study. */
  addEventListener('keydown',e=>{if(e.key==='Escape'){const active=qs('.project-overlay.active');if(active){active.classList.remove('active');document.body.style.overflow=''}}});
})();


/* ===== inline script id: clean-transitions-script ===== */

(() => {
  const transitions = [...document.querySelectorAll('.clean-transition')];
  if (!transitions.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.25 });
  transitions.forEach((el) => observer.observe(el));
})();


/* ===== inline script id: kinetic-text-script ===== */

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const splitTargets = [
    document.querySelector('#heroTitle'),
    ...document.querySelectorAll('#overview .section-title, #overview h3'),
    ...document.querySelectorAll('#journey .section-title'),
    ...document.querySelectorAll('#projects .section-title'),
    ...document.querySelectorAll('#skills .section-title'),
    ...document.querySelectorAll('#contact .contact-title')
  ].filter(Boolean);

  const originals = new Map();

  const splitWords = (el) => {
    if (el.dataset.ktReady) return;
    originals.set(el, el.innerHTML);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.nodeValue;
      if (!text || !text.trim()) return;
      const frag = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);
      parts.forEach((part) => {
        if (!part) return;
        if (/\s+/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'kt-word';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.classList.add('kinetic-text');
    el.dataset.ktReady = '1';
    el.dataset.ktScroll = '1';
  };

  splitTargets.forEach(splitWords);

  // Descriptive text: use a quieter reveal so the typography hierarchy stays clean.
  const copyTargets = [
    document.querySelector('.hero-sub'),
    ...document.querySelectorAll('#overview .overview-main p, #journey .section-note, #projects .section-note, #skills .skills-evidence-head p, #contact .contact-subtitle')
  ].filter(Boolean);
  copyTargets.forEach(el => el.classList.add('kinetic-copy'));

  const show = (el) => {
    el.classList.remove('kt-visible');
    // force a clean replay whenever a section comes back into view
    void el.offsetWidth;
    el.classList.add('kt-visible');
  };

  if (reduce) {
    splitTargets.forEach(el => el.classList.add('kt-visible'));
    copyTargets.forEach(el => el.classList.add('kt-visible'));
    return;
  }

  // Entrance/re-entry observer: the animation plays on first load and every time
  // the element meaningfully re-enters the viewport while scrolling.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.22) {
        show(entry.target);
      } else if (!entry.isIntersecting) {
        entry.target.classList.remove('kt-visible');
      }
    });
  }, { threshold:[0,.22,.6] });

  [...splitTargets, ...copyTargets].forEach(el => observer.observe(el));

  // Hero runs immediately on first load, without waiting for observer timing.
  splitTargets.filter(el => el.id === 'heroTitle').forEach(el => show(el));
  copyTargets.filter(el => el.classList.contains('hero-sub')).forEach(el => show(el));

  // Subtle scroll-linked drift. It is deliberately low-amplitude so the site
  // still feels premium/editorial rather than like a parallax template.
  const scrollTargets = splitTargets;
  let ticking = false;
  const updateDrift = () => {
    const vh = window.innerHeight || 1;
    const center = vh * 0.5;
    scrollTargets.forEach((el) => {
      const r = el.getBoundingClientRect();
      const delta = (r.top + r.height * 0.5) - center;
      const normalized = Math.max(-1, Math.min(1, delta / vh));
      const amount = normalized * -9;
      el.style.setProperty('--kt-y', amount.toFixed(2) + 'px');
    });
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateDrift);
    }
  };
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', updateDrift, {passive:true});
  updateDrift();
})();


/* ===== inline script id: firebase-config ===== */

  const firebaseConfig = {
    apiKey: "AIzaSyD4sDQnIMyb_pSUoodVI4VQNCYC6ugcg78",
    authDomain: "portofolio-67d77.firebaseapp.com",
    databaseURL: "https://portofolio-67d77-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "portofolio-67d77",
    storageBucket: "portofolio-67d77.firebasestorage.app",
    messagingSenderId: "559554576498",
    appId: "1:559554576498:web:4ad0773e152b66a80b82eb",
    measurementId: "G-3GQJDH384E"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const firebaseAuth = firebase.auth();
  const firebaseDB = firebase.database();
  const firebaseStorage = firebase.storage();


/* ===== inline script id: owner-gallery-all-projects-script ===== */

(() => {
  const body = document.body;
  const ownerModal = document.getElementById('ownerModal');
  const ownerPassword = document.getElementById('ownerPassword');
  const ownerError = document.getElementById('ownerError');
  const photoModal = document.getElementById('photoModal');
  const photoTitle = document.getElementById('photoTitle');
  const photoFile = document.getElementById('photoFile');
  const photoError = document.getElementById('photoError');
  const projectNames = {soc:'SOC Control Tower', esteh:'Es Teh Kito — POS Kasir', wedding:'Rencana Nikah — Wedding Planner'};
  const galleryRefs = {};
  let activeProject = null;

  // Firebase RTDB + Storage are now the source of truth. Visitors read;
  // Firebase Auth + RTDB/Storage rules decide who can write.
  const galleryPath = project => `portfolioGallery/${project}`;

  const renderPhotos = (project, photos) => {
    const grid = document.getElementById(`gallery-${project}`);
    if (!grid) return;
    grid.innerHTML = '';
    const entries = Object.entries(photos || {}).sort((a,b) => (a[1]?.createdAt || 0) - (b[1]?.createdAt || 0));
    entries.forEach(([id, photo]) => {
      if (!photo?.imageUrl) return;
      const shot = document.createElement('article');
      shot.className = 'owner-gallery-shot';
      const img = document.createElement('img');
      img.src = photo.imageUrl;
      img.alt = photo.title || `${projectNames[project]} screenshot`;
      img.loading = 'lazy';
      const cap = document.createElement('div');
      cap.className = 'gallery-cap';
      cap.textContent = photo.title || 'Project screenshot';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'gallery-delete';
      del.textContent = 'Remove';
      del.addEventListener('click', async () => {
        if (!firebaseAuth.currentUser) return openOwnerModal();
        if (!confirm(`Remove “${photo.title || 'this photo'}”?`)) return;
        try {
          await firebaseDB.ref(`${galleryPath(project)}/${id}`).remove();
          if (photo.storagePath) {
            try { await firebaseStorage.ref(photo.storagePath).delete(); } catch(storageErr) { console.warn('Storage delete skipped:', storageErr); }
          }
        } catch(err) {
          console.error(err);
          alert('Could not remove this photo. Check Firebase Rules.');
        }
      });
      shot.append(img, cap, del);
      grid.appendChild(shot);
    });
  };

  const startRealtimeGallery = project => {
    if (galleryRefs[project]) galleryRefs[project].off();
    const ref = firebaseDB.ref(galleryPath(project));
    galleryRefs[project] = ref;
    ref.on('value', snap => renderPhotos(project, snap.val() || {}), err => {
      console.error(`RTDB read failed for ${project}:`, err);
    });
  };

  const setOwner = on => {
    body.classList.toggle('owner-mode', on);
    document.querySelectorAll('[data-owner-tools]').forEach(el => el.classList.toggle('visible', on));
    document.querySelectorAll('[data-owner-login]').forEach(el => el.style.display = on ? 'none' : '');
  };

  const closeOwnerModal = () => {
    ownerModal.classList.remove('open'); ownerModal.setAttribute('aria-hidden','true');
    ownerPassword.value = ''; ownerError.classList.remove('show'); ownerError.textContent = 'Login failed';
  };
  const openOwnerModal = () => {
    ownerModal.classList.add('open'); ownerModal.setAttribute('aria-hidden','false');
    setTimeout(() => ownerPassword.focus(), 50);
  };
  const closePhotoModal = () => {
    photoModal.classList.remove('open'); photoModal.setAttribute('aria-hidden','true');
    photoTitle.value = ''; photoFile.value = ''; photoError.classList.remove('show'); photoError.textContent = ''; activeProject = null;
  };

  document.querySelectorAll('[data-owner-login]').forEach(btn => btn.addEventListener('click', openOwnerModal));
  document.getElementById('ownerLoginCancel').addEventListener('click', closeOwnerModal);
  document.getElementById('ownerLoginSubmit').addEventListener('click', async () => {
    const email = (document.getElementById('ownerEmail')?.value || '').trim();
    const password = ownerPassword.value;
    ownerError.classList.remove('show');
    if (!email || !password) { ownerError.textContent = 'Enter your owner email and password.'; ownerError.classList.add('show'); return; }
    const btn = document.getElementById('ownerLoginSubmit');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      await firebaseAuth.signInWithEmailAndPassword(email, password);
      closeOwnerModal();
    } catch(err) {
      console.error(err);
      ownerError.textContent = 'Login failed. Check email/password and Firebase Auth.';
      ownerError.classList.add('show');
    } finally {
      btn.disabled = false; btn.textContent = 'Unlock owner mode';
    }
  });
  ownerPassword.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('ownerLoginSubmit').click();
    if (e.key === 'Escape') closeOwnerModal();
  });
  document.getElementById('ownerEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('ownerLoginSubmit').click();
  });
  ownerModal.addEventListener('click', e => { if (e.target === ownerModal) closeOwnerModal(); });

  document.querySelectorAll('[data-owner-logout]').forEach(btn => btn.addEventListener('click', () => firebaseAuth.signOut()));

  document.querySelectorAll('[data-owner-add]').forEach(btn => btn.addEventListener('click', () => {
    if (!firebaseAuth.currentUser) return openOwnerModal();
    activeProject = btn.dataset.ownerAdd;
    document.getElementById('photoModalProject').textContent = `Adding a photo to ${projectNames[activeProject]}. The title will appear below the image.`;
    photoModal.classList.add('open'); photoModal.setAttribute('aria-hidden','false');
    setTimeout(() => photoTitle.focus(), 50);
  }));

  document.getElementById('photoCancel').addEventListener('click', closePhotoModal);
  photoModal.addEventListener('click', e => { if (e.target === photoModal) closePhotoModal(); });
  document.getElementById('photoSubmit').addEventListener('click', async () => {
    const file = photoFile.files?.[0];
    const title = photoTitle.value.trim();
    photoError.classList.remove('show');
    photoError.textContent = '';
    if (!firebaseAuth.currentUser) { photoError.textContent = 'Owner login required.'; photoError.classList.add('show'); return; }
    if (!activeProject || !file) { photoError.textContent = 'Please choose an image first.'; photoError.classList.add('show'); return; }
    if (!title) { photoError.textContent = 'Please enter a photo title.'; photoError.classList.add('show'); return; }
    if (!file.type.startsWith('image/')) { photoError.textContent = 'Only image files are allowed.'; photoError.classList.add('show'); return; }
    if (file.size > 8 * 1024 * 1024) { photoError.textContent = 'Image is too large. Max 8 MB.'; photoError.classList.add('show'); return; }

    const submit = document.getElementById('photoSubmit');
    submit.disabled = true; submit.textContent = 'Uploading…';
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `portfolio-gallery/${activeProject}/${Date.now()}_${safeName}`;
      const storageRef = firebaseStorage.ref(storagePath);
      const upload = await storageRef.put(file, { contentType: file.type });
      const imageUrl = await upload.ref.getDownloadURL();
      const newRef = firebaseDB.ref(galleryPath(activeProject)).push();
      await newRef.set({
        title,
        imageUrl,
        storagePath,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        createdBy: firebaseAuth.currentUser.uid
      });
      closePhotoModal();
    } catch(err) {
      console.error(err);
      photoError.textContent = 'Upload failed. Check Firebase Storage/RTDB Rules and Billing setup.';
      photoError.classList.add('show');
    } finally {
      submit.disabled = false; submit.textContent = 'Insert photo';
    }
  });

  // Keep every project synced live with RTDB.
  Object.keys(projectNames).forEach(startRealtimeGallery);

  firebaseAuth.onAuthStateChanged(user => {
    setOwner(!!user);
    if (user) {
      console.info('Owner authenticated:', user.uid);
    }
  });
})();


/* ===== inline script id: hero-v2-motion ===== */

(function(){
  const hero=document.querySelector('.hero-v2');
  if(!hero)return;
  const name=hero.querySelector('.hero-v2-name .typed');
  const caret=hero.querySelector('.hero-v2-name .caret');
  const portrait=hero.querySelector('.hero-v2-portrait');
  const target='IRWAN KHOIRUL FAIZ';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i=0;
  function type(){
    if(reduce){name.textContent=target; portrait.classList.add('is-visible'); return;}
    if(i<target.length){name.textContent+=target[i++]; setTimeout(type,target[i-1]===' '?230:145);}
    else{caret.style.animation='caretBlink .85s step-end infinite'; setTimeout(()=>portrait.classList.add('is-visible'),420);}
  }
  setTimeout(type,650);

  if(!reduce && window.matchMedia('(hover:hover)').matches){
    let tx=0,ty=0,cx=0,cy=0;
    hero.addEventListener('mousemove',e=>{
      const r=hero.getBoundingClientRect(); tx=(e.clientX-r.left-r.width/2)/r.width; ty=(e.clientY-r.top-r.height/2)/r.height;
    });
    function frame(){cx+=(tx-cx)*.035;cy+=(ty-cy)*.035; if(portrait.classList.contains('is-visible')) portrait.style.transform=`translate3d(${cx*10}px,${cy*7}px,0) scale(1.005)`; requestAnimationFrame(frame)} frame();
  }

  // replay image fade when Hero leaves/re-enters viewport, as requested
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){ portrait.classList.add('is-visible'); }
    else { portrait.classList.remove('is-visible'); }
  }),{threshold:.08});
  io.observe(hero);
})();

