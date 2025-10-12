/* === FOOTER.JS - Luxurious & Interactive Footer === */

// Select footer elements for animation
const footerInner = document.querySelector('.footer-inner');
const footerCredit = document.querySelector('.footer-credit');

// Intersection Observer for fade-in on scroll
const footerObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1 }
);

if (footerInner) footerObserver.observe(footerInner);
if (footerCredit) footerObserver.observe(footerCredit);

// Social icon hover animations
const socialLinks = document.querySelectorAll('.footer-socials a');
socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'scale(1.2) rotate(10deg)';
        link.style.transition = 'all 0.4s ease';
    });
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Optional: Smooth scroll to top when clicking brand name
const footerBrand = document.querySelector('.footer-brand h3');
if (footerBrand) {
    footerBrand.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Optional: Animate radial background swirl (CSS handles main animation)
