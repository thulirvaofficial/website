/* =========================================================
   THULIRVA — MAIN JAVASCRIPT v2.0
========================================================= */

const API = "/api";

/* ---- Premium Mobile Navigation Drawer with Backdrop & Touch Controls ---- */
function initMobileNavigationDrawer() {
    const mobileNav = document.getElementById("mobileNavigation");
    const menuBtn = document.getElementById("mobileMenuButton");
    if (!mobileNav) return;

    // Ensure mobile navigation drawer is a direct child of document.body for correct z-index stacking above backdrop
    if (mobileNav.parentElement !== document.body) {
        document.body.appendChild(mobileNav);
    }

    // Detect if current page is within /pages/ or at root
    const pathname = window.location.pathname.replace(/\\/g, "/");
    const isPages = pathname.includes("/pages/");
    const rootPrefix = isPages ? "../" : "";
    const pagesPrefix = isPages ? "" : "pages/";

    const filename = pathname.split("/").pop() || "index.html";

    // Build the elite mobile drawer layout
    mobileNav.innerHTML = `
        <div class="mobile-nav-drawer-header">
            <div class="mobile-nav-drawer-brand">
                <img src="${rootPrefix}assets/images/logo/logo.jpg" alt="THULIRVA" class="mobile-nav-drawer-logo">
                <div class="mobile-nav-drawer-brand-text">
                    <span class="mobile-nav-drawer-title">THULIRVA</span>
                    <span class="mobile-nav-drawer-subtitle">ROOTED IN NATURE</span>
                </div>
            </div>
            <button class="mobile-nav-drawer-close" id="mobileNavCloseBtn" aria-label="Close navigation menu" title="Close menu">✕</button>
        </div>

        <div class="mobile-nav-trust-banner">
            <span>🌿 Pure Dairy &amp; Agro &bull; Farm Fresh Daily</span>
        </div>

        <div class="mobile-nav-scroll-area">
            <div class="mobile-nav-group-label">EXPLORE &amp; SHOP</div>
            <nav class="mobile-nav-menu-list">
                <a href="${rootPrefix}index.html" class="mobile-nav-link ${filename === 'index.html' || filename === '' ? 'active' : ''}">
                    <span class="nav-link-icon">🏠</span>
                    <span class="nav-link-label">Home</span>
                    <span class="nav-link-chevron">›</span>
                </a>
                <a href="${pagesPrefix}shop.html" class="mobile-nav-link ${filename === 'shop.html' ? 'active' : ''}">
                    <span class="nav-link-icon">🛍️</span>
                    <span class="nav-link-label">Shop</span>
                    <span class="nav-link-chevron">›</span>
                </a>
                <a href="${pagesPrefix}subscriptions.html" class="mobile-nav-link ${filename === 'subscriptions.html' ? 'active' : ''}">
                    <span class="nav-link-icon">🥛</span>
                    <span class="nav-link-label">Subscriptions</span>
                    <span class="nav-link-badge">Daily Morning</span>
                    <span class="nav-link-chevron">›</span>
                </a>
                <a href="${pagesPrefix}about.html" class="mobile-nav-link ${filename === 'about.html' ? 'active' : ''}">
                    <span class="nav-link-icon">🌿</span>
                    <span class="nav-link-label">About Us</span>
                    <span class="nav-link-chevron">›</span>
                </a>
                <a href="${pagesPrefix}farms.html" class="mobile-nav-link ${filename === 'farms.html' ? 'active' : ''}">
                    <span class="nav-link-icon">🐄</span>
                    <span class="nav-link-label">Our Farms</span>
                    <span class="nav-link-chevron">›</span>
                </a>
                <a href="${pagesPrefix}recipes.html" class="mobile-nav-link ${filename === 'recipes.html' ? 'active' : ''}">
                    <span class="nav-link-icon">🍲</span>
                    <span class="nav-link-label">Recipes</span>
                    <span class="nav-link-chevron">›</span>
                </a>
                <a href="${pagesPrefix}contact.html" class="mobile-nav-link ${filename === 'contact.html' ? 'active' : ''}">
                    <span class="nav-link-icon">📞</span>
                    <span class="nav-link-label">Contact Us</span>
                    <span class="nav-link-chevron">›</span>
                </a>
            </nav>

            <div class="mobile-nav-group-label" style="margin-top: 14px;">MY ACCOUNT &amp; CART</div>
            <nav class="mobile-nav-menu-list">
                <a href="${pagesPrefix}account.html" class="mobile-nav-link ${filename === 'account.html' ? 'active' : ''}">
                    <span class="nav-link-icon">👤</span>
                    <span class="nav-link-label">My Orders &amp; Account</span>
                    <span class="nav-link-chevron">›</span>
                </a>
                <a href="${pagesPrefix}cart.html" class="mobile-nav-link ${filename === 'cart.html' ? 'active' : ''}">
                    <span class="nav-link-icon">🛒</span>
                    <span class="nav-link-label">Shopping Cart</span>
                    <span class="nav-link-cart-count" id="drawerCartCount">0</span>
                    <span class="nav-link-chevron">›</span>
                </a>
            </nav>

            <div class="mobile-nav-drawer-footer">
                <a href="tel:9360671533" class="mobile-nav-phone-pill">
                    <span class="phone-pill-icon">📞</span>
                    <div class="phone-pill-text">
                        <span class="phone-pill-title">Doorstep Order Helpline</span>
                        <span class="phone-pill-num">93606 71533</span>
                    </div>
                </a>
                <div class="mobile-nav-hours">
                    <span>🕐 Daily Morning Dispatch: 6:00 AM – 8:00 PM</span>
                    <span>📍 Kanchipuram &bull; Chennai</span>
                </div>
            </div>
        </div>
    `;

    // Ensure backdrop element exists
    let backdrop = document.querySelector(".mobile-nav-backdrop");
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "mobile-nav-backdrop";
        document.body.appendChild(backdrop);
    }

    function openMobileDrawer() {
        mobileNav.classList.add("open");
        backdrop.classList.add("active");
        document.body.classList.add("mobile-nav-open");
        if (menuBtn) {
            menuBtn.setAttribute("aria-expanded", "true");
            menuBtn.textContent = "✕";
        }
        updateDrawerCartCount();
    }

    function closeMobileDrawer() {
        mobileNav.classList.remove("open");
        backdrop.classList.remove("active");
        document.body.classList.remove("mobile-nav-open");
        if (menuBtn) {
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.textContent = "☰";
        }
    }

    function updateDrawerCartCount() {
        const count = getCart().reduce((s, i) => s + Number(i.quantity), 0);
        const drawerBadge = document.getElementById("drawerCartCount");
        if (drawerBadge) drawerBadge.textContent = count;
    }

    if (menuBtn) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            if (mobileNav.classList.contains("open")) {
                closeMobileDrawer();
            } else {
                openMobileDrawer();
            }
        };
    }

    const closeBtn = document.getElementById("mobileNavCloseBtn");
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeMobileDrawer();
        };
    }

    backdrop.onclick = closeMobileDrawer;

    // Close when tapping links
    mobileNav.querySelectorAll(".mobile-nav-link").forEach(link => {
        link.onclick = () => {
            closeMobileDrawer();
        };
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileNav.classList.contains("open")) {
            closeMobileDrawer();
        }
    });

    updateDrawerCartCount();
}

