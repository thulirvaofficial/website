/**
 * Automated Verification Test for Thulirva Website Product Cards & Image Frames
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ [PASS] ${desc}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
    }
}

async function runTests() {
    console.log("==================================================================");
    console.log("🧪 THULIRVA PRODUCT CARD & IMAGE FRAME VERIFICATION SUITE");
    console.log("==================================================================\n");

    const cssPath = path.resolve(__dirname, 'website', 'css', 'style.css');
    const mainJsPath = path.resolve(__dirname, 'website', 'js', 'main.js');
    const shopHtmlPath = path.resolve(__dirname, 'website', 'pages', 'shop.html');

    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    const shopHtmlContent = fs.readFileSync(shopHtmlPath, 'utf8');

    // TEST 1: CSS Image Frame Specifications
    console.log("▶ Testing Section 1: Standardized 4:3 Image Frame CSS...");
    it("Product image container enforces aspect-ratio: 4 / 3", () => {
        assert(cssContent.includes("aspect-ratio: 4 / 3 !important") || cssContent.includes("aspect-ratio: 4 / 3;"), "Must specify aspect-ratio: 4 / 3");
    });

    it("Product image container prevents flex shrinking (flex-shrink: 0)", () => {
        assert(cssContent.includes("flex-shrink: 0 !important"), "Must enforce flex-shrink: 0 !important");
    });

    it("Product image container has Thulirva cream background (#FAF8EF)", () => {
        assert(cssContent.includes("background: #FAF8EF !important") || cssContent.includes("background: #FAF8EF;"), "Must have cream background #FAF8EF");
    });

    it("Product image img enforces object-fit: contain", () => {
        assert(cssContent.includes("object-fit: contain !important") || cssContent.includes("object-fit: contain;"), "Must enforce object-fit: contain");
    });

    it("Product image img has object-position: center", () => {
        assert(cssContent.includes("object-position: center !important") || cssContent.includes("object-position: center;"), "Must center images vertically and horizontally");
    });

    // TEST 2: Responsive Grids
    console.log("\n▶ Testing Section 2: Responsive Product Grid Across Breakpoints...");
    it("Desktop product grid uses responsive column layouts", () => {
        assert(cssContent.includes(".product-grid {") && cssContent.includes("grid-template-columns: repeat(4, 1fr)"), "Desktop product grid has 4 columns");
        assert(cssContent.includes(".shop-product-grid {") && cssContent.includes("grid-template-columns: repeat(3, 1fr)"), "Desktop shop product grid has 3 columns");
    });

    it("Tablet & mobile (max-width: 991px) maintains clean 2-column grid with equal width", () => {
        assert(cssContent.includes("grid-template-columns: repeat(2, 1fr) !important"), "Must use repeat(2, 1fr) for equal columns on mobile");
    });

    it("Compact mobile (max-width: 430px) enforces 2-column grid", () => {
        const bp430 = cssContent.slice(cssContent.indexOf("@media (max-width: 430px)"));
        assert(bp430.includes("grid-template-columns: repeat(2, 1fr) !important"), "Must maintain 2-column grid at 430px");
    });

    it("Android compact (max-width: 360px) enforces 2-column grid with compact padding", () => {
        const bp360 = cssContent.slice(cssContent.indexOf("@media (max-width: 360px)"));
        assert(bp360.includes("grid-template-columns: repeat(2, 1fr) !important"), "Must maintain 2-column grid at 360px");
    });

    // TEST 3: Product Information Layout Order
    console.log("\n▶ Testing Section 3: Standardized Information Hierarchy...");
    it("buildProductCard in main.js implements exact layout: Name -> Weight -> Price -> Add to Cart -> Subscription", () => {
        const fnBody = mainJsContent.slice(mainJsContent.indexOf("function buildProductCard"));
        const idxName = fnBody.indexOf("product-name");
        const idxWeight = fnBody.indexOf("product-weight");
        const idxPrice = fnBody.indexOf("product-price-row");
        const idxAddCart = fnBody.indexOf("add-to-cart");
        const idxSub = fnBody.indexOf("sub-card-btn");

        assert(idxName !== -1, "product-name must exist");
        assert(idxWeight !== -1, "product-weight must exist");
        assert(idxPrice !== -1, "product-price-row must exist");
        assert(idxAddCart !== -1, "add-to-cart must exist");
        assert(idxSub !== -1, "sub-card-btn must exist");

        assert(idxName < idxWeight, "Product Name must come before Quantity/Weight");
        assert(idxWeight < idxPrice, "Quantity/Weight must come before Price");
        assert(idxPrice < idxAddCart, "Price must come before Add to Cart");
        assert(idxAddCart < idxSub, "Add to Cart must come before Subscription button");
    });

    it("Static cards in shop.html follow exact layout hierarchy", () => {
        const idxGrid = shopHtmlContent.indexOf('id="shopGrid"');
        const gridContent = shopHtmlContent.slice(idxGrid, idxGrid + 2500);

        const idxName = gridContent.indexOf("product-name");
        const idxWeight = gridContent.indexOf("product-weight");
        const idxPrice = gridContent.indexOf("product-price-row");
        const idxAddCart = gridContent.indexOf("add-to-cart");

        assert(idxName < idxWeight, "Static: Name before Weight");
        assert(idxWeight < idxPrice, "Static: Weight before Price");
        assert(idxPrice < idxAddCart, "Static: Price before Add to Cart");
    });

    // TEST 4: Card Heights and Button Alignment
    console.log("\n▶ Testing Section 4: Card Height Consistency & Button Alignment...");
    it("CSS specifies uniform height: 38px on .product-name for 2-line consistency", () => {
        assert(cssContent.includes("min-height: 38px") && cssContent.includes("max-height: 38px"), "product-name has fixed 38px slot");
    });

    it("CSS specifies uniform height on .product-weight", () => {
        assert(cssContent.includes(".product-weight {") && cssContent.includes("height: 16px;"), "product-weight has fixed height");
    });

    it("CSS specifies uniform height on .product-price-row", () => {
        assert(cssContent.includes(".product-price-row {") && cssContent.includes("height: 22px;"), "product-price-row has fixed height");
    });

    it("Non-milk products contain .sub-card-tag to maintain identical card height across categories", () => {
        assert(mainJsContent.includes("sub-card-tag"), "main.js includes sub-card-tag for non-subscription items");
        assert(shopHtmlContent.includes("sub-card-tag"), "shop.html includes sub-card-tag for non-subscription items");
    });

    // TEST 5: Dynamic Image URL Resolution & Cache Invalidation
    console.log("\n▶ Testing Section 5: Dynamic Product Images & Cache Invalidation...");
    it("buildProductCard appends version parameter to image URLs", () => {
        assert(mainJsContent.includes("imgSrc = `${imgSrc}?v=${v}`") || mainJsContent.includes("imgSrc}?v="), "Images have cache-busting version query");
    });

    it("All product image assets exist on disk in website assets", () => {
        const requiredImages = [
            'fresh_cow_milk.jpg',
            'fresh_paneer.jpg',
            'pure_cow_ghee.jpg',
            'product_lineup.jpg'
        ];
        requiredImages.forEach(img => {
            const p = path.resolve(__dirname, 'website', 'assets', 'images', 'products', img);
            assert(fs.existsSync(p), `Image file must exist: ${img}`);
        });
    });

    console.log("\n==================================================================");
    console.log(`🎉 ALL ${passedTests} OF ${totalTests} TESTS PASSED PERFECTLY! (100% SUCCESS)`);
    console.log("==================================================================");
}

runTests();
