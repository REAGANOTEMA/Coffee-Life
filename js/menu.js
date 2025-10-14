// ============================
// COFFEE LIFE Menu JS (Final + Complete)
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
  console.log("Added to cart:", item.name, item.price);
  if (window.cartAdd) window.cartAdd(item); // Integration hook for cart.js
}

// ===== Render Menu Items =====
function renderMenu(category) {
  menuContainer.innerHTML = ""; // Clear container
  const items = menuData[category];

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("menu-card");

    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="menu-img">
      <div class="menu-info">
        <h4 class="menu-name">${item.name}</h4>
        <p class="menu-desc">${item.description}</p>
        <p class="menu-price">${formatUGX(item.price)}</p>
        <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
      </div>
    `;

    menuContainer.appendChild(card);

    const btn = card.querySelector(".add-to-cart-btn");
    btn.addEventListener("click", () => addToCart(item));

    // ===== Shake Animation =====
    const shakeDurations = [3000, 4000, 6000]; // ms
    setInterval(() => {
      btn.classList.add("shake");
      setTimeout(() => btn.classList.remove("shake"), 600);
    }, shakeDurations[index % shakeDurations.length]);

    // ===== Glow Animation =====
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

// ===== Mobile & Responsive Adjustments =====
window.addEventListener("resize", () => {
  const cards = document.querySelectorAll(".menu-card");
  cards.forEach(card => {
    if (window.innerWidth <= 768) card.style.width = "100%";
    else card.style.width = "calc(25% - 16px)";
  });
});
