(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            toggle.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function collectYears(cards) {
        var years = [];
        cards.forEach(function (card) {
            var year = card.getAttribute("data-year");
            if (year && years.indexOf(year) === -1) {
                years.push(year);
            }
        });
        years.sort(function (a, b) {
            return Number(b) - Number(a);
        });
        return years;
    }

    function initFilters() {
        document.querySelectorAll("[data-card-list]").forEach(function (list) {
            var section = list.closest("section") || document;
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var search = section.querySelector("[data-local-search]");
            var year = section.querySelector("[data-year-filter]");
            var sort = section.querySelector("[data-sort-cards]");
            var empty = section.querySelector("[data-empty-state]");
            if (year && year.options.length <= 1) {
                collectYears(cards).forEach(function (item) {
                    var option = document.createElement("option");
                    option.value = item;
                    option.textContent = item;
                    year.appendChild(option);
                });
            }
            function apply() {
                var query = text(search ? search.value : "");
                var selectedYear = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var keywords = text(card.getAttribute("data-keywords"));
                    var title = text(card.getAttribute("data-title"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var matchesQuery = !query || keywords.indexOf(query) !== -1 || title.indexOf(query) !== -1;
                    var matchesYear = !selectedYear || cardYear === selectedYear;
                    var shouldShow = matchesQuery && matchesYear;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            function reorder() {
                if (!sort || sort.value === "default") {
                    apply();
                    return;
                }
                var sorted = cards.slice().sort(function (a, b) {
                    if (sort.value === "views") {
                        return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
                    }
                    if (sort.value === "year") {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    }
                    return 0;
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
                cards = sorted;
                apply();
            }
            if (search) {
                search.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (sort) {
                sort.addEventListener("change", reorder);
            }
            apply();
        });
    }

    function renderSearchCard(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(" ") : "";
        return "<article class=\"movie-card\" data-movie-card data-title=\"" + escapeHtml(movie.title) + "\" data-keywords=\"" + escapeHtml(movie.title + " " + movie.description + " " + tags + " " + movie.genre) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-views=\"" + escapeHtml(movie.views) + "\">" +
            "<a class=\"movie-card-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<span class=\"poster-frame\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-badge\">" + escapeHtml(movie.category) + "</span><span class=\"poster-shine\"></span></span>" +
            "<span class=\"movie-card-body\"><strong class=\"movie-title\">" + escapeHtml(movie.title) + "</strong><span class=\"movie-desc\">" + escapeHtml(movie.description) + "</span><span class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></span></span>" +
            "</a></article>";
    }

    function initSearchPage() {
        var container = document.querySelector("[data-search-results]");
        if (!container || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-page-input]");
        var title = document.querySelector("[data-search-title]");
        var empty = document.querySelector("[data-search-empty]");
        if (input) {
            input.value = query;
        }
        var results;
        if (query) {
            var needle = text(query);
            results = window.SEARCH_DATA.filter(function (movie) {
                var haystack = text(movie.title + " " + movie.description + " " + movie.category + " " + movie.year + " " + movie.region + " " + movie.type + " " + movie.genre + " " + (movie.tags || []).join(" "));
                return haystack.indexOf(needle) !== -1;
            });
            if (title) {
                title.textContent = "搜索：“" + query + "”";
            }
        } else {
            results = window.SEARCH_DATA.slice().sort(function (a, b) {
                return Number(b.views || 0) - Number(a.views || 0);
            }).slice(0, 48);
            if (title) {
                title.textContent = "热门影片";
            }
        }
        container.innerHTML = results.map(renderSearchCard).join("");
        if (empty) {
            empty.classList.toggle("is-visible", results.length === 0);
        }
    }

    function attachHls(video, source) {
        if (!source || video.getAttribute("data-hls-ready") === "true") {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.removeAttribute("data-hls-ready");
                }
            });
            video._hlsInstance = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        }
        video.setAttribute("data-hls-ready", "true");
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            if (!video) {
                return;
            }
            var source = video.getAttribute("data-src");
            attachHls(video, source);
            function play() {
                attachHls(video, source);
                var promise = video.play();
                if (button) {
                    button.classList.add("is-hidden");
                }
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }
            if (button) {
                button.addEventListener("click", play);
            }
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
        });
    }

    function initShareButtons() {
        document.querySelectorAll("[data-share-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                var title = document.title;
                var url = window.location.href;
                if (navigator.share) {
                    navigator.share({ title: title, url: url }).catch(function () {});
                } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(function () {
                        button.textContent = "已复制";
                        window.setTimeout(function () {
                            button.textContent = "分享";
                        }, 1500);
                    });
                }
            });
        });
    }

    ready(function () {
        initSearchForms();
        initMobileNav();
        initHero();
        initFilters();
        initSearchPage();
        initPlayers();
        initShareButtons();
    });
}());
