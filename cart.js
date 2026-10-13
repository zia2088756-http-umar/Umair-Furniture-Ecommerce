
document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("Cart-Items");
  const cartMessage = document.getElementById("Cart-Message");
  const totalItemsElement = document.getElementById("Total-Items");
  const subtotalElement = document.getElementById("Subtotal");
  const grandTotalElement = document.getElementById("Grand-Total");
  const checkoutButton = document.getElementById("Checkout-Button");
  const clearCartButton = document.getElementById("Clear-Cart");

  const CART_KEY = "umairFurnitureCart";

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function getCart() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

      if (!Array.isArray(cart)) return [];

      return cart.filter(item =>
        item &&
        typeof item.productId === "string" &&
        typeof item.name === "string" &&
        typeof item.image === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0
      );
    } catch (error) {
      console.error("Cart data error:", error);
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function formatPrice(amount) {
    return "Rs. " + amount.toLocaleString("en-PK");
  }

  function renderCart() {
    const cart = getCart();

    saveCart(cart);

    const totalQuantity = cart.reduce(
      (total, item) => total + item.quantity, 0
    );

    const subtotal = cart.reduce(
      (total, item) => total + Number(item.price) * item.quantity, 0
    );

    totalItemsElement.textContent = totalQuantity;
    subtotalElement.textContent = formatPrice(subtotal);
    grandTotalElement.textContent = formatPrice(subtotal);

    checkoutButton.disabled = cart.length === 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="Empty-Cart">
          <h2>Your cart is empty!</h2>
          <p>Add some beautiful furniture to get started.</p>
          <a href="./Main_Work.html">Browse Products</a>
        </div>
      `;

      cartMessage.textContent = "";
      return;
    }

    cartMessage.textContent = "";

    cartItemsContainer.innerHTML = cart.map(item => `
      <article class="Cart-Item">
        <img
          src="${escapeHTML(item.image)}"
          alt="${escapeHTML(item.name)}"
        >

        <div class="Item-Details">
          <h3>${escapeHTML(item.name)}</h3>

          <p class="Item-Price">
            ${formatPrice(Number(item.price))}
          </p>

          <div class="Quantity-Controls">
            <button
              type="button"
              data-action="decrease"
              data-id="${escapeHTML(item.productId)}"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.quantity}</span>

            <button
              type="button"
              data-action="increase"
              data-id="${escapeHTML(item.productId)}"
              aria-label="Increase quantity"
            >+</button>
          </div>

          <button
            type="button"
            class="Remove-Button"
            data-action="remove"
            data-id="${escapeHTML(item.productId)}"
          >Remove</button>

          <p class="Item-Subtotal">
            Subtotal: ${formatPrice(Number(item.price) * item.quantity)}
          </p>
        </div>
      </article>
    `).join("");
  }

  cartItemsContainer.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const productId = button.dataset.id;
    const cart = getCart();

    const product = cart.find(item => item.productId === productId);

    if (!product) return;

    if (action === "increase") {
      if (product.quantity < 99) {
        product.quantity += 1;
      }
    } else if (action === "decrease") {
      product.quantity -= 1;

      if (product.quantity <= 0) {
        const updatedCart = cart.filter(
          item => item.productId !== productId
        );

        saveCart(updatedCart);
        renderCart();
        return;
      }
    } else if (action === "remove") {
      const updatedCart = cart.filter(
        item => item.productId !== productId
      );

      saveCart(updatedCart);
      renderCart();
      return;
    }

    saveCart(cart);
    renderCart();
  });

  clearCartButton.addEventListener("click", () => {
    const cart = getCart();

    if (cart.length === 0) return;

    if (confirm("Are you sure you want to clear your cart?")) {
      localStorage.removeItem(CART_KEY);
      renderCart();
    }
  });

  checkoutButton.addEventListener("click", () => {
    if (getCart().length === 0) return;

    // Checkout page will be implemented in the next step.
    window.location.href = "./Checkout.html";
  });

  renderCart();
});
