// ==================== Hero Videos ====================
const videoFiles = [
  "videos/hero-welcome.mp4",
  "videos/capcut-hero0.mp4",
  "videos/hero-cap2.mp4"
];

const videos = document.querySelectorAll(".hero-video");
let currentVideo = 0;

// Preload and initialize videos
videos.forEach((v, i) => {
  v.src = videoFiles[i];
  v.load();
  v.style.opacity = i === 0 ? 1 : 0;
  v.style.transition = "opacity 2s ease-in-out";
});

// Function to play a video and fade out others
function playVideo(i) {
  videos.forEach((v, j) => {
    if (i === j) {
      v.style.opacity = 1;
      v.play().catch(() => {}); // prevent autoplay errors
    } else {
      v.style.opacity = 0;
      v.pause();
      v.currentTime = 0; // reset paused videos
    }
  });
}

// Automatically play next video on ended
videos.forEach((v, i) => {
  v.addEventListener("ended", () => {
    currentVideo = (i + 1) % videos.length;
    playVideo(currentVideo);
  });
});

// Start the first video
playVideo(currentVideo);

// Optional: seamless loop without delay
videos.forEach(v => v.addEventListener("loadeddata", () => {
  v.loop = false; // handled manually
}));

// ==================== Shimmer & Button Glow ====================
setInterval(() => {
  document.querySelectorAll(".hero-btn").forEach(b => {
    b.classList.add("light-effect");
    setTimeout(() => b.classList.remove("light-effect"), 1200);
  });
}, 4000);

// ==================== Sparkles ====================
const sparkleLayer = document.querySelector(".hero-luxury-glow");
if (sparkleLayer) {
  for (let i = 0; i < 35; i++) {
    const sp = document.createElement("div");
    sp.className = "hero-sparkle";
    sp.style.top = `${Math.random() * 100}%`;
    sp.style.left = `${Math.random() * 100}%`;
    sp.style.animationDelay = `${Math.random() * 3}s`;
    sparkleLayer.appendChild(sp);
  }
}

// ==================== Floating Food Icons ====================
const heroBg = document.querySelector(".hero-background");
if (heroBg) {
  const icons = ["☕", "🍰", "🥐", "🍩", "🍪", "🥞"];
  for (let i = 0; i < 20; i++) {
    const d = document.createElement("div");
    d.className = "hero-food-decor";
    d.textContent = icons[Math.floor(Math.random() * icons.length)];
    d.style.top = `${Math.random() * 100}%`;
    d.style.left = `${Math.random() * 100}%`;
    d.style.fontSize = `${Math.random() * 25 + 20}px`;
    d.style.opacity = 0.2 + Math.random() * 0.3;
    heroBg.appendChild(d);
  }

  setInterval(() => {
    document.querySelectorAll(".hero-food-decor").forEach(e => {
      e.style.transform = `translateY(${Math.random() * 10 - 5}px) translateX(${Math.random() * 5 - 2.5}px)`;
    });
  }, 7000);
}

// ==================== Mouse Parallax ====================
const heroTitle = document.querySelector(".hero-title");
const heroSubtitle = document.querySelector(".hero-subtitle");
document.addEventListener("mousemove", e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 15;
  const y = (e.clientY / window.innerHeight - 0.5) * 15;
  if (heroTitle) heroTitle.style.transform = `translate(${x / 3}px,${y / 3}px)`;
  if (heroSubtitle) heroSubtitle.style.transform = `translate(${x / 6}px,${y / 6}px)`;
});

// ==================== Coffee Life Cafe Sizing ====================
if (heroTitle) {
  heroTitle.style.fontSize = "4rem"; // large, prominent
  heroTitle.style.fontWeight = "900";
  heroTitle.style.color = "#6f4e37"; // coffee color
}

// ==================== Eat Meet Work Animated Colors + Shake + Slide ====================
const subtitleWords = document.querySelectorAll(".hero-subtitle");
subtitleWords.forEach(w => {
  w.style.fontSize = "3rem";
  w.style.fontWeight = "700";
  w.style.color = "#6f4e37"; // default coffee color
  w.style.display = "inline-block";
  w.style.whiteSpace = "nowrap";
  w.style.transition = "transform 0.6s ease-in-out, background 1.5s linear";
});

// Gradient colors for Eat. Meet. Work.
function animateSubtitle() {
  subtitleWords.forEach(w => {
    w.style.background = `linear-gradient(45deg, #6f4e37, #ffffff)`; // coffee + white
    w.style.webkitBackgroundClip = "text";
    w.style.color = "transparent";
  });
}

// Shake animation
function shakeSubtitle() {
  subtitleWords.forEach(w => {
    w.style.transition = "transform 0.2s";
    w.style.transform = "translateX(5px)";
    setTimeout(() => { w.style.transform = "translateX(-5px)"; }, 100);
    setTimeout(() => { w.style.transform = "translateX(0)"; }, 200);
  });
}

// Sliding animation
let slideDirection = 1; // 1 = right, -1 = left
function slideSubtitle() {
  subtitleWords.forEach(w => {
    const currentX = w.dataset.offset ? parseFloat(w.dataset.offset) : 0;
    let newX = currentX + 10 * slideDirection; // slide distance
    if (Math.abs(newX) > 20) slideDirection *= -1; // reverse direction
    w.dataset.offset = newX;
    w.style.transform = `translateX(${newX}px)`;
  });
}

// Run gradient animation every 1.5s
setInterval(animateSubtitle, 1500);

// Shake every 5 seconds
setInterval(shakeSubtitle, 5000);

// Slide continuously every 2s
setInterval(slideSubtitle, 2000);
