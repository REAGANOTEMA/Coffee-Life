const whatsappFloat = document.querySelector(".whatsapp-float");
const whatsappModal = document.querySelector(".whatsapp-modal");
const whatsappClose = document.querySelector(".close-whatsapp");
const whatsappSendBtn = document.querySelector(".btn-whatsapp-send");
const cartPreview = document.querySelector(".whatsapp-cart-preview");
const qrBtn = document.querySelector(".qr-btn");

// Your WhatsApp number
const WA_PHONE = "+256772514889";

// Floating modal toggle
whatsappFloat.addEventListener("click", () => whatsappModal.classList.toggle("active"));
whatsappClose.addEventListener("click", () => whatsappModal.classList.remove("active"));

// ===== Cart System =====
let cart = [];

// Add buttons
document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", e => {
        const itemEl = e.target.closest(".menu-item");
        const name = itemEl.dataset.name;
        const price = parseInt(itemEl.dataset.price);
        const existing = cart.find(i => i.name === name);
        if (existing) existing.qty += 1;
        else cart.push({ name, price, qty: 1 });
        updateCartPreview();
        updateQRLink();
    });
});

// Update cart preview in modal
function updateCartPreview() {
    cartPreview.innerHTML = "";
    if (cart.length === 0) {
        cartPreview.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }
    cart.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <span class="name">${item.name}</span>
            <button class="qty-btn" data-action="minus" data-name="${item.name}">-</button>
            <span class="qty">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-name="${item.name}">+</button>
            <span class="price">${item.price * item.qty} UGX</span>
        `;
        cartPreview.appendChild(div);
    });
    // Add quantity button events
    cartPreview.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const action = e.target.dataset.action;
            const name = e.target.dataset.name;
            const item = cart.find(i => i.name === name);
            if (action === "plus") item.qty += 1;
            else if (action === "minus") {
                item.qty -= 1;
                if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
            }
            updateCartPreview();
            updateQRLink();
        });
    });
}

// Generate WhatsApp message with order + location prompt
function generateMessage() {
    if (cart.length === 0) return "Hello Coffee Life! I would like to place an order. My location is: ";
    let msg = "Hello Coffee Life! I'd like to place an order:\n";
    let total = 0;
    cart.forEach((item, index) => {
        msg += `${index + 1}. ${item.name} x${item.qty} - ${item.price * item.qty} UGX\n`;
        total += item.qty * item.price;
    });
    msg += `Total: ${total} UGX\n`;
    msg += "My location is: [Please provide your location here]\nContact: [Your phone number]";
    return msg;
}

// Send cart via WhatsApp
whatsappSendBtn.addEventListener("click", () => {
    const message = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/${WA_PHONE}?text=${message}`, "_blank");
});

// Update footer QR link
function updateQRLink() {
    const message = encodeURIComponent(generateMessage());
    qrBtn.href = `https://wa.me/${WA_PHONE}?text=${message}`;
}

// Initialize
updateCartPreview();
updateQRLink();
const cart = [];

// Add-to-cart logic
document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", e => {
        const item = e.target.closest(".menu-item");
        const id = item.dataset.id;
        const name = item.dataset.name;
        const price = item.dataset.price;
        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty++;
        else cart.push({ id, name, price, qty: 1 });
        alert(`${name} added to your order!`);
    });
});

// WhatsApp modal
const whatsappFloat = document.querySelector(".whatsapp-float");
const whatsappModal = document.querySelector(".whatsapp-modal");
const whatsappClose = document.querySelector(".close-whatsapp");
const whatsappSendBtn = document.querySelector(".btn-whatsapp-send");

whatsappFloat.addEventListener("click", () => whatsappModal.classList.toggle("active"));
whatsappClose.addEventListener("click", () => whatsappModal.classList.remove("active"));

// Send order to WhatsApp
whatsappSendBtn.addEventListener("click", () => {
    const phone = "+256772514889";
    const location = prompt("Please enter your delivery location:");
    if (!location) return alert("Location is required for delivery!");

    let message = `Hello Coffee Life! I want to place an order.\nLocation: ${location}\n\nOrder Details:\n`;
    cart.forEach(i => message += `${i.name} x${i.qty} - ${i.price} UGX\n`);

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
});
