(function () {
  const links = document.querySelectorAll("nav a[data-nav]");
  const path = location.pathname.split("/").pop() || "index.html";

  links.forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
  });

  const y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
})();
