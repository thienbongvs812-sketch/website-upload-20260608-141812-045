const state = {
    heroTimer: null,
    hlsPlayers: new WeakMap()
};

function setupMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
        return;
    }
    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        menu.hidden = isOpen;
    });
}

function setupHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
        return;
    }
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    if (slides.length <= 1) {
        return;
    }
    let index = 0;
    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };
    const restart = () => {
        window.clearInterval(state.heroTimer);
        state.heroTimer = window.setInterval(() => show(index + 1), 5200);
    };
    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            show(dotIndex);
            restart();
        });
    });
    if (prev) {
        prev.addEventListener('click', () => {
            show(index - 1);
            restart();
        });
    }
    if (next) {
        next.addEventListener('click', () => {
            show(index + 1);
            restart();
        });
    }
    restart();
}

function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
}

function setupFilters() {
    const panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach((panel) => {
        const section = panel.closest('section') || document;
        const cards = Array.from(section.querySelectorAll('.movie-card, .ranking-row'));
        const keyword = panel.querySelector('.filter-keyword');
        const year = panel.querySelector('.filter-year');
        const region = panel.querySelector('.filter-region');
        const category = panel.querySelector('.filter-category');
        const counter = panel.querySelector('.filter-count');
        const params = new URLSearchParams(window.location.search);
        const queryValue = params.get('q') || '';
        if (keyword && queryValue) {
            keyword.value = queryValue;
        }
        const apply = () => {
            const q = normalize(keyword ? keyword.value : '');
            const y = normalize(year ? year.value : '');
            const r = normalize(region ? region.value : '');
            const c = normalize(category ? category.value : '');
            let visible = 0;
            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.year,
                    card.dataset.region
                ].join(' '));
                const matchesKeyword = !q || haystack.includes(q);
                const matchesYear = !y || normalize(card.dataset.year) === y;
                const matchesRegion = !r || normalize(card.dataset.region).includes(r);
                const cardCategory = normalize(card.dataset.category || card.querySelector('.movie-badge')?.textContent || card.querySelector('.rank-info span')?.textContent || '');
                const matchesCategory = !c || cardCategory.includes(c) || haystack.includes(c);
                const shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesCategory;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = String(visible);
            }
        };
        [keyword, year, region, category].filter(Boolean).forEach((control) => {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
        apply();
    });
}

async function attachHls(video, src) {
    if (video.dataset.ready === 'true') {
        return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.dataset.ready = 'true';
        return;
    }
    const module = await import('./hls-dru42stk.js');
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
        const player = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        player.loadSource(src);
        player.attachMedia(video);
        player.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                player.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                player.recoverMediaError();
            } else {
                player.destroy();
            }
        });
        state.hlsPlayers.set(video, player);
        video.dataset.ready = 'true';
        return;
    }
    video.src = src;
    video.dataset.ready = 'true';
}

function setupPlayers() {
    const shells = document.querySelectorAll('.player-shell[data-hls]');
    shells.forEach((shell) => {
        const src = shell.dataset.hls;
        const video = shell.querySelector('video');
        const overlay = shell.querySelector('.player-overlay');
        if (!src || !video) {
            return;
        }
        const start = async () => {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            try {
                await attachHls(video, src);
                await video.play();
            } catch (error) {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            }
        };
        if (overlay) {
            overlay.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }
        shell.addEventListener('click', (event) => {
            if (event.target === video && video.dataset.ready === 'true') {
                return;
            }
            start();
        });
        video.addEventListener('play', () => {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', () => {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
});
