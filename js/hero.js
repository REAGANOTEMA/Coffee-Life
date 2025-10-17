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
  v.muted = true; // required for mobile autoplay
  v.playsInline = true; // ensures in-page mobile playback
  v.style.opacity = i === 0 ? 1 : 0;
  v.style.transition = "opacity 2s ease-in-out";
  v.style.width = "100%";
  v.style.height = "100%";
  v.style.objectFit = "cover"; // cover container
});

// Play video and fade others
function playVideo(i) {
  videos.forEach((v, j) => {
    if (i === j) {
      v.style.opacity = 1;
      v.play().catch(() => {}); // prevent autoplay errors
    } else {
      v.style.opacity = 0;
      v.pause();
      v.currentTime = 0;
    }
  });
}

// Auto-play next video
videos.forEach((v, i) => {
  v.addEventListener("ended", () => {
    currentVideo = (i + 1) % videos.length;
    playVideo(currentVideo);
  });
});

// Start first video
playVideo(currentVideo);

// Optional: loop manually
videos.forEach(v => v.addEventListener("loadeddata", () => { v.loop = false; }));

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

// ==================== Hero Text Styling ====================
if (heroTitle) {
  heroTitle.style.fontSize = "clamp(2rem, 5vw, 4rem)";
  heroTitle.style.fontWeight = "900";
  heroTitle.style.color = "#6f4e37"; // coffee color
}

const subtitleWords = document.querySelectorAll(".hero-subtitle");
subtitleWords.forEach(w => {
  w.style.fontSize = "clamp(1.5rem, 4vw, 3rem)";
  w.style.fontWeight = "700";
  w.style.color = "#6f4e37";
  w.style.display = "inline-block";
  w.style.whiteSpace = "nowrap";
  w.style.transition = "transform 0.6s ease-in-out, background 1.5s linear";
});

// Gradient animation
function animateSubtitle() {
  subtitleWords.forEach(w => {
    w.style.background = `linear-gradient(45deg, #6f4e37, #ffffff)`;
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

// Slide animation
let slideDirection = 1;
function slideSubtitle() {
  subtitleWords.forEach(w => {
    const currentX = w.dataset.offset ? parseFloat(w.dataset.offset) : 0;
    let newX = currentX + 10 * slideDirection;
    if (Math.abs(newX) > 20) slideDirection *= -1;
    w.dataset.offset = newX;
    w.style.transform = `translateX(${newX}px)`;
  });
}

// Animations intervals
setInterval(animateSubtitle, 1500);
setInterval(shakeSubtitle, 5000);
setInterval(slideSubtitle, 2000);

// ==================== WhatsApp Blocking Until Cart Has Items ====================
const whatsappBtn = document.querySelector(".whatsapp-float");
const cartContainer = document.querySelector(".cart-container");

function checkCartForWhatsApp() {
  const cartItems = cartContainer.querySelectorAll(".cart-item");
  if (cartItems.length === 0) {
    whatsappBtn.classList.add("disabled");
    whatsappBtn.style.pointerEvents = "none";
    whatsappBtn.title = "Add items to cart first!";
  } else {
    whatsappBtn.classList.remove("disabled");
    whatsappBtn.style.pointerEvents = "auto";
    whatsappBtn.title = "Chat on WhatsApp";
  }
}

checkCartForWhatsApp();

const observer = new MutationObserver(checkCartForWhatsApp);
observer.observe(cartContainer, { childList: true, subtree: true });

whatsappBtn.addEventListener("click", e => {
  if (whatsappBtn.classList.contains("disabled")) {
    e.preventDefault();
    alert("Please add items to your cart before contacting us on WhatsApp!");
  }
});
