// ============================
// Footer JS: WhatsApp + QR + Year
// ============================

// Set current year
document.getElementById("year").textContent = new Date().getFullYear();

// WhatsApp button under QR in footer
const whatsappBtnFooter = document.querySelector(".btn-whatsapp-send-footer");

whatsappBtnFooter?.addEventListener("click", () => {
    const name = prompt("Please enter your name:");
    if (!name) return alert("Name is required!");

    const location = prompt("Please enter your delivery location:");
    if (!location) return alert("Location is required for delivery!");

    const message = `Hello Coffee Life ☕! I'm ${name}.\nDelivery Location: ${location}\nI'd like to place an order.`;
    const phone = "256772514889";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
});

// QR code link dynamically updates to menu section
const qrBtn = document.querySelector(".qr-btn");
qrBtn?.setAttribute("href", "https://reaganotema.github.io/Coffee-Life/#menu");
