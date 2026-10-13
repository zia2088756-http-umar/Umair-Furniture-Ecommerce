document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "umairFurnitureCart";
  const API_URL = "http://localhost:5000/api/orders";

  const form = document.getElementById("Checkout-Form");
  const message = document.getElementById("Checkout-Message");
  const placeOrderButton = document.getElementById("Place-Order");
  const itemsContainer = document.getElementById("Checkout-Items");
  const subtotalElement = document.getElementById("Checkout-Subtotal");
  const totalElement = document.getElementById("Checkout-Total");
  const successSection = document.getElementById("Order-Success");
  const successMessage = document.getElementById("Success-Message");

  let orderPlaced = false;

  function formatPrice(amount) {
    return "Rs. " + amount.toLocaleString("en-PK");
  }

  function readCart() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

      if (!Array.isArray(cart)) return [];

      return cart.filter(
        (item) =>
          item &&
          typeof item.productId === "string" &&
          typeof item.name === "string" &&
          Number.isSafeInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= 99,
      );
    } catch {
      return [];
    }
  }

  function renderSummary() {
    const cart = readCart();

    if (cart.length === 0) {
      itemsContainer.textContent = "Your cart is empty.";
      subtotalElement.textContent = formatPrice(0);
      totalElement.textContent = formatPrice(0);
      placeOrderButton.disabled = true;
      message.textContent = "Please add products before checkout.";
      return false;
    }

    message.textContent = "";
    placeOrderButton.disabled = false;

    itemsContainer.replaceChildren();

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "Summary-Item";

      const name = document.createElement("span");
      name.textContent = `${item.name} × ${item.quantity}`;

      const price = document.createElement("span");
      price.textContent = formatPrice(Number(item.price) * item.quantity);

      row.append(name, price);
      itemsContainer.appendChild(row);
    });

    const subtotal = cart.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    subtotalElement.textContent = formatPrice(subtotal);
    totalElement.textContent = formatPrice(subtotal);

    return true;
  }

  renderSummary();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (orderPlaced || !renderSummary()) return;

    const cart = readCart();

    const customer = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      address: form.elements.address.value.trim(),
    };

    if (
      customer.name.length < 2 ||
      customer.phone.length < 7 ||
      customer.address.length < 5
    ) {
      message.textContent = "Please enter valid delivery information.";
      return;
    }

    const payload = {
      customer,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    placeOrderButton.disabled = true;
    message.textContent = "Submitting your order...";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to place your order.");
      }

      orderPlaced = true;

      // Save the successfully placed order ID.
      const ORDER_HISTORY_KEY = "umairFurnitureOrderIds";

      try {
        const savedOrderIds = JSON.parse(
          localStorage.getItem(ORDER_HISTORY_KEY) || "[]",
        );

        const orderIds = Array.isArray(savedOrderIds) ? savedOrderIds : [];

        if (data.order && data.order.id) {
          const updatedOrderIds = [
            data.order.id,
            ...orderIds.filter((id) => id !== data.order.id),
          ].slice(0, 50);

          localStorage.setItem(
            ORDER_HISTORY_KEY,
            JSON.stringify(updatedOrderIds),
          );
        }
      } catch (storageError) {
        console.error("Could not save order history:", storageError);
      }

      // Clear cart only after the server confirms the order.
      localStorage.removeItem(CART_KEY);

      form.hidden = true;
      document.querySelector(".Checkout-Form-Section h2").hidden = true;
      document.querySelector(".Checkout-Summary").hidden = true;

      successMessage.textContent =
        `Order ID: ${data.order.id} | ` +
        `Total: ${formatPrice(data.order.total)} | ` +
        `Status: ${data.order.status}`;

      successSection.hidden = false;
      message.textContent = "";
      successSection.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Checkout error:", error);
      message.textContent =
        error.message +
        " If you are unsure whether the order was saved, check MongoDB before retrying.";
      placeOrderButton.disabled = false;
    }
  });
});
