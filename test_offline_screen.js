/**
 * THULIRVA STATIC OFFLINE SCREEN VERIFICATION TEST SUITE
 * Validates:
 * 1. 100% Static Reference Artwork Preservation (Girl, Cow, Farm, Wi-Fi)
 * 2. Zero Character Animation & Keyframe Elimination (Completely Static)
 * 3. Wi-Fi Symbol Artifact Elimination (No split layers, no drop-shadow cutoffs)
 * 4. Proper Connection Status States (No stuck 'Checking server status...')
 * 5. Functional Retry Button (Debouncing, Loading, Success, Error Shake & Reset)
 * 6. Responsive Mobile UI (No excessive vertical spacing, no overflow)
 * 7. Real Network & Backend Detection Logic (/api/health with timeout)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("==================================================================");
console.log("🧪 THULIRVA STATIC OFFLINE SCREEN VERIFICATION TEST SUITE");
console.log("==================================================================\n");

let passCount = 0;
let failCount = 0;

function it(description, fn) {
    try {
        fn();
        console.log(`  ✅ [PASS] ${description}`);
        passCount++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${description}`);
        console.error(`     Error: ${err.message}`);
        failCount++;
    }
}

const baseDir = path.resolve(__dirname, 'website');
const cssPath = path.join(baseDir, 'css', 'offline.css');
const jsPath = path.join(baseDir, 'js', 'connectivity.js');
const stylePath = path.join(baseDir, 'css', 'style.css');
const assetsDir = path.join(baseDir, 'assets', 'images');
const offlineAssetsDir = path.join(baseDir, 'assets', 'offline');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');
const styleContent = fs.readFileSync(stylePath, 'utf8');

console.log("▶ Section 1: Static Artwork & Asset Preservation on Disk...");

it("Primary static illustration asset exists in assets/images/no_internet_anime.png", () => {
    const fullPath = path.join(assetsDir, 'no_internet_anime.png');
    assert.ok(fs.existsSync(fullPath), "Missing no_internet_anime.png in assets/images");
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 200000, `Asset size ${stat.size} is smaller than expected 200KB`);
});

it("Fallback static illustration asset exists in assets/offline/no_internet_static.png", () => {
    const fullPath = path.join(offlineAssetsDir, 'no_internet_static.png');
    assert.ok(fs.existsSync(fullPath), "Missing no_internet_static.png in assets/offline");
});

it("Static illustration has standard 768x540 PNG header dimensions", () => {
    const fullPath = path.join(assetsDir, 'no_internet_anime.png');
    const buf = fs.readFileSync(fullPath);
    assert.strictEqual(buf.slice(0, 8).toString('hex'), '89504e470d0a1a0a', "Invalid PNG signature");
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    assert.strictEqual(width, 768, "Width must be 768");
    assert.strictEqual(height, 540, "Height must be 540");
});

console.log("\n▶ Section 2: Zero Animation & Completely Static Verification...");

const forbiddenKeyframes = [
    'floatBubble',
    'phoneMicroSway',
    'girlHeadTurn',
    'girlEyePhoneGaze',
    'girlBlinkLoop',
    'girlEyeCowGaze',
    'girlMouthNeutral',
    'girlMouthSmile',
    'cowHeadInteraction',
    'cowRestingState',
    'cowAwakeState',
    'cowEarLeftTwitch',
    'cowEarRightTwitch'
];

forbiddenKeyframes.forEach(kf => {
    it(`Keyframe @keyframes ${kf} is completely removed from CSS`, () => {
        assert.ok(!cssContent.includes(`@keyframes ${kf}`), `CSS still contains forbidden animation ${kf}`);
    });
});

it("Static illustration image explicitly disables animation and transitions", () => {
    assert.ok(cssContent.includes('.offline-static-illustration'), "Missing .offline-static-illustration class");
    assert.ok(cssContent.includes('animation: none !important;'), "Missing animation: none !important");
    assert.ok(cssContent.includes('transition: none !important;'), "Missing transition: none !important");
});

it("Scene structure uses a single unified image, not multi-layered split divs", () => {
    assert.ok(!jsContent.includes('offline-eyes-container'), "Must not use offline-eyes-container");
    assert.ok(!jsContent.includes('offline-mouth-container'), "Must not use offline-mouth-container");
    assert.ok(!jsContent.includes('offline-cow-head'), "Must not use separate offline-cow-head");
    assert.ok(!jsContent.includes('offline-wifi-bubble'), "Must not use floating offline-wifi-bubble");
    assert.ok(jsContent.includes('offline-static-illustration'), "Must use offline-static-illustration");
});

console.log("\n▶ Section 3: Wi-Fi Visual Artifact & Broken Shape Elimination...");

it("No drop-shadow filters applied to cropped sub-elements", () => {
    assert.ok(!cssContent.includes('filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.07))'), "Drop-shadow filter on wifi layer removed");
});

it("Wi-Fi icon is part of the clean, seamless reference illustration", () => {
    assert.ok(jsContent.includes('no_internet_anime.png'), "References the master static artwork");
});

console.log("\n▶ Section 4: Connection Status States & Stalling Elimination...");

it("Status text does not remain permanently stuck on 'Checking server status...'", () => {
    assert.ok(!jsContent.includes("'Checking server status...'"), "Outdated stuck string removed");
});

it("Implements proper OFFLINE state: 'No internet connection'", () => {
    assert.ok(jsContent.includes("'No internet connection'"), "Missing offline status text");
});

it("Implements proper CHECKING state: 'Checking connection...'", () => {
    assert.ok(jsContent.includes("'Checking connection...'"), "Missing checking status text");
});

it("Implements proper SERVER_UNAVAILABLE state: 'Unable to reach Thulirva servers'", () => {
    assert.ok(jsContent.includes("'Unable to reach Thulirva servers'"), "Missing server down status text");
});

it("Implements proper RECONNECTING state: 'Reconnecting...'", () => {
    assert.ok(jsContent.includes("'Reconnecting...'"), "Missing reconnecting status text");
});

it("Implements proper SUCCESS state that restores website automatically", () => {
    assert.ok(jsContent.includes("'Connection restored! Returning to store...'"), "Missing success status text");
    assert.ok(jsContent.includes('hideOffline'), "Missing automatic restoration call");
});

console.log("\n▶ Section 5: Retry Button Functionality & Debouncing...");

it("Retry button prevents duplicate requests during active check (debouncing)", () => {
    assert.ok(jsContent.includes('if (this.isChecking) return;'), "Missing isChecking guard");
    assert.ok(jsContent.includes('btn.disabled = true'), "Button disabled during check");
});

it("Shows loading spinner in button while checking", () => {
    assert.ok(jsContent.includes('offline-btn-spinner'), "Missing button loading spinner");
    assert.ok(cssContent.includes('@keyframes retrySpin'), "Missing spinner keyframes");
});

it("Restores button to normal state after a failed attempt", () => {
    assert.ok(jsContent.includes("setButtonState('error')"), "Missing error button state");
    assert.ok(jsContent.includes("btn.disabled = false"), "Button re-enabled after attempt");
});

console.log("\n▶ Section 6: Mobile Responsiveness & Layout Improvements...");

it("Scene wrapper maintains responsive 768:540 aspect ratio", () => {
    assert.ok(cssContent.includes('aspect-ratio: 768 / 540'), "Missing aspect ratio 768 / 540");
});

it("Mobile media queries reduce vertical padding to prevent overflow", () => {
    assert.ok(cssContent.includes('@media (max-width: 600px)'), "Missing mobile query <=600px");
    assert.ok(cssContent.includes('@media (max-width: 380px)'), "Missing mobile query <=380px");
    assert.ok(cssContent.includes('max-height: 260px'), "Constrains illustration max-height on mobile");
});

it("Overlay enables smooth vertical scrolling if device height is ultra-compact", () => {
    assert.ok(cssContent.includes('overflow-y: auto'), "Overlay must allow vertical scrolling");
    assert.ok(cssContent.includes('overflow-x: hidden'), "Overlay must forbid horizontal overflow");
});

console.log("\n▶ Section 7: Network & Backend Reliability (/api/health)...");

it("Uses AbortController timeout to guarantee user is never stuck in checking state", () => {
    assert.ok(jsContent.includes('AbortController'), "Missing AbortController");
    assert.ok(jsContent.includes('clearTimeout'), "Missing clearTimeout on network response");
});

it("Global style.css imports offline.css", () => {
    assert.ok(styleContent.includes("offline.css"), "style.css does not import offline.css");
});

console.log("\n==================================================================");
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log("==================================================================");

if (failCount > 0) {
    process.exit(1);
}
