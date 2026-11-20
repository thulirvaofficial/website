/**
 * THULIRVA Agro & Dairy — Global Connectivity & Animated Offline Manager
 * Features real internet & backend health verification, state preservation,
 * and seamless background reconnection without page reloads.
 */

(function (window, document) {
    'use strict';

    const ThulirvaConnectivity = {
        isOnline: true,
        isChecking: false,
        pollTimer: null,
        countdownTimer: null,
        countdownSec: 8,
        healthEndpoint: '/api/health',
        timeoutMs: 4500,
        assetPrefix: '',

        init() {
            // Determine relative asset prefix for root vs /pages/
            const isPagesDir = window.location.pathname.includes('/pages/');
            this.assetPrefix = isPagesDir ? '../' : '';

            // Ensure DOM is ready before injecting overlay
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        },

        setup() {
            this.injectOverlay();
            this.bindEvents();
            this.hookFetch();

            // Initial silent connectivity check
            if (!navigator.onLine) {
                this.showOffline('no-internet');
            } else {
                this.checkConnection({ silent: true });
            }
        },

        injectOverlay() {
            if (document.getElementById('thulirvaOfflineOverlay')) return;

            const logoSrc = `${this.assetPrefix}assets/images/thulirva_brand_logo.png`;
            const overlay = document.createElement('div');
            overlay.id = 'thulirvaOfflineOverlay';
            overlay.className = 'thulirva-offline-screen hidden';
            overlay.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'offlineTitle');

            overlay.innerHTML = `
                <div class="thulirva-offline-container">
                    <!-- Brand Top Header -->
                    <div class="offline-brand-header">
                        <img src="${logoSrc}" alt="THULIRVA Agro & Dairy" class="offline-logo" onerror="this.style.display='none';">
                    </div>

                    <!-- Animated Scene with 100% Reference Art Characters -->
                    <div class="offline-scene-wrapper">
                        <div class="offline-scene" id="thulirvaOfflineScene">
                            <!-- Base Inpainted Landscape & Resting Characters -->
                            <img src="${this.assetPrefix}assets/offline/bg_base.png" alt="Thulirva Farm Scene" class="offline-layer offline-bg">

                            <!-- Layer 1: Animated Wi-Fi Cloud Bubble -->
                            <div class="offline-layer offline-wifi-bubble">
                                <img src="${this.assetPrefix}assets/offline/wifi_bubble.png" alt="No Connection Signal">
                            </div>

                            <!-- Layer 2: Girl's Hand and Smartphone (Micro-sway) -->
                            <div class="offline-layer offline-girl-phone">
                                <img src="${this.assetPrefix}assets/offline/phone_crop.png" alt="Phone">
                            </div>

                            <!-- Layer 3: Girl's Head and Hair (Tilt & Gaze Interaction) -->
                            <div class="offline-layer offline-girl-head">
                                <!-- Eyes Container -->
                                <div class="offline-eyes-container">
                                    <img src="${this.assetPrefix}assets/offline/girl_eyes_orig.png" alt="" class="girl-eye-state eye-phone">
                                    <img src="${this.assetPrefix}assets/offline/girl_eyes_blink.png" alt="" class="girl-eye-state eye-blink">
                                    <img src="${this.assetPrefix}assets/offline/girl_eyes_look_cow.png" alt="" class="girl-eye-state eye-cow">
                                </div>
                                <!-- Mouth Container -->
                                <div class="offline-mouth-container">
                                    <img src="${this.assetPrefix}assets/offline/girl_mouth_neutral.png" alt="" class="girl-mouth-state mouth-neutral">
                                    <img src="${this.assetPrefix}assets/offline/girl_mouth_smile.png" alt="" class="girl-mouth-state mouth-smile">
                                </div>
                            </div>

                            <!-- Layer 4: Cow's Head & Ears (Turn, Tilt, Awake & Twitch) -->
                            <div class="offline-layer offline-cow-head">
                                <img src="${this.assetPrefix}assets/offline/cow_head.png" alt="" class="cow-head-state cow-resting">
                                <img src="${this.assetPrefix}assets/offline/cow_head_awake.png" alt="" class="cow-head-state cow-awake">
                                
                                <!-- Twitching Ears -->
                                <img src="${this.assetPrefix}assets/offline/cow_ear_left.png" alt="" class="cow-ear ear-left">
                                <img src="${this.assetPrefix}assets/offline/cow_ear_right.png" alt="" class="cow-ear ear-right">
                            </div>
                        </div>
                    </div>

                    <!-- Offline UI Text & Action -->
                    <div class="offline-content">
                        <h2 id="offlineTitle" class="offline-title">No Internet Connection</h2>
                        <p id="offlineDesc" class="offline-desc">
                            We couldn't reach the server. Please check your internet connection and try again.
                        </p>

                        <div class="offline-actions">
                            <button id="offlineRetryBtn" class="offline-btn-retry" type="button" aria-label="Retry connection">
                                <span class="btn-retry-icon">⟳</span>
                                <span class="btn-retry-text">Try Again</span>
                            </button>
                        </div>

                        <div id="offlineStatusMsg" class="offline-status-msg" aria-live="polite"></div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Bind Retry Button click
            const retryBtn = document.getElementById('offlineRetryBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.retryManual();
                });
            }
        },

        bindEvents() {
            window.addEventListener('online', () => {
                this.checkConnection({ isOnlineEvent: true });
            });

            window.addEventListener('offline', () => {
                this.showOffline('no-internet');
            });
        },

        hookFetch() {
            // Wrap global fetch to automatically catch server unavailability / network drops
            if (window._thulirvaFetchHooked) return;
            window._thulirvaFetchHooked = true;

            const originalFetch = window.fetch;
            const self = this;

            window.fetch = async function (...args) {
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                const isApiRequest = url.includes('/api/') || url.includes(':5500');

                try {
                    const response = await originalFetch.apply(this, args);
                    // If API endpoint returns 502/503/504 Bad Gateway, trigger health probe
                    if (isApiRequest && (response.status === 502 || response.status === 503 || response.status === 504)) {
                        self.checkConnection();
                    }
                    return response;
                } catch (error) {
                    if (isApiRequest && !url.includes('/api/health')) {
                        // Network error or timeout on an essential API route
                        self.checkConnection();
                    }
                    throw error;
                }
            };
        },

        async pingBackend() {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), this.timeoutMs);
            try {
                const res = await fetch(`${this.healthEndpoint}?_t=${Date.now()}`, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal
                });
                clearTimeout(timer);
                return res.ok;
            } catch (err) {
                clearTimeout(timer);
                return false;
            }
        },

        async checkConnection(options = {}) {
            if (this.isChecking) return;
            this.isChecking = true;

            const browserOnline = navigator.onLine;

            if (!browserOnline) {
                this.isChecking = false;
                this.showOffline('no-internet');
                return false;
            }

            const backendHealthy = await this.pingBackend();

            this.isChecking = false;

            if (backendHealthy) {
                if (!this.isOnline) {
                    this.hideOffline(options.isManual);
                }
                return true;
            } else {
                this.showOffline('server-unreachable');
                return false;
            }
        },

        showOffline(reason) {
            this.isOnline = false;

            const overlay = document.getElementById('thulirvaOfflineOverlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.setAttribute('aria-hidden', 'false');
            }

            const title = document.getElementById('offlineTitle');
            const desc = document.getElementById('offlineDesc');

            if (title && desc) {
                if (reason === 'server-unreachable') {
                    title.textContent = "Server Unavailable";
                    desc.textContent = "We couldn't reach our farm servers. Please check your connection or try again in a few moments.";
                } else {
                    title.textContent = "No Internet Connection";
                    desc.textContent = "We couldn't reach the server. Please check your internet connection and try again.";
                }
            }

            this.startAutoRetryPoll();
        },

        hideOffline(isManual) {
            this.isOnline = true;
            this.stopAutoRetryPoll();

            const overlay = document.getElementById('thulirvaOfflineOverlay');
            const retryBtn = document.getElementById('offlineRetryBtn');
            const statusMsg = document.getElementById('offlineStatusMsg');

            if (isManual && retryBtn) {
                retryBtn.className = 'offline-btn-retry success';
                retryBtn.innerHTML = '<span class="btn-retry-icon">✓</span><span class="btn-retry-text">Connected!</span>';
                if (statusMsg) {
                    statusMsg.className = 'offline-status-msg success';
                    statusMsg.textContent = 'Connection restored! Returning to store...';
                }

                setTimeout(() => {
                    this.finishRestore(overlay, retryBtn, statusMsg);
                }, 500);
            } else {
                this.finishRestore(overlay, retryBtn, statusMsg);
            }
        },

        finishRestore(overlay, retryBtn, statusMsg) {
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.setAttribute('aria-hidden', 'true');
            }

            if (retryBtn) {
                retryBtn.className = 'offline-btn-retry';
                retryBtn.innerHTML = '<span class="btn-retry-icon">⟳</span><span class="btn-retry-text">Try Again</span>';
            }

            if (statusMsg) {
                statusMsg.textContent = '';
                statusMsg.className = 'offline-status-msg';
            }

            // Dispatch custom connection restored event for pages to refresh active grids without reload
            window.dispatchEvent(new CustomEvent('thulirva:connection-restored'));

            // If on shop page or home page with product grid, trigger gentle re-fetch
            if (typeof window.loadShopProducts === 'function') {
                window.loadShopProducts();
            }
            if (typeof window.fetchHomeProducts === 'function') {
                window.fetchHomeProducts();
            }
        },

        async retryManual() {
            const retryBtn = document.getElementById('offlineRetryBtn');
            const statusMsg = document.getElementById('offlineStatusMsg');

            if (!retryBtn || retryBtn.classList.contains('loading')) return;

            retryBtn.className = 'offline-btn-retry loading';
            retryBtn.innerHTML = '<span class="btn-retry-icon">⟳</span><span class="btn-retry-text">Checking Connection...</span>';

            if (statusMsg) {
                statusMsg.className = 'offline-status-msg info';
                statusMsg.textContent = 'Verifying connection to Thulirva servers...';
            }

            // Small natural delay so user sees feedback
            await new Promise(r => setTimeout(r, 450));

            const success = await this.checkConnection({ isManual: true });

            if (!success) {
                retryBtn.className = 'offline-btn-retry error-shake';
                retryBtn.innerHTML = '<span class="btn-retry-icon">⟳</span><span class="btn-retry-text">Try Again</span>';

                if (statusMsg) {
                    statusMsg.className = 'offline-status-msg error';
                    statusMsg.textContent = 'Still unable to reach the server. Retrying automatically...';
                }

                setTimeout(() => {
                    retryBtn.classList.remove('error-shake');
                }, 500);
            }
        },

        startAutoRetryPoll() {
            this.stopAutoRetryPoll();
            this.countdownSec = 8;

            this.pollTimer = setInterval(async () => {
                if (this.isOnline) {
                    this.stopAutoRetryPoll();
                    return;
                }

                const statusMsg = document.getElementById('offlineStatusMsg');
                if (statusMsg && !document.getElementById('offlineRetryBtn')?.classList.contains('loading')) {
                    statusMsg.className = 'offline-status-msg info';
                    statusMsg.textContent = 'Checking server status...';
                }

                const ok = await this.checkConnection();
                if (ok && statusMsg) {
                    statusMsg.textContent = '';
                }
            }, 8000);
        },

        stopAutoRetryPoll() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        }
    };

    // Expose globally
    window.ThulirvaConnectivity = ThulirvaConnectivity;

    // Auto-initialize
    ThulirvaConnectivity.init();

})(window, document);
