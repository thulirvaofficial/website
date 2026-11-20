/**
 * THULIRVA Agro & Dairy — Global Connectivity & Static Offline Screen Manager
 * Features reliable network & backend health verification, debounced retry,
 * zero illustration animation, artifact-free visual presentation, and seamless restoration.
 */

(function (window, document) {
    'use strict';

    const ThulirvaConnectivity = {
        isOnline: true,
        isChecking: false,
        pollTimer: null,
        healthEndpoint: '/api/health',
        timeoutMs: 4000,
        assetPrefix: '',
        currentState: 'ONLINE', // OFFLINE | CHECKING | SERVER_UNAVAILABLE | RECONNECTING | SUCCESS

        init() {
            // Determine relative asset prefix for root vs nested /pages/
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

            // Initial connectivity check
            if (!navigator.onLine) {
                this.showOffline('OFFLINE');
            } else {
                this.checkConnection({ silent: true });
            }
        },

        injectOverlay() {
            if (document.getElementById('thulirvaOfflineOverlay')) return;

            const logoSrc = `${this.assetPrefix}assets/images/thulirva_brand_logo.png`;
            const staticImgSrc = `${this.assetPrefix}assets/images/no_internet_anime.png`;
            const fallbackImgSrc = `${this.assetPrefix}assets/offline/no_internet_static.png`;

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

                    <!-- 100% Static Reference Artwork (Girl, Cow, Clean Wi-Fi Bubble, Farm) -->
                    <div class="offline-scene-wrapper">
                        <div class="offline-scene" id="thulirvaOfflineScene">
                            <img src="${staticImgSrc}" 
                                 alt="No Internet Connection - Thulirva" 
                                 class="offline-static-illustration" 
                                 loading="eager"
                                 decoding="async"
                                 onerror="this.onerror=null; this.src='${fallbackImgSrc}';">
                        </div>
                    </div>

                    <!-- Offline Text Content & Dynamic Status -->
                    <div class="offline-content">
                        <h2 id="offlineTitle" class="offline-title">No Internet Connection</h2>
                        <p id="offlineDesc" class="offline-desc">
                            We couldn't reach the server. Please check your internet connection and try again.
                        </p>

                        <div class="offline-actions">
                            <button id="offlineRetryBtn" class="offline-btn-retry" type="button" aria-label="Retry connection">
                                <span class="btn-retry-icon" id="offlineRetryIcon">⟳</span>
                                <span class="btn-retry-text" id="offlineRetryText">Try Again</span>
                            </button>
                        </div>

                        <div id="offlineStatusMsg" class="offline-status-msg" aria-live="polite"></div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Bind Retry Button click with duplicate request prevention
            const retryBtn = document.getElementById('offlineRetryBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!this.isChecking) {
                        this.retryManual();
                    }
                });
            }
        },

        bindEvents() {
            window.addEventListener('online', () => {
                this.checkConnection({ isOnlineEvent: true });
            });

            window.addEventListener('offline', () => {
                this.showOffline('OFFLINE');
            });
        },

        hookFetch() {
            if (window._thulirvaFetchHooked) return;
            window._thulirvaFetchHooked = true;

            const originalFetch = window.fetch;
            const self = this;

            window.fetch = async function (...args) {
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                const isApiRequest = url.includes('/api/') || url.includes(':5500');

                try {
                    const response = await originalFetch.apply(this, args);
                    if (isApiRequest && (response.status === 502 || response.status === 503 || response.status === 504)) {
                        self.checkConnection({ silent: true });
                    }
                    return response;
                } catch (error) {
                    if (isApiRequest && !url.includes('/api/health')) {
                        self.checkConnection({ silent: true });
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
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                    signal: controller.signal
                });
                clearTimeout(timer);
                return res.ok;
            } catch (_) {
                clearTimeout(timer);
                // Fallback check to root API status
                try {
                    const fallbackController = new AbortController();
                    const fbTimer = setTimeout(() => fallbackController.abort(), 2000);
                    const fbRes = await fetch(`/api?_t=${Date.now()}`, {
                        method: 'GET',
                        cache: 'no-store',
                        signal: fallbackController.signal
                    });
                    clearTimeout(fbTimer);
                    return fbRes.ok;
                } catch (__) {
                    return false;
                }
            }
        },

        updateStateUI(stateName) {
            this.currentState = stateName;
            const titleEl = document.getElementById('offlineTitle');
            const descEl = document.getElementById('offlineDesc');
            const statusEl = document.getElementById('offlineStatusMsg');

            if (!titleEl || !descEl || !statusEl) return;

            switch (stateName) {
                case 'CHECKING':
                    statusEl.className = 'offline-status-msg status-checking';
                    statusEl.textContent = 'Checking connection...';
                    break;

                case 'RECONNECTING':
                    statusEl.className = 'offline-status-msg status-reconnecting';
                    statusEl.textContent = 'Reconnecting...';
                    break;

                case 'SERVER_UNAVAILABLE':
                    titleEl.textContent = 'Server Unavailable';
                    descEl.textContent = 'Your internet is active, but we are unable to reach Thulirva servers. Please try again shortly.';
                    statusEl.className = 'offline-status-msg status-server-down';
                    statusEl.textContent = 'Unable to reach Thulirva servers';
                    break;

                case 'SUCCESS':
                    titleEl.textContent = 'Connected!';
                    descEl.textContent = 'Connection restored! Returning to store...';
                    statusEl.className = 'offline-status-msg status-success';
                    statusEl.textContent = 'Connection restored! Returning to store...';
                    break;

                case 'OFFLINE':
                default:
                    titleEl.textContent = 'No Internet Connection';
                    descEl.textContent = "We couldn't reach the server. Please check your internet connection and try again.";
                    statusEl.className = 'offline-status-msg status-offline';
                    statusEl.textContent = 'No internet connection';
                    break;
            }
        },

        setButtonState(mode) {
            const btn = document.getElementById('offlineRetryBtn');
            const icon = document.getElementById('offlineRetryIcon');
            const text = document.getElementById('offlineRetryText');

            if (!btn || !icon || !text) return;

            if (mode === 'loading') {
                btn.disabled = true;
                btn.className = 'offline-btn-retry is-loading';
                icon.innerHTML = '<span class="offline-btn-spinner"></span>';
                text.textContent = 'Checking...';
            } else if (mode === 'success') {
                btn.disabled = true;
                btn.className = 'offline-btn-retry is-success';
                icon.innerHTML = '✓';
                text.textContent = 'Connected!';
            } else if (mode === 'error') {
                btn.disabled = false;
                btn.className = 'offline-btn-retry is-error';
                icon.innerHTML = '⟳';
                text.textContent = 'Try Again';
                setTimeout(() => {
                    btn.classList.remove('is-error');
                }, 400);
            } else {
                btn.disabled = false;
                btn.className = 'offline-btn-retry';
                icon.innerHTML = '⟳';
                text.textContent = 'Try Again';
            }
        },

        async checkConnection(options = {}) {
            if (this.isChecking) return false;
            this.isChecking = true;

            const isManual = !!options.isManual;
            const isAutoPoll = !!options.isAutoPoll;

            if (isManual) {
                this.updateStateUI('CHECKING');
                this.setButtonState('loading');
            } else if (isAutoPoll) {
                this.updateStateUI('RECONNECTING');
            }

            // 1. Verify browser hardware network status
            const browserOnline = navigator.onLine;
            if (!browserOnline) {
                this.isChecking = false;
                this.showOffline('OFFLINE');
                if (isManual) {
                    this.setButtonState('error');
                }
                return false;
            }

            // 2. Verify backend availability
            let backendHealthy = false;
            try {
                backendHealthy = await this.pingBackend();
            } catch (_) {
                backendHealthy = false;
            }

            this.isChecking = false;

            if (backendHealthy) {
                this.updateStateUI('SUCCESS');
                if (isManual) {
                    this.setButtonState('success');
                    setTimeout(() => {
                        this.hideOffline();
                    }, 500);
                } else {
                    this.hideOffline();
                }
                return true;
            } else {
                this.showOffline('SERVER_UNAVAILABLE');
                if (isManual) {
                    this.setButtonState('error');
                }
                return false;
            }
        },

        showOffline(stateReason = 'OFFLINE') {
            this.isOnline = false;

            const overlay = document.getElementById('thulirvaOfflineOverlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.setAttribute('aria-hidden', 'false');
            }

            this.updateStateUI(stateReason);
            this.startAutoRetryPoll();
        },

        hideOffline() {
            this.isOnline = true;
            this.stopAutoRetryPoll();

            const overlay = document.getElementById('thulirvaOfflineOverlay');
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.setAttribute('aria-hidden', 'true');
            }

            this.setButtonState('normal');

            // Dispatch global restoration event for shop/catalog views to re-sync
            window.dispatchEvent(new CustomEvent('thulirva:connection-restored'));

            if (typeof window.loadShopProducts === 'function') {
                window.loadShopProducts();
            }
            if (typeof window.fetchHomeProducts === 'function') {
                window.fetchHomeProducts();
            }
        },

        async retryManual() {
            // Prevent duplicate requests during active check
            if (this.isChecking) return;
            // Give user immediate UI feedback
            await this.checkConnection({ isManual: true });
        },

        startAutoRetryPoll() {
            this.stopAutoRetryPoll();

            this.pollTimer = setInterval(async () => {
                if (this.isOnline) {
                    this.stopAutoRetryPoll();
                    return;
                }

                // If user is not currently in the middle of a manual check, run background poll
                if (!this.isChecking) {
                    await this.checkConnection({ isAutoPoll: true });
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
