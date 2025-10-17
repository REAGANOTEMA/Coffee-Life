// ============================
// COFFEE LIFE Cart + WhatsApp (Offline/Online Ready, Final 2025)
// ============================

const WA_PHONE = "256772514889"; 
const DELIVERY_AREAS = {
  "Jinja Town": 2000, "Milo Mbili": 2000, "Walukuba West": 2000,
  "Walukuba East": 3000, "Mafubira": 3000, "Mpumudde": 3000,
  "Bugembe": 3000, "Nile": 3000, "Makerere": 3000,
  "Kira Road": 3000, "Masese": 4000, "Wakitaka": 4000,
  "Namuleesa": 4000
};

let DELIVERY_FEE = 0;
window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");

const cartPreview = document.querySelector(".whatsapp-cart-preview");
const deliverySelect = document.getElementById("delivery-zone");
const orderNowBtn = document.getElementById("orderNow");
const footerOrderBtn = document.getElementById("orderWhatsApp");
const whatsappBtn = document.querySelector(".whatsapp-float");
const allWAButtons = document.querySelectorAll(".btn-whatsapp, .payment-btn, .btn-whatsapp-send");

// ===== Persist Cart =====
function persistCart() {
  localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart));
}

// ===== Add to Cart =====
document.querySelectorAll(".btn-add, .add-to-cart-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const itemEl = e.target.closest(".menu-item, .menu-card");
    if (!itemEl) return;
    const name = itemEl.dataset.name;
    const price = parseInt(itemEl.dataset.price) || 0;
    addToCart(name, price, itemEl);
  });
});

function addToCart(name, price, el = null){
  if (!name) return;
  const existing = window.cart.find(i => i.name === name);
  if (existing) existing.qty++;
  else window.cart.push({ name, price, qty: 1 });

  if(el){
    const btn = el.querySelector(".btn-add");
    if(btn){
      btn.classList.add("shake","glow");
      setTimeout(()=>btn.classList.remove("shake"),600);
      setTimeout(()=>btn.classList.remove("glow"),1400);
    }
  }

  persistCart();
  updateCartPreview();
}

// ===== Update Cart Preview =====
function updateCartPreview(){
  if(!cartPreview) return;
  cartPreview.innerHTML = "";

  if(window.cart.length === 0){
    cartPreview.innerHTML = "<p class='empty-msg'>🛒 Your cart is empty.</p>";
    updateWhatsAppState();
    return;
  }

  let subtotal = 0;
  window.cart.forEach((item, index) => {
    subtotal += item.price * item.qty;
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `
      <span class="name">${index+1}. ${item.name}</span>
      <div class="controls">
        <button class="qty-btn" data-action="minus" data-name="${item.name}">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="plus" data-name="${item.name}">+</button>
      </div>
      <span class="price">${item.price * item.qty} UGX</span>
    `;
    cartPreview.appendChild(div);
  });

  const area = deliverySelect?.value || "";
  DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
  const total = subtotal + DELIVERY_FEE;

  const summary = document.createElement("div");
  summary.classList.add("summary");
  summary.innerHTML = `
    <hr>
    <p>Subtotal: <strong>${subtotal} UGX</strong></p>
    <p>Delivery Fee (${area || 'N/A'}): <strong>${DELIVERY_FEE} UGX</strong></p>
    <p><strong>Total Amount to Pay: ${total} UGX</strong></p>
  `;
  cartPreview.appendChild(summary);

  // Quantity buttons
  cartPreview.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const action = e.target.dataset.action;
      const name = e.target.dataset.name;
      const item = window.cart.find(i => i.name === name);
      if(!item) return;
      if(action === "plus") item.qty++;
      else { item.qty--; if(item.qty <= 0) window.cart = window.cart.filter(i => i.name !== name); }
      persistCart();
      updateCartPreview();
    });
  });

  updateWhatsAppState();
}

// ===== Generate WhatsApp Message =====
function generateCartMessage(name, location, paymentMethod="Cash"){
  let subtotal = window.cart.reduce((acc,i)=>acc + i.price*i.qty,0);
  let total = subtotal + DELIVERY_FEE;
  let message = `✨ *Coffee Life Order* ✨\n\n`;
  message += `👤 *Customer Name:* ${name || "[Your Name]"}\n`;
  message += `📍 *Delivery Area:* ${location || "[Your Location]"}\n`;
  message += `💰 *Payment Method:* ${paymentMethod}\n\n`;
  message += `🛒 *Order Details:*\n`;
  window.cart.forEach((item,i)=>{
    message += `${i+1}. ${item.name} x${item.qty} - ${item.price*item.qty} UGX\n`;
  });
  message += `\n💰 Subtotal: ${subtotal} UGX`;
  message += `\n🚚 Delivery Fee: ${DELIVERY_FEE} UGX`;
  message += `\n📦 Total: ${total} UGX`;
  message += `\n\n☕ Coffee Life — Crafted with Passion, Served with Care`;
  return message;
}

// ===== Order Now Handler =====
function handleOrderNow(paymentMethod="Cash"){
  if(window.cart.length === 0) return alert("Please add items to your cart before ordering!");
  if(!deliverySelect?.value) return alert("Please select a delivery area!");
  const name = prompt("Enter your full name:")?.trim();
  if(!name) return alert("Name is required!");
  const area = deliverySelect.value;
  const msg = generateCartMessage(name, area, paymentMethod);
  window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`,"_blank");
  alert(`✅ Your order of ${window.cart.length} item(s) has been prepared!`);
  window.cart = [];
  persistCart();
  updateCartPreview();
}

// Bind order buttons
[orderNowBtn, footerOrderBtn].forEach(btn=>{
  btn?.addEventListener("click", ()=>handleOrderNow());
});

// Bind all menu WhatsApp buttons
allWAButtons.forEach(btn=>{
  btn.classList.add("shake","glow");
  btn.addEventListener("click", e=>{
    if(window.cart.length === 0){
      e.preventDefault();
      alert("Please add items to your cart before contacting us on WhatsApp!");
    } else {
      const paymentMethod = btn.classList.contains("mtn") ? "MTN Mobile Money" :
                            btn.classList.contains("airtel") ? "Airtel Money" : "Cash";
      handleOrderNow(paymentMethod);
    }
  });
});

// ===== Payment buttons =====
document.querySelectorAll(".payment-btn.mtn, .payment-btn.airtel").forEach(btn=>{
  btn.classList.add("shake","glow");
  btn.addEventListener("click", e=>{
    if(window.cart.length === 0) return alert("Add items to cart first!");
    const paymentMethod = e.target.classList.contains("mtn") ? "MTN Mobile Money" : "Airtel Money";
    handleOrderNow(paymentMethod);
  });
});

// ===== WhatsApp Button State =====
function updateWhatsAppState(){
  if(!whatsappBtn) return;
  if(window.cart.length === 0){
    whatsappBtn.classList.add("disabled","shake","glow");
    whatsappBtn.style.pointerEvents = "none";
    whatsappBtn.title = "Add items to your cart first!";
  } else {
    whatsappBtn.classList.remove("disabled");
    whatsappBtn.style.pointerEvents = "auto";
    whatsappBtn.title = "Chat on WhatsApp";
  }
}

// Disabled WhatsApp click
whatsappBtn?.addEventListener("click", e=>{
  if(whatsappBtn.classList.contains("disabled")){
    e.preventDefault();
    alert("Please add items to your cart before contacting us on WhatsApp!");
  }
});

// ===== INIT =====
updateCartPreview();
