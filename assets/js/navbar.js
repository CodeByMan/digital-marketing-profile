document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header-area");
  const menuButton = document.querySelector(".menu-trigger");
  const navigation = document.querySelector(".nav-content");

  if (!header || !menuButton || !navigation) {
    return;
  }

  const isMobileNavigation = () => window.innerWidth <= 1199;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  const openMenu = () => {
    if (!isMobileNavigation()) {
      return;
    }

    navigation.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation menu");
  };

  const closeMenu = () => {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
  };

  const toggleMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (navigation.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, { passive: true });
  menuButton.addEventListener("click", toggleMenu);

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (
      isMobileNavigation() &&
      navigation.classList.contains("is-open") &&
      !header.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileNavigation()) {
      closeMenu();
    }
  });
});
