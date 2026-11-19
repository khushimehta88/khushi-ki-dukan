/* ============================================================
   KHUSHI KI DUKAN - JavaScript Storefront Logic
   ============================================================ */

// Product Catalog
const products = [
  { id: 1, name: "Purple Summer Dress", category: "Women", price: 1299, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500" },
  { id: 2, name: "Classic White Shirt", category: "Men", price: 899, image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?w=500" },
  { id: 3, name: "Stylish Sneakers", category: "Shoes", price: 1599, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" },
  { id: 4, name: "Luxury Handbag", category: "Accessories", price: 1999, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" },
  { id: 5, name: "Women Casual Outfit", category: "Women", price: 1499, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500" },
  { id: 6, name: "Men Casual Jacket", category: "Men", price: 1799, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" },
  { id: 7, name: "Fashion Heels", category: "Shoes", price: 1199, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500" },
  { id: 8, name: "Elegant Sunglasses", category: "Accessories", price: 699, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500" }
];

// App State
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("khushiKiDukanCart") || localStorage.getItem("purpleVogueCart")) || [];
  if (!Array.isArray(cart)) cart = [];
} catch (e) {
  console.warn("Could not parse saved cart data, resetting to empty cart.", e);
  cart = [];
}

let currentCategory = "All";
let searchText = "";
let toastTimeout = null;

// ============================================================
// Product Display & Filtering
// ============================================================
function displayProducts() {
  const productList = document.getElementById("productList");
  if (!productList) return;

  const filtered = products.filter(product => {
    const matchCategory = currentCategory === "All" || product.category === currentCategory;
    const matchSearch = product.name.toLowerCase().includes(searchText) ||
                        product.category.toLowerCase().includes(searchText);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    productList.innerHTML = '<p class="no-results">No products found matching your criteria.</p>';
    return;
  }

  const html = filtered.map(product => `
    <div class="product-card">
      <img src="${product.image}" 
           alt="${product.name}" 
           loading="lazy" 
           onerror="this.src='https://placehold.co/400x400?text=Fashion'">
      <div class="product-info">
        <p class="category-name">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="price">₹${product.price.toLocaleString("en-IN")}</p>
        <button class="add-btn" onclick="addToCart(${product.id})">ADD TO CART +</button>
      </div>
    </div>
  `).join("");

  productList.innerHTML = html;
}

function filterCategory(category, button) {
  currentCategory = category;

  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));

  if (button) {
    button.classList.add("active");
  } else {
    document.querySelectorAll(".filter-btn").forEach(btn => {
      if (btn.textContent.trim().toLowerCase() === category.toLowerCase()) {
        btn.classList.add("active");
      }
    });
  }

  displayProducts();

  const shopSection = document.getElementById("shop");
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Search Input Listener
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", e => {
    searchText = e.target.value.toLowerCase().trim();
    displayProducts();
  });
}

// ============================================================
// Cart Operations
// ============================================================
function saveCart() {
  localStorage.setItem("khushiKiDukanCart", JSON.stringify(cart));
  updateCart();
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: id, quantity: 1 });
  }

  saveCart();
  showToast(`Added "${product.name}" to cart! 🛍`);
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartItems || !cartCount || !cartTotal) return;

  let total = 0;
  let count = 0;
  const validItems = [];

  const itemsHtml = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";

    validItems.push(item);
    total += product.price * item.quantity;
    count += item.quantity;

    return `
      <div class="cart-item">
        <img src="${product.image}" 
             alt="${product.name}" 
             onerror="this.src='https://placehold.co/100x100?text=Fashion'">
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <p class="item-price">₹${product.price.toLocaleString("en-IN")}</p>
          <div class="quantity">
            <button onclick="changeQuantity(${product.id}, -1)" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeQuantity(${product.id}, 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${product.id})">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  // Sync cart array in case any stale items were filtered out
  if (validItems.length !== cart.length) {
    cart = validItems;
    localStorage.setItem("khushiKiDukanCart", JSON.stringify(cart));
  }

  cartItems.innerHTML = itemsHtml || '<p class="cart-empty">Your cart is empty! 🛍</p>';
  cartCount.textContent = count;
  cartTotal.textContent = "₹" + total.toLocaleString("en-IN");
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

// Drawer Controls
function openCart() {
  document.getElementById("cartPanel")?.classList.add("show");
  document.getElementById("overlay")?.classList.add("show");
}

function closeCart() {
  document.getElementById("cartPanel")?.classList.remove("show");
  document.getElementById("overlay")?.classList.remove("show");
}

// ============================================================
// Checkout Modal
// ============================================================
function checkout() {
  if (cart.length === 0) {
    showToast("Your shopping cart is empty!");
    return;
  }

  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const checkoutTotal = document.getElementById("checkoutTotal");
  if (checkoutTotal) {
    checkoutTotal.textContent = "Total: ₹" + total.toLocaleString("en-IN");
  }

  closeCart();
  document.getElementById("checkoutModal")?.classList.add("show");
}

function closeCheckout() {
  document.getElementById("checkoutModal")?.classList.remove("show");
}

// Close checkout modal when clicking backdrop
const checkoutModal = document.getElementById("checkoutModal");
if (checkoutModal) {
  checkoutModal.addEventListener("click", e => {
    if (e.target === checkoutModal) {
      closeCheckout();
    }
  });
}

// Keyboard shortcuts (Esc to close open modals)
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeCart();
    closeCheckout();
  }
});

// Checkout Form Submission
const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (cart.length === 0) return;

    const customerName = document.getElementById("customerName")?.value || "Customer";
    const orderNumber = "KKD" + Date.now().toString().slice(-8);

    alert(`🎉 Order placed successfully!\n\nThank you, ${customerName}!\nOrder ID: ${orderNumber}\n\nThis is a frontend demo. No real payment was processed.`);

    cart = [];
    saveCart();
    this.reset();
    closeCheckout();
  });
}

// ============================================================
// Toast Notification Utility
// ============================================================
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// ============================================================
// Initialization
// ============================================================
displayProducts();
updateCart();
