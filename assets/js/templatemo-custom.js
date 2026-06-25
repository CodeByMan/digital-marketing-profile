(() => {
  "use strict";

  const hidePreloader = () => {
    const preloader = document.querySelector("#js-preloader");

    if (preloader) {
      preloader.classList.add("loaded");
    }
  };

  if (document.readyState === "complete") {
    hidePreloader();
  } else {
    window.addEventListener("load", hidePreloader, { once: true });
  }
})();
