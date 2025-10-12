/* ===== CART.JS ===== */

const cartBtn = document.querySelector(".cart-btn");
const cartClose = document.querySelector(".cart-close");
const cartContainer = document.querySelector(".cart-container");
const cartItemsContainer = document.querySelector(".cart-items");
const cartOrderBtn = document.querySelector(".cart-order-btn");

let cart = [];

// Open/close cart
cartBtn.addEventListener("click", () => {
    cartContainer.classList.toggle("active");
});
cartClose.addEventListener("click", () => {
    cartContainer.classList.remove("active");
});

// Add item to cart (example)
function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    renderCart();
}

// Remove item
function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
}

// Render cart
function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>UGX ${item.price} x ${item.qty}</p>
      </div>
      <span class="cart-item-remove">&times;</span>
    `;
        div.querySelector(".cart-item-remove").addEventListener("click", () => removeFromCart(item.id));
        cartItemsContainer.appendChild(div);
    });

    document.querySelector(".cart-total").textContent = `Total: UGX ${total.toLocaleString()}`;
}

// Send cart to WhatsApp
cartOrderBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    let message = "Hello Coffee Life! I want to order:\n";
    cart.forEach(i => {
        message += `\n- ${i.name} x ${i.qty} = UGX ${i.price * i.qty}`;
    });
    message += `\n\nTotal: UGX ${cart.reduce((sum, i) => sum + i.price * i.qty, 0)}`;
    const phone = "+256772514889";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
});
