// Hero videos
const videoFiles=["videos/hero-welcome.mp4","videos/hero-cap2.mp4","videos/promotion.mp4"];
const videos=document.querySelectorAll(".hero-video");let currentVideo=0;
videos.forEach((v,i)=>{v.src=videoFiles[i];v.load();v.style.opacity=i===0?1:0;v.style.transition="opacity 2s ease-in-out";});
function playVideo(i){videos.forEach((v,j)=>{if(i===j){v.style.opacity=1;v.play().catch(()=>{});}else{v.style.opacity=0;v.pause();}});}
videos.forEach((v,i)=>v.addEventListener("ended",()=>{currentVideo=(i+1)%videos.length;playVideo(currentVideo);}));
playVideo(currentVideo);

// Shimmer & button glow
setInterval(()=>{document.querySelectorAll(".hero-btn").forEach(b=>{b.classList.add("light-effect");setTimeout(()=>b.classList.remove("light-effect"),1200);});},4000);

// Sparkles
const sparkleLayer=document.querySelector(".hero-luxury-glow");
if(sparkleLayer){for(let i=0;i<35;i++){const sp=document.createElement("div");sp.className="hero-sparkle";sp.style.top=`${Math.random()*100}%`;sp.style.left=`${Math.random()*100}%`;sp.style.animationDelay=`${Math.random()*3}s`;sparkleLayer.appendChild(sp);}}

// Floating food icons
const heroBg=document.querySelector(".hero-background");
if(heroBg){const icons=["☕","🍰","🥐","🍩","🍪","🥞"];for(let i=0;i<20;i++){const d=document.createElement("div");d.className="hero-food-decor";d.textContent=icons[Math.floor(Math.random()*icons.length)];d.style.top=`${Math.random()*100}%`;d.style.left=`${Math.random()*100}%`;d.style.fontSize=`${Math.random()*25+20}px`;d.style.opacity=0.2+Math.random()*0.3;heroBg.appendChild(d);}setInterval(()=>{document.querySelectorAll(".hero-food-decor").forEach(e=>{e.style.transform=`translateY(${Math.random()*10-5}px) translateX(${Math.random()*5-2.5}px)`;});},7000);}

// Mouse parallax
const heroTitle=document.querySelector(".hero-title");
const heroSubtitle=document.querySelector(".hero-subtitle");
document.addEventListener("mousemove",e=>{const x=(e.clientX/window.innerWidth-0.5)*15;const y=(e.clientY/window.innerHeight-0.5)*15;heroTitle.style.transform=`translate(${x/3}px,${y/3}px)`;heroSubtitle.style.transform=`translate(${x/6}px,${y/6}px)`;});

// Eat Meet Work animated colors
const subtitleWords=document.querySelectorAll(".hero-subtitle");
setInterval(()=>{subtitleWords.forEach(w=>{w.style.background=`linear-gradient(45deg, #ffdd00,#ff4d00,#ff1aff,#33ccff,#cc33ff)`; w.style.webkitBackgroundClip="text"; w.style.color="transparent";});},1500);
