const mobileToggle = document.querySelector("[data-mobile-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (mobileToggle && mobileNav) {
  mobileToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  const start = () => {
    timer = window.setInterval(() => showSlide(current + 1), 5000);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.heroDot));
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      showSlide(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      showSlide(current + 1);
      restart();
    });
  }

  start();
}

const searchForms = document.querySelectorAll("[data-search-form]");

searchForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    const input = form.querySelector("input[name='q']");
    if (!input || !input.value.trim()) {
      event.preventDefault();
      window.location.href = "./search.html";
    }
  });
});

const filterForms = document.querySelectorAll("[data-filter-form]");

filterForms.forEach((form) => {
  const searchInput = form.querySelector("[data-local-search]");
  const typeSelect = form.querySelector("[data-type-filter]");
  const list = document.querySelector("[data-filter-list]");
  const emptyState = document.querySelector("[data-empty-state]");

  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll("[data-card]"));
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const normalize = (value) => value.trim().toLowerCase();

  const applyFilter = () => {
    const query = searchInput ? normalize(searchInput.value) : "";
    const type = typeSelect ? typeSelect.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.dataset.text || "");
      const cardType = card.dataset.type || "";
      const matchedQuery = !query || haystack.includes(query);
      const matchedType = !type || cardType === type;
      const shouldShow = matchedQuery && matchedType;

      card.classList.toggle("is-hidden", !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  };

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", applyFilter);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilter();
  });

  applyFilter();
});
