// ============================
// COFFEE LIFE Menu JS (Final + Auto Layout + 4000 UGX Transport)
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

// ===== Utility =====
function formatUGX(amount) {
  return "UGX " + amount.toLocaleString();
}

// ===== Add to Cart Hook =====
function addToCart(item) {
  // Add 4000 transport charge
  const itemWithTransport = { ...item, price: item.price + 4000 };
  console.log(`Added to cart: ${item.name} (+4000 transport)`);
  if (window.cartAdd) window.cartAdd(itemWithTransport);
}

// ===== Render Menu Items =====
function renderMenu(category) {
  menuContainer.innerHTML = ""; // Clear container
  const items = menuData[category];

  // Set up responsive grid with no empty spaces
  menuContainer.style.display = "grid";
  menuContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
  menuContainer.style.gap = "16px";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("menu-card");

    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="menu-img">
      <div class="menu-info">
        <h4 class="menu-name">${item.name}</h4>
        <p class="menu-desc">${item.description}</p>
        <p class="menu-price">${formatUGX(item.price + 4000)} <span class="fee-note">(+4000 delivery)</span></p>
        <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
      </div>
    `;

    menuContainer.appendChild(card);

    const btn = card.querySelector(".add-to-cart-btn");
    btn.addEventListener("click", () => addToCart(item));

    // ===== Subtle Animations =====
    const shakeDurations = [3000, 4000, 6000];
    setInterval(() => {
      btn.classList.add("shake");
      setTimeout(() => btn.classList.remove("shake"), 600);
    }, shakeDurations[index % shakeDurations.length]);

    setInterval(() => {
      btn.classList.add("glow");
      setTimeout(() => btn.classList.remove("glow"), 1200);
    }, 7000);
  });
}

// ===== Menu Category Buttons =====
menuButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    renderMenu(category);

    menuButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ===== Initialize Default Menu =====
renderMenu("food");

// ===== Responsive Adjustments =====
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  if (width <= 768) {
    menuContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(160px, 1fr))";
  } else if (width <= 1024) {
    menuContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  } else {
    menuContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
  }
});
/* ============================
   menu.js — COFFEE LIFE Menu (Final + Complete)
   ============================ */

(() => {
  // ===== JSON Menu Data =====
  const menuData = {
    food: [
      { id: "food-1", name: "Grilled Chicken Sandwich", price: 18000, description: "Juicy grilled chicken with lettuce and sauce", img: "images/menu/food1.jpg" },
      { id: "food-2", name: "Classic Burger", price: 20000, description: "Beef patty with cheddar, lettuce, tomato and fries", img: "images/menu/food2.jpg" },
      { id: "food-3", name: "Veggie Wrap", price: 15000, description: "Wrap with fresh seasonal vegetables and hummus", img: "images/menu/food3.jpg" },
      { id: "food-4", name: "Spicy Chicken Wings", price: 17000, description: "Crispy wings with spicy sauce", img: "images/menu/food4.jpg" }
    ],
    drinks: [
      { id: "drink-1", name: "Cappuccino", price: 8000, description: "Espresso with steamed milk and foam", img: "images/menu/drink1.jpg" },
      { id: "drink-2", name: "Latte", price: 9000, description: "Smooth blend of espresso and milk", img: "images/menu/drink2.jpg" },
      { id: "drink-3", name: "Cold Brew Coffee", price: 10000, description: "Slow-brewed coffee served chilled", img: "images/menu/drink3.jpg" },
      { id: "drink-4", name: "Fresh Orange Juice", price: 7000, description: "Cold-pressed fresh orange juice", img: "images/menu/drink4.jpg" }
    ],
    desserts: [
      { id: "dessert-1", name: "Chocolate Lava Cake", price: 12000, description: "Rich chocolate cake with molten center", img: "images/menu/dessert1.jpg" },
      { id: "dessert-2", name: "Cheesecake", price: 13000, description: "Creamy cheesecake with strawberry topping", img: "images/menu/dessert2.jpg" }
    ],
    specials: [
      { id: "special-1", name: "Chef’s Special Breakfast", price: 22000, description: "Scrambled eggs, smoked salmon, avocado toast", img: "images/menu/special1.jpg" },
      { id: "special-2", name: "Afternoon Coffee Combo", price: 15000, description: "Choice of coffee with cake or pastry", img: "images/menu/special2.jpg" }
    ],
    coffeeBeans: [
      { id: "bean-1", name: "Arabica Blend", price: 40000, description: "Premium Arabica beans with rich flavor", img: "images/menu/coffee1.jpg" },
      { id: "bean-2", name: "Espresso Roast", price: 38000, description: "Bold, dark roasted espresso beans", img: "images/menu/coffee2.jpg" }
    ]
  };

  // ===== DOM Elements =====
  const menuContainer = document.getElementById("menu-container") || document.querySelector(".menu-grid") || document.createElement("div");
  const menuButtons = document.querySelectorAll(".menu-btn");

  // ===== Utility =====
  function formatUGX(amount) {
    return "UGX " + Number(amount).toLocaleString();
  }

  // ===== Integration hook: calls cartAdd defined in cart.js (if present) =====
  function addToCart(item) {
    console.log("menu.js addToCart:", item.name, item.price);
    if (window.cartAdd) window.cartAdd(item);
    else {
      // fallback for systems without cart.js loaded
      const existing = window.cart?.find(i => i.id === item.id);
      if (existing) existing.qty++;
      else window.cart = window.cart || [], window.cart.push({ ...item, qty: 1 });
      // small notification
      alert(`${item.name} added to cart (local fallback)`);
    }
  }

  // ===== Render Menu Items (fills menuContainer) =====
  function renderMenu(category) {
    menuContainer.innerHTML = ""; // Clear container
    const items = menuData[category] || [];
    if (!items.length) {
      menuContainer.innerHTML = `<p class="menu-empty">No items in this category.</p>`;
      return;
    }

    // build a grid wrapper if not existing
    const grid = document.createElement("div");
    grid.className = "menu-grid";
    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "menu-item";
      card.dataset.id = item.id;
      card.dataset.name = item.name;
      card.dataset.price = item.price;
      card.innerHTML = `
        <div class="menu-media">
          <img src="${item.img}" alt="${escapeHtml(item.name)}">
        </div>
        <div class="menu-body">
          <h4>${escapeHtml(item.name)}</h4>
          <p class="desc">${escapeHtml(item.description)}</p>
          <div class="meta">
            <div class="price">${formatUGX(item.price)}</div>
            <div class="actions">
              <button class="btn-add" data-id="${item.id}" title="Add ${escapeHtml(item.name)}">Add</button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);

      // local add button (also listens in cart.js observer)
      const btn = card.querySelector(".btn-add");
      btn.addEventListener("click", () => addToCart({ id: item.id, name: item.name, price: Number(item.price), img: item.img }));

      // visual animations handled by CSS; optionally add small intervals for glow/shake
      const shakeDurations = [3000, 4000, 6000];
      setInterval(() => {
        btn.classList.add("shake");
        setTimeout(() => btn.classList.remove("shake"), 600);
      }, shakeDurations[index % shakeDurations.length]);

      setInterval(() => {
        btn.classList.add("glow");
        setTimeout(() => btn.classList.remove("glow"), 1200);
      }, 7000);
    });

    menuContainer.appendChild(grid);

    // make the layout fill all spaces — set CSS grid auto-flow implicitly via .menu-grid
    // (styling is in menu.css)
  }

  // ===== Menu Category Buttons =====
  if (menuButtons && menuButtons.length) {
    menuButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category || "food";
        renderMenu(category);
        menuButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  // Initialize default
  renderMenu("food");

  // Responsive adjustments
  window.addEventListener("resize", () => {
    document.querySelectorAll(".menu-card, .menu-item").forEach(card => {
      if (window.innerWidth <= 768) card.style.width = "100%";
      else card.style.width = "";
    });
  });

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  // expose for quick debug
  window.__menuData = menuData;
})();
// ============================
// COFFEE LIFE Menu JS — Final Compact Layout Enhancer
// ============================