// Initialize on DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNavigationDrawer);
} else {
    initMobileNavigationDrawer();
}

// Mark cart & checkout pages to avoid floating elements overlapping buttons
if (window.location.pathname.includes("cart.html") || window.location.pathname.includes("/cart")) {
    document.body.classList.add("is-cart-page");
}
if (window.location.pathname.includes("checkout.html") || window.location.pathname.includes("/checkout")) {
    document.body.classList.add("is-checkout-page");
}

/* ---- Quick Header Search Interaction ---- */
document.querySelectorAll(".header-icon, #searchBtn").forEach(btn => {
    if (btn.textContent.includes("🔍") || btn.id === "searchBtn") {
        btn.addEventListener("click", () => {
            const isPages = window.location.pathname.includes("/pages/");
            const shopUrl = isPages ? "shop.html" : "pages/shop.html";
            window.location.href = shopUrl;
        });
    }
});

/* ---- Sticky header shadow on scroll ---- */
window.addEventListener("scroll", () => {
    const h = document.querySelector(".site-header");
    if (h) h.style.boxShadow = window.scrollY > 10
        ? "0 4px 20px rgba(26,74,46,.12)"
        : "0 2px 12px rgba(26,74,46,.06)";
});


/* =========================================================
   TOAST NOTIFICATION
========================================================= */
function showToast(msg, duration = 3000) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), duration);
}


