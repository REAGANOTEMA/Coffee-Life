// ============================
// COFFEE LIFE Menu + WhatsApp + Dynamic Delivery — Final 2025
// ============================

// ===== JSON Menu Data =====
const menuData = {
  food: [
    { id: 1, name: "Grilled Chicken Sandwich", price: 18000, description: "Juicy grilled chicken with lettuce and sauce", img: "images/menu/food1.jpg" },
    { id: 2, name: "Classic Burger", price: 20000, description: "Beef patty with cheddar, lettuce, tomato and fries", img: "images/menu/food2.jpg" },
    { id: 3, name: "Veggie Wrap", price: 15000, description: "Wrap with fresh seasonal vegetables and hummus", img: "images/menu/food3.jpg" },
    { id: 14, name: "Spicy Chicken Wings", price: 17000, description: "Crispy wings with spicy sauce", img: "images/menu/food4.jpg" }
  ],
  drinks: [
    { id: 4, name: "Cappuccino", price: 8000, description: "Espresso with steamed milk and foam", img: "images/menu/drink1.jpg" },
    { id: 5, name: "Latte", price: 9000, description: "Smooth blend of espresso and milk", img: "images/menu/drink2.jpg" },
    { id: 6, name: "Cold Brew Coffee", price: 10000, description: "Slow-brewed coffee served chilled", img: "images/menu/drink3.jpg" },
    { id: 7, name: "Fresh Orange Juice", price: 7000, description: "Cold-pressed fresh orange juice", img: "images/menu/drink4.jpg" },
    { id: 15, name: "Green Tea Latte", price: 9500, description: "Smooth green tea with milk foam", img: "images/menu/drink5.jpg" }
  ],
  desserts: [
    { id: 8, name: "Chocolate Lava Cake", price: 12000, description: "Rich chocolate cake with molten center", img: "images/menu/dessert1.jpg" },
    { id: 9, name: "Cheesecake", price: 13000, description: "Creamy cheesecake with strawberry topping", img: "images/menu/dessert2.jpg" },
    { id: 16, name: "Tiramisu", price: 14000, description: "Classic Italian coffee-flavored dessert", img: "images/menu/dessert3.jpg" }
  ],
  specials: [
    { id: 10, name: "Chef’s Special Breakfast", price: 22000, description: "Scrambled eggs, smoked salmon, avocado toast", img: "images/menu/special1.jpg" },
    { id: 11, name: "Afternoon Coffee Combo", price: 15000, description: "Choice of coffee with cake or pastry", img: "images/menu/special2.jpg" }
  ],
  coffeeBeans: [
    { id: 12, name: "Arabica Blend", price: 40000, description: "Premium Arabica beans with rich flavor", img: "images/menu/coffee1.jpg" },
    { id: 13, name: "Espresso Roast", price: 38000, description: "Bold, dark roasted espresso beans", img: "images/menu/coffee2.jpg" }
  ]
};

// ===== DOM Elements =====
const menuContainer = document.getElementById("menu-container");
const menuButtons = document.querySelectorAll(".menu-btn");
const cartPreview = document.querySelector(".whatsapp-cart-preview");

// ===== Utilities =====
function formatUGX(amount){ return "UGX " + Number(amount).toLocaleString(); }
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ===== Coffee Life HQ Coordinates =====
const HQ_LAT = 0.44;  
const HQ_LNG = 33.2;

