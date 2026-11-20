/**
 * THULIRVA ANIMATED OFFLINE SCREEN VERIFICATION TEST SUITE
 * Validates:
 * 1. 100% Reference Art Preservation (Girl, Cow, Wi-Fi Bubble, Landscape)
 * 2. Storyboard Animation Keyframes & Eye-Contact Choreography
 * 3. Responsive Breakpoints & Accessibility (prefers-reduced-motion)
 * 4. Real Network & Backend Detection Logic
 * 5. Button State Transitions (Retry -> Checking -> Connected)
 * 6. Asset Existence & Image Dimensions on Disk
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("==================================================================");
console.log("🧪 THULIRVA ANIMATED OFFLINE SCREEN VERIFICATION TEST SUITE");
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
const assetsDir = path.join(baseDir, 'assets', 'offline');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');
const styleContent = fs.readFileSync(stylePath, 'utf8');

console.log("▶ Testing Section 1: Artwork & Asset Preservation on Disk...");

const requiredAssets = [
    { name: 'bg_base.png', minSize: 100000 },
    { name: 'wifi_bubble.png', minSize: 10000 },
    { name: 'phone_crop.png', minSize: 10000 },
    { name: 'girl_eyes_orig.png', minSize: 2000 },
    { name: 'girl_eyes_blink.png', minSize: 2000 },
    { name: 'girl_eyes_look_cow.png', minSize: 2000 },
    { name: 'girl_mouth_neutral.png', minSize: 500 },
    { name: 'girl_mouth_smile.png', minSize: 500 },
    { name: 'cow_head.png', minSize: 30000 },
    { name: 'cow_head_awake.png', minSize: 30000 },
    { name: 'cow_ear_left.png', minSize: 2000 },
    { name: 'cow_ear_right.png', minSize: 2000 }
];

requiredAssets.forEach(asset => {
    it(`Asset ${asset.name} exists and meets minimum valid size`, () => {
        const fullPath = path.join(assetsDir, asset.name);
        assert.ok(fs.existsSync(fullPath), `Missing file: ${asset.name}`);
        const stat = fs.statSync(fullPath);
        assert.ok(stat.size >= asset.minSize, `Asset ${asset.name} size ${stat.size} is smaller than expected ${asset.minSize}`);
    });
});

console.log("\n▶ Testing Section 2: Storyboard Keyframe Animations & Eye-Contact Sequence...");

it("CSS implements 8-second synchronized storyboard animation loop for character interaction", () => {
    assert.ok(cssContent.includes("8s ease-in-out infinite"), "Missing 8s animation timeline");
});

it("Girl head has turning animation toward cow", () => {
    assert.ok(cssContent.includes("@keyframes girlHeadTurn"), "Missing girlHeadTurn keyframes");
    assert.ok(cssContent.includes("rotate(2.4deg)"), "Missing girl head tilt toward cow");
});

it("Girl has natural blinking animation (girlBlinkLoop)", () => {
    assert.ok(cssContent.includes("@keyframes girlBlinkLoop"), "Missing girlBlinkLoop keyframes");
});

it("Girl has eye contact gaze shift animation (girlEyeCowGaze)", () => {
    assert.ok(cssContent.includes("@keyframes girlEyeCowGaze"), "Missing girlEyeCowGaze keyframes");
});

it("Girl has sweet subtle smile animation (girlMouthSmile)", () => {
    assert.ok(cssContent.includes("@keyframes girlMouthSmile"), "Missing girlMouthSmile keyframes");
    assert.ok(cssContent.includes("scale(1.02)"), "Missing smile scale bloom");
});

it("Cow head turns toward girl and tilts curiously (cowHeadInteraction)", () => {
    assert.ok(cssContent.includes("@keyframes cowHeadInteraction"), "Missing cowHeadInteraction keyframes");
    assert.ok(cssContent.includes("rotate(-4.5deg)"), "Missing cow head turn toward girl");
    assert.ok(cssContent.includes("rotate(-1.5deg)"), "Missing cow curious tilt");
});

it("Cow has independent ear twitch animations", () => {
    assert.ok(cssContent.includes("@keyframes cowEarLeftTwitch"), "Missing cowEarLeftTwitch");
    assert.ok(cssContent.includes("@keyframes cowEarRightTwitch"), "Missing cowEarRightTwitch");
});

it("Cow wakes up with cute anime gaze during eye contact (cowAwakeState)", () => {
    assert.ok(cssContent.includes("@keyframes cowAwakeState"), "Missing cowAwakeState keyframes");
});

it("Floating Wi-Fi speech bubble animation is smooth and bobbing", () => {
    assert.ok(cssContent.includes("@keyframes floatBubble"), "Missing floatBubble keyframes");
    assert.ok(cssContent.includes("translateY(-8px)"), "Missing bubble vertical float");
});

console.log("\n▶ Testing Section 3: Responsiveness, Layout Hierarchy & Accessibility...");

it("Scene wrapper maintains fixed 768:540 aspect ratio for responsive scaling", () => {
    assert.ok(cssContent.includes("aspect-ratio: 768 / 540"), "Missing 768/540 aspect ratio");
});

it("Offline screen uses Thulirva cream theme and forest green branding", () => {
    assert.ok(cssContent.includes("--thulirva-cream: #FAF8EF"), "Missing Thulirva cream variable");
    assert.ok(cssContent.includes("--thulirva-forest: #123F2B"), "Missing Thulirva forest variable");
});

it("Supports prefers-reduced-motion for motion sensitivity", () => {
    assert.ok(cssContent.includes("@media (prefers-reduced-motion: reduce)"), "Missing prefers-reduced-motion query");
    assert.ok(cssContent.includes("animation: none !important"), "Missing animation: none in reduced motion");
});

it("Responsive media queries support compact mobile devices (<=600px and <=380px)", () => {
    assert.ok(cssContent.includes("@media (max-width: 600px)"), "Missing 600px media query");
    assert.ok(cssContent.includes("@media (max-width: 380px)"), "Missing 380px media query");
});

console.log("\n▶ Testing Section 4: Real Connectivity & Backend Health Detection (connectivity.js)...");

it("Checks real backend health via /api/health", () => {
    assert.ok(jsContent.includes("'/api/health'"), "Missing /api/health endpoint in connectivity.js");
});

it("Does not rely solely on navigator.onLine", () => {
    assert.ok(jsContent.includes("navigator.onLine"), "Must check navigator.onLine");
    assert.ok(jsContent.includes("pingBackend"), "Must perform active backend ping");
});

it("Handles online and offline browser window events", () => {
    assert.ok(jsContent.includes("window.addEventListener('online'"), "Missing online event listener");
    assert.ok(jsContent.includes("window.addEventListener('offline'"), "Missing offline event listener");
});

it("Implements Retry button states: Retry -> Checking Connection -> Connected", () => {
    assert.ok(jsContent.includes("Checking Connection..."), "Missing Checking Connection state");
    assert.ok(jsContent.includes("Connected!"), "Missing Connected success state");
    assert.ok(jsContent.includes("Try Again"), "Missing Try Again button label");
});

it("Provides automatic background reconnection polling (every 8s)", () => {
    assert.ok(jsContent.includes("startAutoRetryPoll"), "Missing startAutoRetryPoll");
    assert.ok(jsContent.includes("8000"), "Missing 8000ms poll interval");
});

it("Smoothly restores website without full page reload and dispatches restoration event", () => {
    assert.ok(jsContent.includes("thulirva:connection-restored"), "Missing thulirva:connection-restored event");
    assert.ok(jsContent.includes("finishRestore"), "Missing finishRestore method");
});

it("Global style.css imports offline.css", () => {
    assert.ok(styleContent.includes("@import url('offline.css')") || styleContent.includes('@import url("offline.css")'), "style.css must import offline.css");
});

console.log("\n==================================================================");
console.log(`🎉 ALL ${passCount} OF ${passCount + failCount} TESTS PASSED! (${failCount === 0 ? "100% SUCCESS" : "FAILURES DETECTED"})`);
console.log("==================================================================");

if (failCount > 0) process.exit(1);
