// ===== MENU JS =====

// Example menu items
const menuItems = {
    food: [
        { id: 1, name: "Grilled Chicken", price: 25000, description: "Juicy grilled chicken with herbs" },
        { id: 2, name: "Veggie Pasta", price: 18000, description: "Fresh vegetables with creamy pasta" },
        { id: 3, name: "Beef Burger", price: 22000, description: "Tender beef burger with cheese" }
    ],
    drinks: [
        { id: 4, name: "Cappuccino", price: 12000, description: "Rich and creamy coffee" },
        { id: 5, name: "Fresh Juice", price: 8000, description: "Freshly squeezed seasonal fruit juice" },
        { id: 6, name: "Green Tea", price: 6000, description: "Organic green tea for refreshment" }
    ],
    coffee: [
        { id: 7, name: "Espresso", price: 10000, description: "Strong and bold espresso shot" },
        { id: 8, name: "Latte", price: 13000, description: "Smooth latte with milk foam" },
        { id: 9, name: "Mocha", price: 15000, description: "Chocolate flavored coffee delight" }
    ]
};

// DOM elements
const menuContainer = document.getElementById('menu-container');
const menuButtons = document.querySelectorAll('.menu-btn');

// Function to render menu items
function renderMenu(category) {
    menuContainer.innerHTML = ''; // Clear previous menu
    const items = menuItems[category];

    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('menu-card', 'animate-on-scroll');

        card.innerHTML = `
            <h3>${item.name}</h3>
            <p class="menu-desc">${item.description}</p>
            <p class="menu-price">UGX ${item.price}</p>
            <button class="add-to-cart-btn">Add to Cart</button>
        `;

        // Add click event to add to cart
        card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            addToCart(item);
        });

        menuContainer.appendChild(card);
    });
}

// Initialize with food menu
renderMenu('food');

// Menu category buttons
menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        renderMenu(category);

        // Active button styling
        menuButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Scroll animation for menu cards
window.addEventListener('scroll', () => {
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    scrollElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < window.innerHeight - 100) {
            el.classList.add('scrolled');
        }
    });
});