// ===== Haversine Distance =====
function calculateDistance(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

// ===== Delivery Fee =====
function getDeliveryCharge(distanceKm){
  return distanceKm<=5?5000:distanceKm<=10?8000:distanceKm<=20?13000:20000;
}

// ===== Global Cart =====
window.cart = window.cart || [];

// ===== Add to Cart =====
function addToCart(item,distanceKm=0){
  const deliveryFee = getDeliveryCharge(distanceKm);
  const totalPrice = item.price + deliveryFee;
  const existing = window.cart.find(i=>i.id===item.id);
  const cartTotal = window.cart.reduce((sum,i)=>sum.price?sum.price*sum.qty:sum.price,0)+totalPrice;
  if(cartTotal>50000000){ alert("Cart cannot exceed UGX 50,000,000!"); return; }

  if(existing) existing.qty++; 
  else window.cart.push({...item, price: totalPrice, qty:1, deliveryFee, distanceKm});

  updateCartPreview();
  flashAddButton(item.id);
}

// ===== Update Cart Preview =====
function updateCartPreview(){
  if(!cartPreview) return;
  cartPreview.innerHTML="";
  if(window.cart.length===0){ cartPreview.innerHTML="<p class='empty-msg'>🛒 Your cart is empty.</p>"; return; }

  let subtotal=0,totalDelivery=0;
  window.cart.forEach(item=>{
    subtotal += item.price*item.qty - item.deliveryFee*item.qty;
    totalDelivery += item.deliveryFee*item.qty;
    const div=document.createElement("div");
    div.classList.add("item");
    div.innerHTML=`
      <span class="name">${item.name}</span>
      <div class="controls">
        <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
      </div>
      <span class="price">${item.price*item.qty} UGX</span>
      <p class="delivery-fee">Delivery: ${item.deliveryFee*item.qty} UGX</p>
    `;
    cartPreview.appendChild(div);
  });

  const total=subtotal+totalDelivery;
  const summary=document.createElement("div");
  summary.classList.add("summary");
  summary.innerHTML=`
    <hr>
    <p>Subtotal: <strong>${subtotal} UGX</strong></p>
    <p>Total Delivery Fee: <strong>${totalDelivery} UGX</strong></p>
    <p>Total Amount to Pay: <strong>${total} UGX</strong></p>
  `;
  cartPreview.appendChild(summary);

  cartPreview.querySelectorAll(".qty-btn").forEach(btn=>{
    btn.addEventListener("click",e=>{
      const action = e.target.dataset.action;
      const id = parseInt(e.target.dataset.id);
      const item = window.cart.find(i=>i.id===id);
      if(!item) return;
      if(action==="plus") item.qty++;
      else{ item.qty--; if(item.qty<=0) window.cart = window.cart.filter(i=>i.id!==id);}
      updateCartPreview();
    });
  });
}

// ===== Flash Animation =====
function flashAddButton(itemId){
  const btn=document.querySelector(`.menu-item[data-id="${itemId}"] .btn-add`);
  if(!btn) return;
  btn.classList.add("shake","glow");
  setTimeout(()=>btn.classList.remove("shake"),600);
  setTimeout(()=>btn.classList.remove("glow"),1400);
}

// ===== Generate WhatsApp Message =====
function generateCartMessage(name,location){
  let msg=`✨ Coffee Life Order ✨\n\n👤 Name: ${name}\n📍 Delivery: ${location}\n\n🛒 Order Details:\n`;
  if(window.cart.length===0) msg+="No items selected.\n";
  else{
    let subtotal=0,delivery=0;
    window.cart.forEach((item,i)=>{
      msg+=`${i+1}. ${item.name} x${item.qty} - ${item.price*item.qty} UGX\n`;
      subtotal+=item.price*item.qty-item.deliveryFee*item.qty;
      delivery+=item.deliveryFee*item.qty;
    });
    msg+=`\n💰 Subtotal: ${subtotal} UGX`;
    msg+=`\n🚚 Delivery Fee: +${delivery} UGX`;
    msg+=`\n📦 Total: ${subtotal+delivery} UGX`;
  }
  msg+="\n\n💵 Payment before delivery required.";
  msg+="\n☕ Coffee Life — Crafted with Passion, Served with Care.";
  return msg;
}

// ===== Send WhatsApp =====
function sendCartWhatsApp(){
  if(window.cart.length===0){ alert("Please add items to your cart before proceeding!"); return; }
  const name=prompt("Enter your name:")?.trim(); if(!name){ alert("Name is required!"); return; }
  const location=prompt("Enter your delivery location:")?.trim(); if(!location){ alert("Location is required!"); return; }
  const msg=generateCartMessage(name,location);
  window.open(`https://wa.me/256772514889?text=${encodeURIComponent(msg)}`,"_blank");
}

// ===== Render Menu =====
function renderMenu(category){
  menuContainer.innerHTML="";
  const items=menuData[category]||[];
  menuContainer.style.display="grid";
  menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(250px,1fr))";
  menuContainer.style.gap="16px";

  items.forEach(item=>{
    const card=document.createElement("div");
    card.classList.add("menu-item");
    card.dataset.id=item.id;
    card.innerHTML=`
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

    const btnAdd=card.querySelector(".btn-add");
    const btnWA=card.querySelector(".btn-whatsapp");

    btnAdd.addEventListener("click",()=>{
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
          const dist=calculateDistance(pos.coords.latitude,pos.coords.longitude,HQ_LAT,HQ_LNG);
          addToCart(item,dist);
        },()=>addToCart(item,0));
      } else addToCart(item,0);
    });

    btnWA.addEventListener("click",async ()=>{
      if(window.cart.length===0) return alert("Please add items to your cart first!");
      let distanceKm=0;
      if(navigator.geolocation){
        try{ const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000})); distanceKm=calculateDistance(pos.coords.latitude,pos.coords.longitude,HQ_LAT,HQ_LNG); }catch(e){}
      }
      const message=generateCartMessage("Customer","Current Location");
      window.open(`https://wa.me/256772514889?text=${encodeURIComponent(message)}`,"_blank");
    });

    setInterval(()=>{ btnAdd.classList.add("shake"); setTimeout(()=>btnAdd.classList.remove("shake"),600); },4000);
    setInterval(()=>{ btnAdd.classList.add("glow"); setTimeout(()=>btnAdd.classList.remove("glow"),1200); },4000);
  });
}

// ===== Menu Category Buttons =====
menuButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    renderMenu(btn.dataset.category);
    menuButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ===== Initialize =====
renderMenu("food");

// ===== Responsive Adjustment =====
window.addEventListener("resize",()=>{
  const w=window.innerWidth;
  if(w<=480) menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(140px,1fr))";
  else if(w<=768) menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(160px,1fr))";
  else if(w<=1024) menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(220px,1fr))";
  else menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(250px,1fr))";
});

// ===== Cart Preview Initialization =====
updateCartPreview();
