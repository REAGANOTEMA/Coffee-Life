// ==================== Hero Videos ====================
const videoFiles = [
  "videos/hero-food.mp4",
  "videos/hero2.mp4",
];

const videos = document.querySelectorAll(".hero-video");
let currentVideo = 0;

// Preload and initialize videos
videos.forEach((v, i) => {
  v.src = videoFiles[i];
  v.load();
  v.muted = true;
  v.playsInline = true;
  v.style.opacity = i === 0 ? 1 : 0;
  v.style.transition = "opacity 2s ease-in-out";
  v.style.width = "100%";
  v.style.height = "100%";
  v.style.objectFit = "cover";
});

// Play video and fade others
function playVideo(i) {
  videos.forEach((v, j) => {
    if (i === j) {
      v.style.opacity = 1;
      v.play().catch(() => { });
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
  heroTitle.style.color = "#6f4e37";
}

// Cinematic subtitles
const subtitleWords = document.querySelectorAll(".hero-subtitle span");
subtitleWords.forEach(w => {
  w.style.fontSize = "clamp(1.5rem, 4vw, 3rem)";
  w.style.fontWeight = "700";
  w.style.display = "inline-block";
  w.style.whiteSpace = "nowrap";
  w.style.transition = "all 1s ease-in-out";
});

// Gradient animation for subtitles
function animateSubtitleGradient() {
  subtitleWords.forEach(w => {
    w.style.background = `linear-gradient(90deg, #ffb347, #ffcc33, #ff6b6b, #6b5b95)`;
    w.style.webkitBackgroundClip = "text";
    w.style.color = "transparent";
  });
}
setInterval(animateSubtitleGradient, 2000);

// Slide / shake animation for cinematic feel
let slideDir = 1;
function slideSubtitle() {
  subtitleWords.forEach(w => {
    const currentX = w.dataset.offset ? parseFloat(w.dataset.offset) : 0;
    let newX = currentX + 5 * slideDir;
    if (Math.abs(newX) > 15) slideDir *= -1;
    w.dataset.offset = newX;
    w.style.transform = `translateX(${newX}px)`;
  });
}
setInterval(slideSubtitle, 2500);

// ==================== Hero Note Text Rotator ====================
const heroNotes = [
  "Indulge in the perfect cup, delight in every dessert, and cherish every moment.",
  "Savor handcrafted pastries, premium coffee, and moments that inspire.",
  "Every sip, every bite, every smile – Coffee Life Cafe awaits you.",
  "Relax, connect, and enjoy gourmet treats in a cozy atmosphere."
];

const heroNoteEl = document.querySelector(".hero-note");
let currentNote = 0;

function showNextHeroNote() {
  if (!heroNoteEl) return;
  heroNoteEl.style.opacity = 0;
  setTimeout(() => {
    heroNoteEl.textContent = heroNotes[currentNote];
    heroNoteEl.style.opacity = 1;
    currentNote = (currentNote + 1) % heroNotes.length;
  }, 600);
}

if (heroNoteEl) {
  heroNoteEl.style.transition = "opacity 0.6s ease-in-out";
  heroNoteEl.style.opacity = 1;
  setInterval(showNextHeroNote, 10000);
}

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
// ==================== Mobile View Adjustments ====================
function adjustHeroForMobile() {
  const width = window.innerWidth;

  // Adjust hero title
  if (heroTitle) {
    if (width < 480) {
      heroTitle.style.fontSize = "2rem";
    } else if (width < 768) {
      heroTitle.style.fontSize = "3rem";
    } else {
      heroTitle.style.fontSize = "clamp(2rem, 5vw, 4rem)";
    }
  }

  // Adjust subtitle words
  subtitleWords.forEach(w => {
    if (width < 480) {
      w.style.fontSize = "1.2rem";
    } else if (width < 768) {
      w.style.fontSize = "1.8rem";
    } else {
      w.style.fontSize = "clamp(1.5rem, 4vw, 3rem)";
    }
  });

  // Adjust hero note
  if (heroNoteEl) {
    if (width < 480) {
      heroNoteEl.style.fontSize = "0.9rem";
      heroNoteEl.style.lineHeight = "1.2rem";
    } else if (width < 768) {
      heroNoteEl.style.fontSize = "1.2rem";
      heroNoteEl.style.lineHeight = "1.5rem";
    } else {
      heroNoteEl.style.fontSize = "1.4rem";
      heroNoteEl.style.lineHeight = "1.8rem";
    }
  }
}

// Initial adjustment
adjustHeroForMobile();

// Re-adjust on window resize
window.addEventListener("resize", adjustHeroForMobile);
