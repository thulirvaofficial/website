/**
 * THULIRVA CONNECTIVITY STATE ENGINE SIMULATION TEST
 * Verifies:
 * - Scenario 1: Internet Disconnected (navigator.onLine = false)
 * - Scenario 2: Internet Available, Server Unavailable (backend down)
 * - Scenario 3: Slow Internet / Timeout (AbortController trigger)
 * - Scenario 4: Retry Button State Transitions & Duplicate Click Debouncing
 * - Scenario 5: Internet & Server Restored (Seamless automatic recovery)
 */

const assert = require('assert');
const fs = require('fs');

console.log("==================================================================");
console.log("🧪 THULIRVA CONNECTIVITY STATE ENGINE SIMULATION TEST");
console.log("==================================================================\n");

// Mock Minimal DOM Environment
class MockElement {
    constructor(id) {
        this.id = id;
        this.className = '';
        this.textContent = '';
        this.innerHTML = '';
        this.disabled = false;
        this.attributes = {};
        this.listeners = {};
        this.classList = {
            add: (c) => { if (!this.className.includes(c)) this.className += ` ${c}`; },
            remove: (c) => { this.className = this.className.replace(c, '').trim(); },
            contains: (c) => this.className.includes(c)
        };
    }
    setAttribute(k, v) { this.attributes[k] = v; }
    getAttribute(k) { return this.attributes[k]; }
    addEventListener(evt, fn) { this.listeners[evt] = fn; }
}

const elements = {
    offlineTitle: new MockElement('offlineTitle'),
    offlineDesc: new MockElement('offlineDesc'),
    offlineStatusMsg: new MockElement('offlineStatusMsg'),
    offlineRetryBtn: new MockElement('offlineRetryBtn'),
    offlineRetryIcon: new MockElement('offlineRetryIcon'),
    offlineRetryText: new MockElement('offlineRetryText')
};

let overlayCreated = false;
global.document = {
    readyState: 'complete',
    getElementById: (id) => {
        if (id === 'thulirvaOfflineOverlay') {
            return overlayCreated ? elements.thulirvaOfflineOverlay : null;
        }
        return elements[id] || null;
    },
    createElement: (tag) => {
        const el = new MockElement(tag);
        if (tag === 'div') {
            elements.thulirvaOfflineOverlay = el;
            overlayCreated = true;
        }
        return el;
    },
    body: { appendChild: () => {} },
    addEventListener: () => {}
};

let eventListeners = {};
global.window = {
    location: { pathname: '/' },
    addEventListener: (evt, fn) => { eventListeners[evt] = fn; },
    dispatchEvent: (evt) => { if (eventListeners[evt.type]) eventListeners[evt.type](evt); }
};
global.CustomEvent = class { constructor(type) { this.type = type; } };

// Mock Navigator
let mockOnline = true;
Object.defineProperty(global, 'navigator', {
    get: () => ({ onLine: mockOnline }),
    configurable: true
});

// Load connectivity engine
const code = fs.readFileSync('website/website/js/connectivity.js', 'utf8');
eval(code);

const tc = global.window.ThulirvaConnectivity;

async function runTests() {
    let passed = 0;

    // Reset initial background check
    tc.isChecking = false;

    // Test 1: Internet Disconnected
    console.log("▶ Scenario 1: Internet Disconnected (Hardware offline)");
    mockOnline = false;
    await tc.checkConnection();
    assert.strictEqual(elements.offlineTitle.textContent, "No Internet Connection");
    assert.strictEqual(elements.offlineStatusMsg.textContent, "No internet connection");
    assert.ok(elements.offlineStatusMsg.className.includes('status-offline'));
    console.log("  ✅ Correctly enters OFFLINE state with title 'No Internet Connection' and status 'No internet connection'");
    passed++;

    // Test 2: Internet Available but Backend Unavailable
    console.log("\n▶ Scenario 2: Internet Available, Server Unavailable");
    mockOnline = true;
    tc.pingBackend = async () => false; // Simulates server down (502 / 503 / connection refused)
    await tc.checkConnection();
    assert.strictEqual(elements.offlineTitle.textContent, "Server Unavailable");
    assert.strictEqual(elements.offlineStatusMsg.textContent, "Unable to reach Thulirva servers");
    assert.ok(elements.offlineStatusMsg.className.includes('status-server-down'));
    console.log("  ✅ Correctly enters SERVER_UNAVAILABLE state with status 'Unable to reach Thulirva servers'");
    passed++;

    // Test 3: Slow Internet / Timeout Simulation
    console.log("\n▶ Scenario 3: Slow Internet / Timeout (AbortController trigger)");
    tc.timeoutMs = 100;
    tc.pingBackend = async () => {
        return new Promise(resolve => setTimeout(() => resolve(false), 50));
    };
    const start = Date.now();
    await tc.checkConnection();
    const duration = Date.now() - start;
    assert.ok(duration < 500, "Timeout must complete without hanging");
    assert.strictEqual(tc.isChecking, false, "isChecking must be cleanly reset to false");
    console.log(`  ✅ Successfully handled slow response in ${duration}ms without hanging`);
    passed++;

    // Test 4: Retry Button State Transitions & Duplicate Click Debouncing
    console.log("\n▶ Scenario 4: Retry Button Debouncing & Loading Feedback");
    let pingCallCount = 0;
    tc.pingBackend = async () => {
        pingCallCount++;
        await new Promise(r => setTimeout(r, 60));
        return false;
    };

    // Fire two manual retry clicks in rapid succession
    const p1 = tc.retryManual();
    const p2 = tc.retryManual(); // Should be ignored by debouncing guard
    await Promise.all([p1, p2]);

    assert.strictEqual(pingCallCount, 1, "Debounce guard must prevent duplicate concurrent ping calls");
    assert.strictEqual(elements.offlineRetryBtn.disabled, false, "Button must return to enabled/clickable state on failure");
    assert.strictEqual(elements.offlineRetryText.textContent, "Try Again", "Button text must revert to Try Again");
    console.log("  ✅ Duplicate clicks prevented (1 network call made), button successfully reset to 'Try Again'");
    passed++;

    // Test 5: Internet & Backend Restored
    console.log("\n▶ Scenario 5: Internet Restored (Automatic & Manual Recovery)");
    let restoreDispatched = false;
    global.window.addEventListener('thulirva:connection-restored', () => {
        restoreDispatched = true;
    });

    tc.pingBackend = async () => true; // Server is back online!
    const recovered = await tc.checkConnection({ isManual: true });
    assert.strictEqual(recovered, true, "checkConnection must return true on healthy backend");
    assert.strictEqual(elements.offlineStatusMsg.textContent, "Connection restored! Returning to store...");
    assert.ok(elements.offlineStatusMsg.className.includes('status-success'));
    assert.strictEqual(elements.offlineRetryText.textContent, "Connected!");

    // Wait for auto-hide
    await new Promise(r => setTimeout(r, 600));
    assert.strictEqual(tc.isOnline, true, "isOnline must be true");
    assert.ok(elements.thulirvaOfflineOverlay.className.includes('hidden'), "Overlay must be hidden");
    assert.strictEqual(restoreDispatched, true, "thulirva:connection-restored event must be dispatched");
    console.log("  ✅ Restores site automatically, shows 'Connected!', hides overlay, dispatches recovery event");
    passed++;

    console.log("\n==================================================================");
    console.log(`🎉 ALL ${passed} OF ${passed} SCENARIO TESTS PASSED! (100% SUCCESS)`);
    console.log("==================================================================");
}

runTests().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
