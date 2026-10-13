
document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = document.querySelectorAll(".Category-Card");
  const productGrid = document.getElementById("Product-Grid");
  const productMessage = document.getElementById("Product-Message");

  const keywords = {
    desk: ["desk", "study"],
    chair: ["chair", "armchair"],
    sofa: ["sofa", "couch"]
  };

  let selectedCategory = "all";

  function filterProducts(category) {
    selectedCategory = category;

    if (!productGrid) return;

    const cards = Array.from(productGrid.children);
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();

      const matches =
        category === "all" ||
        (keywords[category] || []).some((word) =>
          text.includes(word)
        );

      card.hidden = !matches;

      if (matches) visibleCount++;
    });

    if (productMessage) {
      if (cards.length === 0) {
        productMessage.textContent = "Products are still loading.";
      } else if (visibleCount === 0) {
        productMessage.textContent =
          "No products found in this category. Try another category.";
      } else {
        productMessage.textContent = "";
      }
    }

    document.getElementById("products-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterProducts(button.dataset.category);
    });
  });

  // Product cards are loaded asynchronously from the API.
  if (productGrid) {
    const observer = new MutationObserver(() => {
      filterProducts(selectedCategory);
    });

    observer.observe(productGrid, { childList: true });
  }
});