(() => {
  const menuContainer = document.getElementById("menu-container");

  // Force smaller cards and 4-per-row layout
  function setGridColumns() {
    const width = window.innerWidth;
    if (width > 1200) {
      menuContainer.style.gridTemplateColumns = "repeat(4, minmax(180px, 1fr))";
      menuContainer.style.gap = "12px";
    } else if (width > 900) {
      menuContainer.style.gridTemplateColumns = "repeat(3, minmax(160px, 1fr))";
      menuContainer.style.gap = "12px";
    } else if (width > 600) {
      menuContainer.style.gridTemplateColumns = "repeat(2, minmax(140px, 1fr))";
      menuContainer.style.gap = "10px";
    } else {
      menuContainer.style.gridTemplateColumns = "1fr";
      menuContainer.style.gap = "10px";
    }
  }

  // Apply staggered animation delays
  function applyAnimationDelays() {
    const items = menuContainer.querySelectorAll(".menu-item, .menu-card");
    items.forEach((item, index) => {
      item.style.animationDelay = `${0.1 * (index + 1)}s`;
      item.style.fontSize = "0.85rem";       // Smaller text
      item.style.padding = "0.6rem";         // Reduced padding
    });
  }

  // Animate items
  function animateMenuItems() {
    const items = menuContainer.querySelectorAll(".menu-item, .menu-card");
    items.forEach((item, index) => {
      setTimeout(() => item.classList.add("show"), index * 100);
    });
  }

  // Hook into existing renderMenu
  const originalRenderMenu = window.renderMenu || function(){};
  window.renderMenu = function(category) {
    originalRenderMenu(category);
    setGridColumns();
    applyAnimationDelays();
    animateMenuItems();
  };

  // Initial setup
  setGridColumns();
  applyAnimationDelays();
  animateMenuItems();

  // Reapply on resize
  window.addEventListener("resize", () => {
    setGridColumns();
    applyAnimationDelays();
  });
})();
/* ============================
   COFFEE LIFE – 4x4 Premium Menu JS (Final Professional)
   ============================ */
