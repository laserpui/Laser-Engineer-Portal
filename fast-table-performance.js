(function () {
    'use strict';

    const CACHE_NAME = 'laser-engineer-csv-v1';
    const MAX_AGE_MS = 5 * 60 * 1000;
    const trackedUrls = new Set();
    let fetchInstalled = false;
    let nativeFetch = null;

    function cacheRequestUrl(url) {
        const base = location.origin && location.origin !== 'null' ? location.origin : 'https://local.invalid';
        let hash = 2166136261;
        for (let i = 0; i < url.length; i += 1) {
            hash ^= url.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return new URL(`/__csv_cache/${(hash >>> 0).toString(16)}`, base).href;
    }

    async function readCsv(url) {
        if (!('caches' in window)) return null;
        try {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(cacheRequestUrl(url));
            if (!response) return null;
            const savedAt = Number(response.headers.get('x-saved-at')) || 0;
            if (Date.now() - savedAt > MAX_AGE_MS) return null;
            return await response.text();
        } catch (error) {
            console.warn('CSV cache read failed:', error);
            return null;
        }
    }

    async function writeCsv(url, text) {
        if (!('caches' in window)) return;
        const trimmed = text.trim().toLowerCase();
        if (!text || trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) return;
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(cacheRequestUrl(url), new Response(text, {
                headers: {
                    'content-type': 'text/csv; charset=utf-8',
                    'x-saved-at': String(Date.now())
                }
            }));
        } catch (error) {
            console.warn('CSV cache write failed:', error);
        }
    }

    async function clearCsv(url) {
        if (!('caches' in window)) return;
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.delete(cacheRequestUrl(url));
        } catch (error) {
            console.warn('CSV cache clear failed:', error);
        }
    }

    function installCsvFetchCache(urls) {
        urls.forEach(url => trackedUrls.add(url));
        if (fetchInstalled) return;
        fetchInstalled = true;
        nativeFetch = window.fetch.bind(window);

        window.fetch = async function cachedFetch(input, init) {
            const requestUrl = typeof input === 'string' ? input : input && input.url;
            const method = (init && init.method) || (input && input.method) || 'GET';
            const cleanUrl = requestUrl ? requestUrl.split('#')[0] : '';
            const trackedUrl = Array.from(trackedUrls).find(url => cleanUrl === url);

            if (!trackedUrl || method.toUpperCase() !== 'GET') {
                return nativeFetch(input, init);
            }

            const cachedText = await readCsv(trackedUrl);
            if (cachedText !== null) {
                return new Response(cachedText, {
                    status: 200,
                    headers: { 'content-type': 'text/csv; charset=utf-8', 'x-fast-cache': 'hit' }
                });
            }

            const response = await nativeFetch(input, init);
            if (response.ok) {
                response.clone().text().then(text => writeCsv(trackedUrl, text));
            }
            return response;
        };
    }

    function debounce(fn, wait) {
        let timeoutId;
        const delay = Number.isFinite(wait) ? wait : 220;
        return function debounced(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    function ensurePagerStyles() {
        if (document.getElementById('fast-table-pager-styles')) return;
        const style = document.createElement('style');
        style.id = 'fast-table-pager-styles';
        style.textContent = `
            .fast-table-pager { display:flex; align-items:center; justify-content:center; gap:.55rem; flex-wrap:wrap; padding:.8rem 1rem; border-top:1px solid rgba(148,163,184,.2); background:rgba(255,255,255,.45); font:600 12px/1.4 Sarabun, sans-serif; color:#64748b; }
            .fast-table-pager button { border:1px solid rgba(148,163,184,.35); background:rgba(255,255,255,.8); color:#334155; border-radius:.7rem; padding:.42rem .72rem; cursor:pointer; transition:.15s ease; }
            .fast-table-pager button:hover:not(:disabled) { background:#2563eb; border-color:#2563eb; color:white; }
            .fast-table-pager button:disabled { opacity:.4; cursor:not-allowed; }
            .fast-table-pager .fast-table-page { min-width:6.5rem; text-align:center; }
        `;
        document.head.appendChild(style);
    }

    function renderPager(anchor, page, total, pageSize, onChange) {
        if (!anchor) return;
        ensurePagerStyles();
        const id = `${anchor.id || 'fast-table'}-pager`;
        let pager = document.getElementById(id);
        if (!pager) {
            pager = document.createElement('div');
            pager.id = id;
            pager.className = 'fast-table-pager';
            anchor.insertAdjacentElement('afterend', pager);
        }

        if (total <= pageSize) {
            pager.classList.add('hidden');
            pager.style.display = 'none';
            return;
        }

        pager.classList.remove('hidden');
        pager.style.display = 'flex';
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const start = (safePage - 1) * pageSize + 1;
        const end = Math.min(total, safePage * pageSize);
        pager.innerHTML = `
            <button type="button" data-page="${safePage - 1}" ${safePage <= 1 ? 'disabled' : ''}>ก่อนหน้า</button>
            <span class="fast-table-page">หน้า ${safePage.toLocaleString('th-TH')} / ${totalPages.toLocaleString('th-TH')}</span>
            <button type="button" data-page="${safePage + 1}" ${safePage >= totalPages ? 'disabled' : ''}>ถัดไป</button>
            <span>แสดง ${start.toLocaleString('th-TH')}-${end.toLocaleString('th-TH')} จาก ${total.toLocaleString('th-TH')} รายการ</span>
        `;
        pager.querySelectorAll('button[data-page]').forEach(button => {
            button.addEventListener('click', () => onChange(Number(button.dataset.page)));
        });
    }

    window.FastTableUtils = {
        clearCsv,
        debounce,
        installCsvFetchCache,
        renderPager
    };
}());