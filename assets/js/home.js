document.addEventListener("DOMContentLoaded", () => {
  /**
   * Typing animation
   */
  const initializeTypingEffect = () => {
    const typingElement = document.querySelector(".typing-text");

    if (!typingElement) {
      return;
    }

    const typingItems = (typingElement.dataset.typingItems || "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!typingItems.length) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      typingElement.textContent = typingItems[0];
      return;
    }

    let itemIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;

    const typeText = () => {
      const currentItem = typingItems[itemIndex];

      characterIndex += isDeleting ? -1 : 1;
      typingElement.textContent = currentItem.slice(0, characterIndex);

      let delay = isDeleting ? 45 : 85;

      if (!isDeleting && characterIndex === currentItem.length) {
        isDeleting = true;
        delay = 1500;
      } else if (isDeleting && characterIndex === 0) {
        isDeleting = false;
        itemIndex = (itemIndex + 1) % typingItems.length;
        delay = 350;
      }

      window.setTimeout(typeText, delay);
    };

    typeText();
  };

  /**
   * Navbar scroll spy and click navigation
   */
  const initializeNavbarScrollSpy = () => {
    const header = document.getElementById("site-header");

    const navigationLinks = Array.from(
      document.querySelectorAll('.nav-links a[href^="#"]'),
    );

    const navigationItems = navigationLinks
      .map((link) => {
        const sectionSelector = link.getAttribute("href");
        const section = sectionSelector
          ? document.querySelector(sectionSelector)
          : null;

        return {
          link,
          section,
        };
      })
      .filter(({ section }) => section);

    if (!navigationItems.length) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let lockedSectionId = null;
    let releaseTimer = null;
    let updatePending = false;

    const getHeaderHeight = () => {
      return header ? header.offsetHeight : 0;
    };

    const setActiveNavigationLink = (sectionId) => {
      navigationItems.forEach(({ link, section }) => {
        const isActive = section.id === sectionId;

        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const updateActiveNavigationLink = () => {
      /*
       * While smooth scrolling after a click, keep the clicked
       * navigation link active instead of detecting the old section.
       */
      if (lockedSectionId) {
        setActiveNavigationLink(lockedSectionId);
        return;
      }

      const detectionPoint =
        window.scrollY + getHeaderHeight() + 120;

      let activeSectionId = navigationItems[0].section.id;

      navigationItems.forEach(({ section }) => {
        if (section.offsetTop <= detectionPoint) {
          activeSectionId = section.id;
        }
      });

      const reachedPageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5;

      if (reachedPageBottom) {
        activeSectionId =
          navigationItems[navigationItems.length - 1].section.id;
      }

      setActiveNavigationLink(activeSectionId);
    };

    const requestNavbarUpdate = () => {
      if (updatePending) {
        return;
      }

      updatePending = true;

      window.requestAnimationFrame(() => {
        updateActiveNavigationLink();
        updatePending = false;
      });
    };

    navigationItems.forEach(({ link, section }) => {
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          lockedSectionId = section.id;
          setActiveNavigationLink(section.id);

          /*
           * Run again after other navbar click handlers.
           * This prevents another script from restoring Home as active.
           */
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              setActiveNavigationLink(section.id);
            });
          });

          const targetPosition = Math.max(
            0,
            section.offsetTop - getHeaderHeight() - 15,
          );

          window.scrollTo({
            top: targetPosition,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });

          window.history.replaceState(
            null,
            "",
            `#${section.id}`,
          );

          if (releaseTimer) {
            window.clearTimeout(releaseTimer);
          }

          releaseTimer = window.setTimeout(() => {
            lockedSectionId = null;
            updateActiveNavigationLink();
          }, prefersReducedMotion ? 50 : 1000);
        },
        true,
      );
    });

    window.addEventListener("scroll", requestNavbarUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestNavbarUpdate);

    window.addEventListener("load", () => {
      const hashSection = window.location.hash
        ? document.querySelector(window.location.hash)
        : null;

      if (hashSection) {
        setActiveNavigationLink(hashSection.id);
      } else {
        updateActiveNavigationLink();
      }
    });

    updateActiveNavigationLink();
  };


  /**
   * SEO audit modal
   */
  const initializeAuditModal = () => {
    const modal = document.getElementById("audit-report-modal");
    const openButton = document.getElementById("audit-modal-open");

    if (!modal || !openButton) {
      return;
    }

    const dialog = modal.querySelector(".audit-modal-dialog");

    const closeButtons = modal.querySelectorAll(
      "[data-audit-modal-close]",
    );

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    let previouslyFocusedElement = null;

    const openModal = () => {
      previouslyFocusedElement = document.activeElement;

      modal.hidden = false;
      document.body.classList.add("audit-modal-open");
      openButton.setAttribute("aria-expanded", "true");

      window.requestAnimationFrame(() => {
        dialog?.focus();
      });
    };

    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove("audit-modal-open");
      openButton.setAttribute("aria-expanded", "false");

      if (
        previouslyFocusedElement instanceof HTMLElement
      ) {
        previouslyFocusedElement.focus();
      }
    };

    const trapKeyboardFocus = (event) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        modal.querySelectorAll(focusableSelector),
      ).filter((element) => {
        return (
          element instanceof HTMLElement &&
          element.offsetParent !== null
        );
      });

      if (!focusableElements.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    openButton.addEventListener("click", openModal);

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    modal.addEventListener("keydown", trapKeyboardFocus);
  };


  initializeTypingEffect();
  initializeNavbarScrollSpy();
  initializeAuditModal();
});