/* =========================================================
   CART UTILITIES
========================================================= */
function getCart() {
    return JSON.parse(localStorage.getItem("thulirva_cart") || "[]");
}

function saveCart(cart) {
    localStorage.setItem("thulirva_cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = getCart().reduce((s, i) => s + Number(i.quantity), 0);
    document.querySelectorAll("#cartCount, #drawerCartCount, #mobileNavCartCount").forEach(el => el.textContent = count);
}

function addToCart(product, qty = 1) {
    const cart = getCart();
    const ex = cart.find(i => i.id === product.id);
    if (ex) ex.quantity += qty;
    else cart.push({ id: product.id, name: product.name, price: Number(product.price), weight: product.weight || "", emoji: product.emoji || "🥛", image: product.image || "", quantity: qty });
    saveCart(cart);
    showToast(`✅ ${product.name} added to cart!`);
}

function removeFromCart(id) {
    saveCart(getCart().filter(i => i.id !== id));
}

function updateCartQty(id, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(1, qty);
        saveCart(cart);
    }
}

function getCartSubtotal() {
    return getCart().reduce((s, i) => s + i.price * i.quantity, 0);
}


/* =========================================================
   PRODUCT CARD BUILDER
========================================================= */
const EMOJIS = {
    "Milk":    "🥛",
    "Curd":    "🫙",
    "Paneer":  "🧀",
    "Ghee":    "🧈",
    "Oils":    "🫗",
    "Masalas": "🌶️",
    "Vegan":   "🌱",
};

function buildProductCard(product, isShop = false) {
    const isPagesDir = window.location.pathname.includes('/pages/') || isShop;
    const productHref = isPagesDir ? `product.html?id=${product.id}` : `pages/product.html?id=${product.id}`;
    let imgSrc = product.image;
    if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
        imgSrc = isPagesDir && !imgSrc.startsWith('../') ? '../' + imgSrc : imgSrc;
    }
    const emoji = product.emoji || EMOJIS[product.category] || "🛒";
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.category = product.category || "";

    card.innerHTML = `
        ${product.badge ? `<div class="product-badge fresh">${product.badge}</div>` : ""}
        <button class="product-wishlist" title="Add to Wishlist" onclick="toggleWishlist(this)">♡</button>
        <a href="${productHref}" class="product-image">
            ${imgSrc
                ? `<img src="${imgSrc}" alt="${product.name}" loading="lazy">`
                : `<div class="product-emoji">${emoji}</div>`}
        </a>
        <div class="product-info">
            <div class="product-category">${product.category || ""}</div>
            <h3 class="product-name">
                <a href="${productHref}" style="color:inherit">${product.name}</a>
            </h3>
            <div class="product-weight">${product.weight || ""}</div>
            <div class="product-price-row">
                <div class="product-price">₹${product.price}</div>
                ${product.mrp ? `<div class="product-old-price">₹${product.mrp}</div>` : ""}
            </div>
            <button class="add-to-cart" id="btn-${product.id}">Add to Cart</button>
            ${(product.category === 'Milk' || product.name.toLowerCase().includes('milk')) ? `
                <a href="${isPagesDir ? 'subscriptions.html' : 'pages/subscriptions.html'}" class="btn btn-outline btn-sm sub-card-btn" style="width:100%; justify-content:center; margin-top:6px; font-size:11.5px; padding:6px 0; border:1px solid var(--forest-green); color:var(--forest-green); font-weight:700; text-decoration:none;">
                    🥛 Daily Morning Subscription
                </a>
            ` : ''}
        </div>
    `;

    card.querySelector(".add-to-cart").addEventListener("click", function() {
        addToCart(product);
        this.textContent = "✓ Added!";
        this.classList.add("added");
        setTimeout(() => { this.textContent = "Add to Cart"; this.classList.remove("added"); }, 2000);
    });

    return card;
}


/* =========================================================
   HOMEPAGE — LOAD PRODUCTS WITH FILTER TABS
========================================================= */
let allProducts = [];

