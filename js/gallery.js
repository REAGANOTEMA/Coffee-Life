/* ===== COFFEE LIFE GALLERY JS (FINAL) ===== */

// ===== 1. SCROLL REVEAL ANIMATION =====
const galleryItems = document.querySelectorAll('.gallery-item');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  },
  { threshold: 0.2 }
);

galleryItems.forEach(item => observer.observe(item));

// ===== 2. LIGHTBOX FUNCTIONALITY =====
const allGalleryMedia = document.querySelectorAll('.gallery-item img, .gallery-item video');

const lightbox = document.createElement('div');
lightbox.classList.add('lightbox');
lightbox.innerHTML = `
  <div class="lightbox-content"></div>
  <span class="lightbox-close">&times;</span>
`;
document.body.appendChild(lightbox);

const lightboxContent = lightbox.querySelector('.lightbox-content');
const lightboxClose = lightbox.querySelector('.lightbox-close');

allGalleryMedia.forEach(media => {
  media.addEventListener('click', () => {
    lightbox.classList.add('open');

    if (media.tagName === 'IMG') {
      lightboxContent.innerHTML = `<img src="${media.src}" alt="Expanded view">`;
    } else if (media.tagName === 'VIDEO') {
      const src = media.querySelector('source') ? media.querySelector('source').src : media.src;
      lightboxContent.innerHTML = `<video src="${src}" controls autoplay loop></video>`;
    }
  });
});

// Close lightbox
const closeLightbox = () => {
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
};

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// ===== 3. MOVING VIDEO TEXT ANIMATION LOOP =====
document.querySelectorAll('.video-text h3').forEach(text => {
  text.addEventListener('animationiteration', () => {
    // Smooth restart for infinite animation
    text.style.animation = 'none';
    void text.offsetWidth; // trigger reflow
    text.style.animation = null;
  });
});

// ===== 4. AMBIENT VIDEO SOUND ON HOVER (PREMIUM TOUCH) =====
document.querySelectorAll('.gallery-item video').forEach(video => {
  // Ensure muted autoplay by default
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;

  // Optional café sound overlay (requires separate audio file)
  const audio = new Audio('assets/cafe-ambience.mp3'); 
  audio.loop = true;
  audio.volume = 0.15; // subtle ambiance

  video.addEventListener('mouseenter', () => {
    audio.play().catch(() => {}); // play on hover
  });

  video.addEventListener('mouseleave', () => {
    audio.pause();
  });
});

// ===== 5. TOUCH SUPPORT FOR MOBILE =====
document.addEventListener('touchstart', () => {}, { passive: true });

// ===== 6. OPTIONAL: SMOOTH SCROLL FOR LIGHTBOX MEDIA =====
lightboxContent.addEventListener('wheel', e => {
  e.preventDefault();
  lightboxContent.scrollBy({
    top: e.deltaY,
    behavior: 'smooth'
  });
});
