// ===== FOOTER QR JS =====
const menuURL = window.location.origin + "/menu.html";

const footerQRCodeContainer = document.getElementById("footerQRCode");

if (footerQRCodeContainer) {
    new QRCode(footerQRCodeContainer, {
        text: menuURL,
        width: 120,
        height: 120,
        colorDark: "#4b2e1e",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
    });
}

// WhatsApp order button functionality
const whatsappBtn = document.querySelector(".qr-btn");
if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
        window.open(
            "https://wa.me/256772514889?text=Hello%20Coffee%20Life!%20I'd%20like%20to%20see%20the%20menu.",
            "_blank"
        );
    });
}
