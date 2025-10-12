// ===================== LUXURY HERO FINAL SCRIPT ===================== //

// ===== 1. HERO VIDEOS =====
const videoFiles = ["videos/hero-welcome.mp4", "videos/hero-cap2.mp4", "videos/capcut-hero0.mp4"];
const videos = document.querySelectorAll(".hero-video");
let currentVideo = 0;

// Initialize videos
videos.forEach((vid, i) => {
    vid.src = videoFiles[i];
    vid.load();
    Object.assign(vid.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: i === 0 ? "1" : "0",
        transition: "opacity 1.2s ease-in-out",
        zIndex: i === 0 ? "1" : "0"
    });
});

function playVideo(index) {
    videos.forEach((vid, i) => {
        if (i === index) {
            vid.style.zIndex = 1;
            vid.style.opacity = 1;
            vid.play().catch(() => { });
        } else {
            vid.style.zIndex = 0;
            vid.style.opacity = 0;
            vid.pause();
        }
    });
}
playVideo(currentVideo);

videos.forEach((vid, i) => {
    vid.addEventListener("ended", () => {
        currentVideo = (i + 1) % videos.length;
        playVideo(currentVideo);
    });
});

// ===== 2. HERO TITLE LUXURY STYLE =====
const heroTitle = document.querySelector(".hero-title-text");
const heroSubtitle = document.querySelector(".hero-subtitle");

Object.assign(heroTitle.style, {
    fontFamily: "'Cinzel Decorative', serif",
    fontWeight: "900",
    color: "#6b3e20",
    textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
    letterSpacing: "3px",
    textTransform: "uppercase",
    position: "relative",
    overflow: "hidden"
});

// ===== 3. GOLD SHIMMER ON TITLE =====
const shimmer = document.createElement("span");
shimmer.className = "hero-title-shimmer";
Object.assign(shimmer.style, {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(120deg, transparent 0%, rgba(255,215,128,0.7) 50%, transparent 100%)",
    animation: "shimmerMove 6s infinite linear",
    mixBlendMode: "overlay",
    pointerEvents: "none"
});
heroTitle.appendChild(shimmer);

const shimmerStyle = document.createElement("style");
shimmerStyle.textContent = `
@keyframes shimmerMove {
  0% { transform: translateX(-100%); opacity: 0.4; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0.4; }
}`;
document.head.appendChild(shimmerStyle);

// ===== 4. BUTTON EFFECTS =====
const heroBtns = document.querySelectorAll(".hero-btn");
function glowButtons() {
    heroBtns.forEach(btn => {
        btn.classList.add("light-effect");
        setTimeout(() => btn.classList.remove("light-effect"), 1200);
    });
}
setInterval(glowButtons, 3000);

// ===== 5. TEXT SHAKE =====
function shakeText() {
    [heroTitle, heroSubtitle].forEach(el => {
        el.style.transition = "transform 0.2s ease";
        el.style.transform = "translateX(5px)";
        setTimeout(() => el.style.transform = "translateX(-5px)", 100);
        setTimeout(() => el.style.transform = "translateX(0)", 200);
    });
}
setInterval(shakeText, 6000);

// ===== 6. AUTO BACKGROUND DECOR =====
const heroBackground = document.querySelector(".hero-background");
if (heroBackground) {
    const foodIcons = ["☕", "🍕", "🥐", "🍰", "🥞", "🍩", "🍪", "🍧"];
    for (let i = 0; i < 15; i++) {
        const div = document.createElement("div");
        div.className = "food-decor";
        div.textContent = foodIcons[Math.floor(Math.random() * foodIcons.length)];
        Object.assign(div.style, {
            position: "absolute",
            fontSize: `${Math.random() * 25 + 20}px`,
            opacity: 0.2 + Math.random() * 0.4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(1px)",
            userSelect: "none",
            transition: "transform 12s ease-in-out"
        });
        heroBackground.appendChild(div);
    }

    setInterval(() => {
        document.querySelectorAll(".food-decor").forEach(el => {
            el.style.transform = `translateY(${Math.random() * 20 - 10}px) translateX(${Math.random() * 10 - 5}px)`;
        });
    }, 4000);
}

// ===== 7. SPARKLE EFFECT =====
const sparkleLayer = document.querySelector(".hero-luxury-glow");
if (sparkleLayer) {
    for (let i = 0; i < 30; i++) {
        const sp = document.createElement("div");
        sp.className = "sparkle";
        Object.assign(sp.style, {
            position: "absolute",
            width: "3px",
            height: "3px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: "50%",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0,
            animation: `sparkleAnim ${2 + Math.random() * 3}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 2}s`
        });
        sparkleLayer.appendChild(sp);
    }
    const sparkleStyle = document.createElement("style");
    sparkleStyle.textContent = `
    @keyframes sparkleAnim {
      0%,100% {opacity:0; transform:scale(0.5);}
      50% {opacity:1; transform:scale(1.2);}
    }`;
    document.head.appendChild(sparkleStyle);
}

// ===== 8. MOUSE PARALLAX =====
document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    heroTitle.style.transform = `translate(${x / 4}px, ${y / 4}px)`;
    heroSubtitle.style.transform = `translate(${x / 6}px, ${y / 6}px)`;
});

// ===== 9. RESPONSIVE =====
function adjustMobile() {
    if (window.innerWidth < 768) {
        heroTitle.style.fontSize = "3rem";
        heroSubtitle.style.fontSize = "1.2rem";
    } else {
        heroTitle.style.fontSize = "5rem";
        heroSubtitle.style.fontSize = "1.6rem";
    }
}
window.addEventListener("resize", adjustMobile);
adjustMobile();
