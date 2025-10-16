// ============================
// COFFEE LIFE Menu JS — Final + Dynamic Delivery Based on Location
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

// ===== Utilities =====
function formatUGX(amount){ return "UGX " + Number(amount).toLocaleString(); }
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ===== Coffee Life HQ Coordinates =====
const HQ_LAT = 0.44;  // Jinja Roundabout
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

// ===== Delivery Fee Based on Distance =====
function getDeliveryCharge(distanceKm){ return Math.ceil(distanceKm)*1000; } // 1000 UGX/km

// ===== Add Item to Cart =====
function addToCart(item, distanceKm=0){
  const deliveryFee = getDeliveryCharge(distanceKm);
  window.cart = window.cart || [];
  const existing = window.cart.find(i => i.id===item.id);
  if(existing) existing.qty = (existing.qty||1)+1;
  else window.cart.push({...item, qty:1});
  if(window.cartUpdateDistance) window.cartUpdateDistance(distanceKm);
  flashAddButton(item.id);
}

// ===== Animations for Add Buttons =====
function flashAddButton(itemId){
  const btn=document.querySelector(`.menu-item[data-id="${itemId}"] .btn-add`);
  if(!btn) return;
  btn.classList.add("shake","glow");
  setTimeout(()=>btn.classList.remove("shake"),600);
  setTimeout(()=>btn.classList.remove("glow"),1400);
}

// ===== Render Menu =====
function renderMenu(category){
  menuContainer.innerHTML="";
  const items = menuData[category] || [];
  menuContainer.style.display="grid";
  menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(250px,1fr))";
  menuContainer.style.gap="16px";

  items.forEach((item,index)=>{
    const card = document.createElement("div");
    card.classList.add("menu-item");
    card.dataset.id = item.id;
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

    const btnAdd = card.querySelector(".btn-add");
    const btnWA = card.querySelector(".btn-whatsapp");

    // Add to Cart
    btnAdd.addEventListener("click",()=>{
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
          const distanceKm = calculateDistance(pos.coords.latitude,pos.coords.longitude,HQ_LAT,HQ_LNG);
          addToCart(item,distanceKm);
        }, ()=>addToCart(item,0));
      } else addToCart(item,0);
    });

    // Order via WhatsApp
    btnWA.addEventListener("click", async ()=>{
      let distanceKm = 0;
      if(navigator.geolocation){
        try{
          const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000}));
          distanceKm = calculateDistance(pos.coords.latitude,pos.coords.longitude,HQ_LAT,HQ_LNG);
        } catch(e){}
      }
      const deliveryFee = getDeliveryCharge(distanceKm);
      const total = item.price + deliveryFee;
      const message = `☕ *Coffee Life Order*\n\nItem: ${item.name}\nPrice: ${formatUGX(item.price)}\nDelivery Fee: ${formatUGX(deliveryFee)}\nTotal: ${formatUGX(total)}\n\nPlease deliver to my location!`;
      window.open(`https://wa.me/256772514889?text=${encodeURIComponent(message)}`,"_blank");
    });

    // Shake / Glow Animations every 4s
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

// ===== Initialize Default Menu =====
renderMenu("food");

// ===== Responsive Grid Adjustment =====
window.addEventListener("resize",()=>{
  const w = window.innerWidth;
  if(w<=480) menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(140px,1fr))";
  else if(w<=768) menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(160px,1fr))";
  else if(w<=1024) menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(220px,1fr))";
  else menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(250px,1fr))";
});
