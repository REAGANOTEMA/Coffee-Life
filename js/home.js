/* =========================================
   HOME.JS - FINAL, ULTRA PREMIUM, STATIC HEADER
   ========================================= */

/* ===== 1. HEADER SCROLL EFFECT ===== */
const header = document.querySelector("header");
function handleHeaderScroll() {
    if(window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
}
window.addEventListener("scroll", handleHeaderScroll);
handleHeaderScroll();

/* ===== 2. HAMBURGER MENU TOGGLE ===== */
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
});

/* ===== 3. MOBILE LINK CLICK CLOSE MENU ===== */
const mobileLinks = document.querySelectorAll(".mobile-link");
mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
    });
});

/* ===== 4. NAV LINK HOVER EFFECT ===== */
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
        link.style.color = "var(--gold)";
    });
    link.addEventListener("mouseleave", () => {
        link.style.color = "var(--coffee)";
    });
});

/* ===== 5. NAV LINK SHAKE ANIMATION EVERY 5s ===== */
setInterval(() => {
    navLinks.forEach(link => {
        link.style.animation = "shake 0.5s";
        setTimeout(() => link.style.animation = "", 500);
    });
}, 5000);

/* ===== 6. NAV LINK LIGHT-UP ANIMATION EVERY 6s ===== */
setInterval(() => {
    navLinks.forEach(link => {
        link.style.animation = "lightUp 1s";
        setTimeout(() => link.style.animation = "", 1000);
    });
}, 6000);

/* ===== 7. RESPONSIVE HERO FONT SIZES (OPTIONAL IF YOU HAVE HERO TEXT) ===== */
function adjustHeroFonts(){
    const heroTitle = document.querySelector(".hero-title-text");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const heroNote = document.querySelector(".hero-note");

    if(heroTitle && heroSubtitle && heroNote){
        if(window.innerWidth < 768){
            heroTitle.style.fontSize = "3.5rem";
            heroSubtitle.style.fontSize = "1.5rem";
            heroNote.style.fontSize = "1rem";
        } else {
            heroTitle.style.fontSize = "5rem";
            heroSubtitle.style.fontSize = "2rem";
            heroNote.style.fontSize = "1.2rem";
        }
    }
}
window.addEventListener("resize", adjustHeroFonts);
adjustHeroFonts();
