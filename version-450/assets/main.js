(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 420) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    var filterGrid = document.querySelector('[data-filter-grid]');

    if (filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-movie-card]'));
        var filterInput = document.querySelector('[data-filter-input]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var emptyState = document.querySelector('[data-empty-state]');

        var applyFilter = function () {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var matchKeyword = keyword === '' || text.indexOf(keyword) !== -1;
                var matchYear = year === '' || card.getAttribute('data-year') === year;
                var matchType = type === '' || card.getAttribute('data-type') === type;
                var isVisible = matchKeyword && matchYear && matchType;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        };

        [filterInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }
})();

function setupMoviePlayer(source) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    var beginPlay = function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', source);
            }
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.play().catch(function () {});
            }
            return;
        }

        if (!video.getAttribute('src')) {
            video.setAttribute('src', source);
        }
        video.play().catch(function () {});
    };

    if (overlay) {
        overlay.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            beginPlay();
        }
    });
}