async function loadProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    try {
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error("API status " + res.status);
        const data = await res.json();
        allProducts = (data && data.products && data.products.length > 0) ? data.products : getSampleProducts();
        renderProductGrid(allProducts.slice(0, 8), grid);
        setupFilterTabs();
    } catch {
        // Fallback: use static sample products
        allProducts = getSampleProducts();
        renderProductGrid(allProducts.slice(0, 8), grid);
        setupFilterTabs();
    }
}

function renderProductGrid(products, grid) {
    grid.innerHTML = "";
    if (!products.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">🌾</div>
            <h3>No products found</h3>
            <p>Try a different filter</p>
        </div>`;
        return;
    }
    products.forEach(p => grid.appendChild(buildProductCard(p)));
}

function setupFilterTabs() {
    document.querySelectorAll(".filter-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.dataset.filter;
            const filtered = filter === "all"
                ? allProducts.slice(0, 8)
                : allProducts.filter(p => p.category === filter).slice(0, 8);
            renderProductGrid(filtered, document.getElementById("productGrid"));
        });
    });
}

function handleHomeProductSearch(query) {
    const q = (query || "").trim().toLowerCase();
    const grid = document.getElementById("productGrid");
    if (!grid) return;
    if (!q) {
        renderProductGrid(allProducts.slice(0, 8), grid);
        return;
    }
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.weight && p.weight.toLowerCase().includes(q))
    );
    renderProductGrid(filtered, grid);
}


/* =========================================================
   STATIC SAMPLE PRODUCTS (fallback when API unavailable)
========================================================= */
function getSampleProducts() {
    return [
        { id: 1,  name: "Fresh Cow Milk (500ml)", category: "Milk", price: 44, weight: "500 ml", badge: "Fresh", emoji: "🥛", image: "assets/images/products/fresh_cow_milk.jpg" },
        { id: 2,  name: "Pure Bilona Cow Ghee (500ml)", category: "Ghee", price: 520, weight: "500 ml", badge: "Pure", emoji: "🧈", image: "assets/images/products/pure_cow_ghee.jpg" },
        { id: 3,  name: "Fresh Artisanal Paneer (200g)", category: "Paneer", price: 82, weight: "200 g", badge: "Fresh", emoji: "🧀", image: "assets/images/products/fresh_paneer.jpg" },
        { id: 4,  name: "Natural Thick Set Curd (500g)", category: "Curd", price: 48, weight: "500 g", badge: "Probiotic", emoji: "🫙", image: "assets/images/products/product_lineup.jpg" },
        { id: 5,  name: "Fresh Cow Milk (1 Litre)", category: "Milk", price: 82, weight: "1 Litre", badge: "Farm Fresh", emoji: "🥛", image: "assets/images/products/fresh_cow_milk.jpg" },
        { id: 6,  name: "Traditional Farm Butter (250g)", category: "Ghee", price: 140, weight: "250 g", badge: "Creamy", emoji: "🧈", image: "assets/images/products/pure_cow_ghee.jpg" },
        { id: 7,  name: "Cold-Pressed Groundnut Oil (1L)", category: "Oils", price: 280, weight: "1 Litre", badge: "Wood Pressed", emoji: "🫗", image: "assets/images/products/product_lineup.jpg" },
        { id: 8,  name: "Artisanal Organic Tofu (250g)", category: "Vegan", price: 120, weight: "250 g", badge: "High Protein", emoji: "🌱", image: "assets/images/products/fresh_paneer.jpg" },
        { id: 9,  name: "Pure Wild Forest Honey (350g)", category: "Vegan", price: 340, weight: "350 g", badge: "Raw", emoji: "🍯", image: "assets/images/products/product_lineup.jpg" },
        { id: 10, name: "Salem Turmeric Powder (200g)", category: "Masalas", price: 120, weight: "200 g", badge: "High Curcumin", emoji: "🌶️", image: "assets/images/products/product_lineup.jpg" },
        { id: 11, name: "Cold-Pressed Sesame Oil (500ml)", category: "Oils", price: 320, weight: "500 ml", badge: "Wood Pressed", emoji: "🫗", image: "assets/images/products/product_lineup.jpg" },
        { id: 12, name: "Oat & Almond Milk (1L)", category: "Vegan", price: 180, weight: "1 Litre", badge: "Plant Based", emoji: "🌱", image: "assets/images/products/fresh_cow_milk.jpg" }
    ];
}


/* =========================================================
   WISHLIST TOGGLE
========================================================= */
function toggleWishlist(btn) {
    btn.classList.toggle("active");
    btn.textContent = btn.classList.contains("active") ? "♥" : "♡";
    const msg = btn.classList.contains("active") ? "❤️ Added to wishlist!" : "💔 Removed from wishlist";
    showToast(msg);
}


/* =========================================================
   NEWSLETTER
========================================================= */
function subscribeNewsletter() {
    const el = document.getElementById("newsletterEmail");
    if (el && el.value && el.value.includes("@")) {
        showToast("🎉 Subscribed successfully! Thank you.");
        el.value = "";
    } else {
        showToast("⚠️ Please enter a valid email address.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("newsletterBtn");
    if (btn) btn.addEventListener("click", subscribeNewsletter);
});


/* =========================================================
   ORDER PLACEMENT
========================================================= */
function placeOrder() {
    const cart = getCart();
    if (!cart.length) { showToast("⚠️ Your cart is empty!"); return; }
    showToast("🎉 Order placed successfully! We will contact you soon.");
    saveCart([]);
    setTimeout(() => window.location.href = "../index.html", 2500);
}


/* =========================================================
   OFFERS & PROMO CODES DRAWER & ANNOUNCEMENTS
========================================================= */
let activeCouponsCache = [];

async function initOffersDrawer() {
    // Only inject if not already present
    if (document.getElementById("offersFloatingBtn")) return;

    // 1. Floating Button
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "offers-floating-btn";
    btn.id = "offersFloatingBtn";
    btn.onclick = toggleOffersDrawer;
    btn.innerHTML = `🎟️ Offers <span class="offers-badge-pulse">NEW</span>`;
    document.body.appendChild(btn);

    // 2. Backdrop & Drawer
    const backdrop = document.createElement("div");
    backdrop.className = "offers-drawer-backdrop";
    backdrop.id = "offersDrawerBackdrop";
    backdrop.onclick = toggleOffersDrawer;
    document.body.appendChild(backdrop);

    const drawer = document.createElement("div");
    drawer.className = "offers-drawer";
    drawer.id = "offersDrawer";
    drawer.innerHTML = `
        <div class="offers-drawer-header">
            <h3>🎁 Pure Farm Offers &amp; Promo Codes</h3>
            <button type="button" class="offers-drawer-close" onclick="toggleOffersDrawer()">✕</button>
        </div>
        <div style="background:#eaf2e4; padding:10px 18px; border-bottom:1px solid #c8dbbf; font-size:12px; color:#1a4a2e; display:flex; align-items:center; gap:8px;">
            <span>📢</span>
            <span>Apply promo codes at checkout to get instant discounts!</span>
        </div>
        <div class="offers-drawer-body" id="offersDrawerBody">
            <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
                <div class="loading"></div>
                <p style="margin-top:10px; font-size:13px;">Fetching latest farm offers...</p>
            </div>
        </div>
    `;
    document.body.appendChild(drawer);

    await loadOffersDrawerCoupons();
}

async function loadOffersDrawerCoupons() {
    const body = document.getElementById("offersDrawerBody");
    if (!body) return;

    try {
        const res = await fetch("/api/coupons");
        if (res.ok) {
            const data = await res.json();
            if (data.coupons && data.coupons.length > 0) {
                activeCouponsCache = data.coupons.filter(c => c.status === "active");
            }
        }
    } catch {}

    if (!activeCouponsCache || !activeCouponsCache.length) {
        activeCouponsCache = [
            { code: "FARM10", type: "percent", value: 10, min_order: 100, description: "10% OFF on all pure farm milk & dairy orders" },
            { code: "THULIRVA50", type: "flat", value: 50, min_order: 300, description: "₹50 Instant Discount on orders above ₹300" },
            { code: "PUREMILK", type: "flat", value: 100, min_order: 500, description: "₹100 Flat Savings on cart above ₹500" },
            { code: "SUPER20", type: "percent", value: 20, min_order: 400, max_discount: 150, description: "20% OFF up to ₹150 for super milk savers" }
        ];
    }

    // Render coupons in drawer
    body.innerHTML = activeCouponsCache.map(c => {
        const discType = c.discount_type || c.type || 'percent';
        const discVal = c.discount_value !== undefined ? c.discount_value : (c.value || 0);
        const discBadge = discType === 'percent' ? `${discVal}% OFF` : `₹${discVal} OFF`;
        return `
            <div class="offer-coupon-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="background:#eaf2e4; color:#1a4a2e; font-size:11px; font-weight:800; padding:3px 10px; border-radius:20px; border:1px solid #c8dbbf; text-transform:uppercase;">
                        🏷️ ${discBadge}
                    </span>
                    <span style="font-size:11px; color:#c67d0a; font-weight:700;">
                        ${c.min_order ? 'Min ₹' + c.min_order : 'No Min Order'}
                    </span>
                </div>
                <div style="font-size:13px; font-weight:700; color:var(--text-dark); margin-bottom:4px;">
                    ${c.description || 'Exclusive farm fresh discount'}
                </div>
                ${c.expiry_date ? `<div style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">Valid till: ${c.expiry_date}</div>` : ''}
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f5f7f2; border:1px dashed #c8dbbf; border-radius:8px; padding:6px 10px; margin-top:8px;">
                    <span style="font-family:monospace; font-size:14px; font-weight:800; color:var(--forest-green); letter-spacing:1px;">
                        ${c.code}
                    </span>
                    <button type="button" onclick="copyOfferCode('${c.code}', ${discVal})" style="background:var(--forest-green); color:#e5c97a; border:none; border-radius:6px; padding:5px 12px; font-size:11.5px; font-weight:700; cursor:pointer;">
                        📋 Copy Code
                    </button>
                </div>
            </div>
        `;
    }).join("");

    // Also update announcement bar with top coupon if present
    const topCoupon = activeCouponsCache[0];
    if (topCoupon) {
        const topType = topCoupon.discount_type || topCoupon.type || 'percent';
        const topVal = topCoupon.discount_value !== undefined ? topCoupon.discount_value : (topCoupon.value || 0);
        const topDiscText = topType === 'percent' ? `${topVal}%` : `₹${topVal}`;
        document.querySelectorAll(".announcement-content").forEach(bar => {
            if (!bar.querySelector(".promo-announcement-pill")) {
                const span = document.createElement("span");
                span.className = "promo-announcement-pill";
                span.style.cssText = "background:rgba(229,201,122,0.25); border:1px solid #e5c97a; padding:2px 8px; border-radius:12px; cursor:pointer;";
                span.onclick = toggleOffersDrawer;
                span.innerHTML = `🎟️ Use Code <b>${topCoupon.code}</b> for ${topDiscText} OFF!`;
                bar.appendChild(span);
            }
        });
    }
}

function toggleOffersDrawer() {
    const backdrop = document.getElementById("offersDrawerBackdrop");
    const drawer = document.getElementById("offersDrawer");
    if (!backdrop || !drawer) return;

    const isActive = drawer.classList.contains("active");
    if (isActive) {
        drawer.classList.remove("active");
        backdrop.classList.remove("active");
    } else {
        drawer.classList.add("active");
        backdrop.classList.add("active");
    }
}

function copyOfferCode(code, discVal) {
    navigator.clipboard.writeText(code).then(() => {
        showToast(`✓ Code ${code} copied to clipboard!`);
    }).catch(() => {
        showToast(`Code: ${code}`);
    });

    // Save in session so checkout or cart auto-fills
    try {
        sessionStorage.setItem("thulirva_applied_coupon", JSON.stringify({ code: code }));
    } catch {}

    // If on checkout page, immediately apply it
    if (typeof applyCheckoutPromo === 'function') {
        const input = document.getElementById("checkoutPromoInput");
        if (input) input.value = code;
        applyCheckoutPromo(code);
    }
    // If on cart page, immediately apply it
    if (typeof applyCoupon === 'function') {
        const input = document.getElementById("couponInput");
        if (input) input.value = code;
        applyCoupon(code);
    }
    // If on subscription page or modal, set it
    const subPromoInput = document.getElementById("subPromoCodeInput") || document.getElementById("subPagePromoInput");
    if (subPromoInput) {
        subPromoInput.value = code;
        if (typeof applySubPromoCode === 'function') applySubPromoCode();
        if (typeof applySubPagePromo === 'function') applySubPagePromo();
    }

    setTimeout(() => {
        toggleOffersDrawer();
    }, 600);
}

/* =========================================================
   DYNAMIC ACTIVE ANNOUNCEMENTS SYSTEM
========================================================= */
async function loadActiveAnnouncements() {
    try {
        const res = await fetch("/api/announcements/active");
        if (!res.ok) return;
        const data = await res.json();
        const list = data.announcements || [];
        if (!list.length) return;

        // 1. Top bar sticky announcement
        const topBarAnn = list.find(a => a.position === "top_bar" || a.position === "all");
        const topBarContainer = document.getElementById("announcementTopBar");
        if (topBarAnn && topBarContainer) {
            topBarContainer.innerHTML = `
                <div style="background:${topBarAnn.bg_color || '#1B4332'}; color:${topBarAnn.text_color || '#ffffff'}; padding:8px 16px; font-size:12.5px; text-align:center; display:flex; justify-content:center; align-items:center; gap:12px; font-weight:600; border-bottom:1px solid rgba(229,201,122,0.3);">
                    ${topBarAnn.badge_text ? `<span style="background:${topBarAnn.accent_color || '#E5C97A'}; color:${topBarAnn.bg_color || '#1B4332'}; padding:2px 8px; border-radius:12px; font-size:10.5px; font-weight:800;">${topBarAnn.badge_text}</span>` : ''}
                    <span>${topBarAnn.title}</span>
                    ${topBarAnn.cta_text ? `<a href="${topBarAnn.cta_url || 'pages/shop.html'}" style="color:${topBarAnn.accent_color || '#E5C97A'}; text-decoration:underline; font-weight:700;">${topBarAnn.cta_text} &rarr;</a>` : ''}
                    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:${topBarAnn.text_color || '#fff'}; cursor:pointer; font-size:14px; margin-left:12px; opacity:0.8;">✕</button>
                </div>
            `;
        }

        // 2. Homepage Hero Banner
        const heroAnn = list.find(a => a.position === "homepage_hero");
        const heroContainer = document.getElementById("announcementHeroBanner");
        if (heroAnn && heroContainer) {
            heroContainer.innerHTML = `
                <div class="container" style="margin-top:16px; margin-bottom:16px;">
                    <div style="background:${heroAnn.bg_color || '#1B4332'}; color:${heroAnn.text_color || '#fff'}; border-radius:16px; padding:22px 28px; box-shadow:0 8px 24px rgba(27,67,50,0.2); display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; border:1.5px solid rgba(229,201,122,0.4); position:relative; overflow:hidden;">
                        <div style="flex:1; min-width:280px; z-index:2;">
                            ${heroAnn.badge_text ? `<span style="background:rgba(229,201,122,0.25); color:${heroAnn.accent_color || '#E5C97A'}; border:1px solid rgba(229,201,122,0.6); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:800; letter-spacing:0.5px; display:inline-block; margin-bottom:10px;">${heroAnn.badge_text}</span>` : ''}
                            <h2 style="font-family:'Playfair Display', serif; font-size:24px; font-weight:800; color:${heroAnn.text_color || '#fff'}; margin-bottom:6px; line-height:1.2;">
                                ${heroAnn.title}
                            </h2>
                            <p style="font-size:14px; opacity:0.92; line-height:1.5; max-width:620px; color:${heroAnn.text_color || '#fff'};">
                                ${heroAnn.description}
                            </p>
                        </div>
                        ${heroAnn.cta_text ? `
                            <div style="z-index:2;">
                                <a href="${heroAnn.cta_url || 'pages/shop.html'}" style="background:${heroAnn.accent_color || '#E5C97A'}; color:${heroAnn.bg_color || '#1B4332'}; font-weight:800; font-size:14px; padding:12px 24px; border-radius:10px; text-decoration:none; display:inline-block; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='none'">
                                    ${heroAnn.cta_text} &rarr;
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    } catch (_) {}
}

/* =========================================================
   INIT
========================================================= */
updateCartCount();
loadProducts();
document.addEventListener("DOMContentLoaded", () => {
    initOffersDrawer();
    loadActiveAnnouncements();
});