(() => {
  const menuContainer = document.getElementById("menu-container");
  if (!menuContainer) return;

  // ===== Combine all menu items =====
  const allItems = [].concat(
    menuData.food || [],
    menuData.drinks || [],
    menuData.desserts || [],
    menuData.specials || [],
    menuData.coffeeBeans || []
  );

  // ===== Fill to 16 items for 4x4 grid =====
  while (allItems.length < 16) {
    const copyItem = { ...allItems[allItems.length % allItems.length] };
    copyItem.id += "-dup" + allItems.length;
    allItems.push(copyItem);
  }

  // ===== Render the grid =====
  function renderGrid() {
    menuContainer.innerHTML = "";
    menuContainer.style.display = "grid";
    menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
    menuContainer.style.gridAutoRows = "auto";
    menuContainer.style.gap = "16px";
    menuContainer.style.justifyItems = "center";
    menuContainer.style.alignItems = "start";
    menuContainer.style.marginTop = "2rem";

    allItems.slice(0,16).forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "menu-item";
      card.style.width = "100%";
      card.style.maxWidth = "220px";
      card.style.fontSize = "0.85rem";
      card.style.padding = "0.6rem";
      card.style.borderRadius = "14px";
      card.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
      card.style.transition = "all 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.animation = `fadeInUp 0.8s forwards`;
      card.style.animationDelay = `${0.05*index}s`;

      card.innerHTML = `
        <div class="menu-media">
          <img src="${item.img}" alt="${item.name}" style="width:100%; height:160px; object-fit:cover; border-radius:12px 12px 0 0; transition: transform 0.4s;">
        </div>
        <div class="menu-info">
          <h4>${item.name}</h4>
          <p class="desc">${item.description}</p>
          <div class="price">UGX ${(item.price+4000).toLocaleString()} <span style="font-size:0.75rem; color:#a8844f;">(+4000 delivery)</span></div>
          <button class="btn-add" data-id="${item.id}">Add</button>
        </div>
      `;
      menuContainer.appendChild(card);

      // ===== Add button handler =====
      const btn = card.querySelector(".btn-add");
      btn.addEventListener("click", () => {
        if(window.cartAdd) window.cartAdd({...item, price: item.price+4000});
        else alert(`${item.name} added to cart (+4000 delivery)`);
      });

      // Hover image scale
      const img = card.querySelector("img");
      card.addEventListener("mouseenter", () => img.style.transform = "scale(1.05)");
      card.addEventListener("mouseleave", () => img.style.transform = "scale(1)");
    });
  }

  // ===== Fade-in keyframes =====
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    @keyframes fadeInUp {
      0% { opacity:0; transform:translateY(20px); }
      100% { opacity:1; transform:translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);

  // ===== Initial render =====
  renderGrid();

  // ===== Responsive adjustments =====
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    if(width <= 600) menuContainer.style.gridTemplateColumns = "1fr";
    else if(width <= 900) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    else if(width <= 1200) menuContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
    else menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
  });
})();
