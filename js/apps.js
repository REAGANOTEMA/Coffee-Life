// PWA Install Prompt
let deferredPrompt;
const installBtn = document.createElement('button');
installBtn.textContent = 'Install CoffeeLife App';
installBtn.className = 'btn';
installBtn.style.position = 'fixed';
installBtn.style.bottom = '80px';
installBtn.style.right = '20px';
installBtn.style.zIndex = '1000';
installBtn.style.display = 'none';
document.body.appendChild(installBtn);

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    installBtn.style.display = 'none';
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        deferredPrompt = null;
        console.log('User choice:', choiceResult.outcome);
    }
});

// Optional: Smooth Scroll for anchor links (already handled via CSS, but JS fallback)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
// WhatsApp Floating Button
const whatsappBtn = document.querySelector('.whatsapp-btn');
if(whatsappBtn){
    whatsappBtn.addEventListener('click', () => {
        // Replace with your WhatsApp number in international format
        const phone = '2567XXXXXXXX'; 
        const message = encodeURIComponent('Hello CoffeeLife, I want to place an order.');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
}
