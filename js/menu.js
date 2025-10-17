// ============================
// COFFEE LIFE Menu + WhatsApp + Dynamic Delivery — FINAL 2025
// ============================

const menuData = { /* your menu JSON here */ };

// ===== DOM ELEMENTS =====
const menuContainer = document.getElementById("menu-container");
const menuButtons = document.querySelectorAll(".menu-cat, .menu-btn");
const cartPreview = document.querySelector(".cart-items");
const deliverySelect = document.getElementById("delivery-zone");
const orderNowBtn = document.querySelector(".cart-order-btn");

window.cart = window.cart || [];

// ===== UTILITY FUNCTIONS =====
function formatUGX(amount) {
  return "UGX " + Number(amount).toLocaleString();
}
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

const HQ_LAT = 0.44;
const HQ_LNG = 33.2;

function calculateDistance(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

function getDeliveryCharge(distanceKm){
  return distanceKm<=5?5000:distanceKm<=10?8000:distanceKm<=20?13000:20000;
}

// ===== CART FUNCTIONS =====
function addToCart(item, distanceKm=0){
  const deliveryFee = getDeliveryCharge(distanceKm);
  const existing = window.cart.find(i => i.id === item.id);
  if(existing) existing.qty++;
  else window.cart.push({...item, qty:1, deliveryFee, distanceKm});

  const cartTotal = window.cart.reduce((sum,i) => sum + (i.price*i.qty + i.deliveryFee*i.qty), 0);
  if(cartTotal > 50000000){
    alert("Cart cannot exceed UGX 50,000,000!");
    if(existing) existing.qty--; else window.cart.pop();
    return;
  }

  updateCartPreview();
  flashAddButton(item.id);
}

function removeFromCart(id){
  window.cart = window.cart.filter(i => i.id !== id);
  updateCartPreview();
}

function updateQty(id, qty){
  const item = window.cart.find(i => i.id === id);
  if(!item) return;
  item.qty = qty;
  if(item.qty <= 0) removeFromCart(id);
  updateCartPreview();
}

// ===== CART PREVIEW =====
function updateCartPreview(){
  if(!cartPreview) return;
  cartPreview.innerHTML = "";
  if(window.cart.length === 0){
    cartPreview.innerHTML = "<p class='cart-empty'>🛒 Your cart is empty.</p>";
    return;
  }

  let subtotal = 0, totalDelivery = 0;
  window.cart.forEach(item => {
    subtotal += item.price*item.qty;
    totalDelivery += item.deliveryFee*item.qty;

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${escapeHtml(item.name)}</h4>
        <p>${formatUGX(item.price)} x ${item.qty}</p>
        <span class="subtotal">${formatUGX(item.price*item.qty)}</span>
      </div>
      <div class="controls">
        <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
        <span class="cart-item-remove" data-id="${item.id}">&times;</span>
      </div>
    `;
    cartPreview.appendChild(div);
  });

  const dynamicDelivery = window.cart.reduce((sum, i) => sum + i.deliveryFee*i.qty, 0);
  const total = subtotal + dynamicDelivery;

  const summary = document.createElement("div");
  summary.classList.add("cart-total");
  summary.innerHTML = `
    <hr>
    <p>Subtotal: <strong>${formatUGX(subtotal)}</strong></p>
    <p>Delivery Fee: <strong>${formatUGX(dynamicDelivery)}</strong></p>
    <p>Total: <strong>${formatUGX(total)}</strong></p>
  `;
  cartPreview.appendChild(summary);

  cartPreview.querySelectorAll(".qty-btn").forEach(btn=>{
    btn.onclick = e => {
      const action = e.target.dataset.action;
      const id = e.target.dataset.id;
      const item = window.cart.find(i => i.id == id);
      if(!item) return;
      if(action === "plus") item.qty++;
      else updateQty(id, item.qty-1);
      updateCartPreview();
    };
  });

  cartPreview.querySelectorAll(".cart-item-remove").forEach(btn=>{
    btn.onclick = e => removeFromCart(e.target.dataset.id);
  });
}

// ===== BUTTON ANIMATION =====
function flashAddButton(itemId){
  const btn = document.querySelector(`.menu-item[data-id="${itemId}"] .btn-add`);
  if(!btn) return;
  btn.classList.add("shake","glow");
  setTimeout(()=>btn.classList.remove("shake"),600);
  setTimeout(()=>btn.classList.remove("glow"),1400);
}

// ===== GENERATE WHATSAPP MESSAGE =====
function generateCartMessage(name, location){
  let msg = `✨ Coffee Life Order ✨\n\n👤 Name: ${name}\n📍 Delivery: ${location}\n\n🛒 Order Details:\n`;
  if(window.cart.length === 0) msg += "No items selected.\n";
  else{
    let subtotal = 0, delivery = 0;
    window.cart.forEach((item, i) => {
      msg += `${i+1}. ${item.name} x${item.qty} - ${formatUGX(item.price*item.qty)}\n`;
      subtotal += item.price*item.qty;
      delivery += item.deliveryFee*item.qty;
    });
    msg += `\n💰 Subtotal: ${formatUGX(subtotal)}`;
    msg += `\n🚚 Delivery Fee: +${formatUGX(delivery)}`;
    msg += `\n📦 Total: ${formatUGX(subtotal + delivery)}`;
  }
  msg += "\n\n💵 Payment before delivery required.";
  msg += "\n☕ Coffee Life — Crafted with Passion, Served with Care.";
  return msg;
}

// ===== SEND CART VIA WHATSAPP =====
function sendCartWhatsApp(){
  if(window.cart.length === 0){ alert("Please add items to your cart!"); return; }
  if(!deliverySelect?.value){ alert("Please select a delivery area from the list!"); return; }

  const name = prompt("Enter your full name:")?.trim();
  if(!name){ alert("Name is required!"); return; }

  const location = deliverySelect.value;
  const msg = generateCartMessage(name, location);
  window.open(`https://wa.me/256772514889?text=${encodeURIComponent(msg)}`, "_blank");

  window.cart = [];
  updateCartPreview();
}

// ===== RENDER MENU ITEMS =====
function renderMenu(category){
  menuContainer.innerHTML = "";
  const items = menuData[category] || [];

  // ===== PERFECT 4x4 GRID =====
  function adjustGrid(){
    const w = window.innerWidth;
    if(w <= 600) menuContainer.style.gridTemplateColumns = "1fr";      // mobile
    else if(w <= 1024) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)"; // tablet
    else menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";  // desktop
  }
  menuContainer.style.display = "grid";
  menuContainer.style.gap = "20px";
  window.addEventListener("resize", adjustGrid);
  adjustGrid();

  items.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("menu-item");
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="menu-media"><img src="${item.img}" alt="${item.name}"></div>
      <div class="menu-body">
        <h4>${escapeHtml(item.name)}</h4>
        <p class="desc">${escapeHtml(item.description)}</p>
        <p class="price">${formatUGX(item.price)}</p>
        <div class="actions">
          <button class="btn-add">Add to Cart</button>
          <button class="btn-whatsapp"><i class="fab fa-whatsapp"></i> Order via WhatsApp</button>
        </div>
      </div>
    `;
    menuContainer.appendChild(card);

    card.querySelector(".btn-add").onclick = () => {
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos => {
          const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, HQ_LAT, HQ_LNG);
          addToCart(item, dist);
        }, () => addToCart(item,0));
      } else addToCart(item,0);
    };
    card.querySelector(".btn-whatsapp").onclick = sendCartWhatsApp;
  });
}

// ===== CATEGORY BUTTONS =====
menuButtons.forEach(btn => {
  btn.onclick = () => {
    renderMenu(btn.dataset.category);
    menuButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

// ===== DELIVERY SELECT CHANGE DYNAMICALLY UPDATES CART =====
if(deliverySelect){
  deliverySelect.onchange = () => {
    window.cart.forEach(item => {
      const distanceMap = { "Zone1": 3, "Zone2": 7, "Zone3": 15, "Zone4": 20 };
      const dist = distanceMap[deliverySelect.value] || 0;
      item.deliveryFee = getDeliveryCharge(dist);
    });
    updateCartPreview();
  };
}

// ===== ORDER BUTTON =====
orderNowBtn?.addEventListener("click", sendCartWhatsApp);

// ===== INITIALIZE =====
renderMenu("food");
updateCartPreview();
