/* =========================================================
   SHOP PAGE JAVASCRIPT
========================================================= */

let shopAllProducts = [];
let shopFilteredProducts = [];
let currentCat = "all";
let shopCategories = [];

function getDefaultCategories() {
    return [
        { id: 1, name: "Milk", displayName: "Fresh Cow Milk", emoji: "🥛" },
        { id: 2, name: "Ghee", displayName: "Ghee & Butter", emoji: "🧈" },
        { id: 3, name: "Paneer", displayName: "Paneer & Tofu", emoji: "🧀" },
        { id: 4, name: "Curd", displayName: "Natural Set Curd", emoji: "🫙" },
        { id: 5, name: "Oils", displayName: "Cold-Pressed Oils", emoji: "🫗" },
        { id: 6, name: "Masalas", displayName: "Pure Masalas", emoji: "🌶️" },
        { id: 7, name: "Vegan", displayName: "Vegan & Plant-Based", emoji: "🌱" }
    ];
}

async function initShop() {
    try {
        const [prodRes, catRes] = await Promise.all([
            fetch(`/api/products`),
            fetch(`/api/categories`)
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        shopAllProducts = (prodData && prodData.products && prodData.products.length > 0) 
            ? prodData.products 
            : (typeof getSampleProducts === 'function' ? getSampleProducts() : []);
        shopCategories = (catData && catData.categories && catData.categories.length > 0) 
            ? catData.categories 
            : getDefaultCategories();
    } catch {
        shopAllProducts = typeof getSampleProducts === 'function' ? getSampleProducts() : [];
        shopCategories = getDefaultCategories();
    }

    renderCategorySidebar();

    // Check URL param for category
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) filterShop(cat);
    else filterShop("all");

    updateCounts();
}

function countProductsForCat(catKey) {
    if (!shopAllProducts || !shopAllProducts.length) return 0;
    const target = (catKey || "").toLowerCase().trim();
    return shopAllProducts.filter(p => {
        const pCat = ((p.category || p.category_name || '') + '').toLowerCase().trim();
        const pName = ((p.name || '') + '').toLowerCase();
        return pCat === target || pCat.includes(target) || target.includes(pCat) || pName.includes(target);
    }).length;
}

function renderCategorySidebar() {
    const container = document.getElementById("shopCategoriesList");
    if (!container || !shopCategories.length) return;

    let html = `<div class="sidebar-category ${currentCat === 'all' ? 'active' : ''}" data-cat="all" onclick="filterShop('all')">🛒 All Products <span id="cnt-all">${shopAllProducts.length}</span></div>`;

    shopCategories.forEach(c => {
        const catKey = c.name;
        const count = countProductsForCat(catKey);
        const emoji = c.emoji || "🌾";
        const title = c.displayName || c.name;
        html += `<div class="sidebar-category ${currentCat === catKey ? 'active' : ''}" data-cat="${catKey}" onclick="filterShop('${catKey}')">${emoji} ${title} <span id="cnt-${catKey}">${count}</span></div>`;
    });

    container.innerHTML = html;
}

function updateCounts() {
    const allEl = document.getElementById("cnt-all");
    if (allEl) allEl.textContent = shopAllProducts.length;

    shopCategories.forEach(c => {
        const el = document.getElementById("cnt-" + c.name);
        if (el) {
            el.textContent = countProductsForCat(c.name);
        }
    });
}

function filterShop(cat) {
    currentCat = cat;
    if (cat === "all") {
        shopFilteredProducts = [...shopAllProducts];
    } else {
        const target = (cat || "").toLowerCase().trim();
        shopFilteredProducts = shopAllProducts.filter(p => {
            const pCat = ((p.category || p.category_name || '') + '').toLowerCase().trim();
            const pName = ((p.name || '') + '').toLowerCase();
            return pCat === target || pCat.includes(target) || target.includes(pCat) || pName.includes(target);
        });
    }

    // Update sidebar active state
    document.querySelectorAll(".sidebar-category").forEach(el => {
        el.classList.toggle("active", el.dataset.cat === cat);
    });

    const sort = document.getElementById("sortSelect");
    if (sort) sortProducts(sort.value);
    else renderShopGrid(shopFilteredProducts);
}

function sortProducts(val) {
    let sorted = [...shopFilteredProducts];
    if (val === "price-asc")  sorted.sort((a, b) => a.price - b.price);
    if (val === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (val === "name")       sorted.sort((a, b) => a.name.localeCompare(b.name));
    renderShopGrid(sorted);
}

function renderShopGrid(products) {
    const grid = document.getElementById("shopGrid");
    const count = document.getElementById("shopResultCount");
    if (!grid) return;

    if (count) count.textContent = `Showing ${products.length} product${products.length !== 1 ? "s" : ""}`;

    grid.innerHTML = "";
    if (!products.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">🌾</div>
            <h3>No products in this category</h3>
            <p>Check back soon or browse other categories.</p>
        </div>`;
        return;
    }
    products.forEach(p => grid.appendChild(buildProductCard(p, true)));
}

function handleShopSearch(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
        filterShop(currentCat);
        return;
    }
    const baseList = currentCat === "all" ? shopAllProducts : shopFilteredProducts;
    const filtered = baseList.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.weight && p.weight.toLowerCase().includes(q))
    );
    renderShopGrid(filtered);
}

document.addEventListener("DOMContentLoaded", initShop);
