document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/api/orders";
  const ORDER_HISTORY_KEY = "umairFurnitureOrderIds";

  const message = document.getElementById("Orders-Message");
  const ordersList = document.getElementById("Orders-List");

  function formatPrice(amount) {
    return "Rs. " + Number(amount).toLocaleString("en-PK");
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  async function loadOrders() {
    try {
      const savedIds = JSON.parse(
        localStorage.getItem(ORDER_HISTORY_KEY) || "[]"
      );

      if (!Array.isArray(savedIds) || savedIds.length === 0) {
        message.textContent =
          "Abhi koi order history nahi mili. Products select karke checkout karein.";
        return;
      }

      message.textContent = "Loading your orders...";

      const uniqueIds = [...new Set(savedIds)].filter(
        id => typeof id === "string" && /^[a-f\d]{24}$/i.test(id)
      );

      if (uniqueIds.length === 0) {
        message.textContent = "Koi valid order ID nahi mili.";
        return;
      }

      const results = await Promise.all(
        uniqueIds.map(async id => {
          try {
            const response = await fetch(
              `${API_URL}/${encodeURIComponent(id)}`
            );

            if (!response.ok) {
              return null;
            }

            const data = await response.json();

            if (!data.success || !data.order) {
              return null;
            }

            return data.order;
          } catch (error) {
            console.error("Order fetch error:", id, error);
            return null;
          }
        })
      );

      const orders = results.filter(Boolean);

      if (orders.length === 0) {
        message.textContent =
          "Orders load nahi ho sake. Backend server aur order API check karein.";
        return;
      }

      message.textContent = `${orders.length} order(s) found.`;

      ordersList.innerHTML = orders.map(order => {
        const orderId = order._id || order.id || "";
        const items = Array.isArray(order.items) ? order.items : [];

        return `
          <article class="Order-Card">

            <div class="Order-Header">
              <div>
                <h2>Order #${orderId.slice(-8).toUpperCase()}</h2>
                <p>Placed: ${formatDate(order.createdAt)}</p>
              </div>

              <span class="Order-Status">
                ${order.status || "Pending"}
              </span>
            </div>

            <div class="Order-Items">
              ${items.map(item => `
                <div class="Order-Item">
                  <div>
                    <h3>${item.name || "Furniture Product"}</h3>
                    <p>Quantity: ${Number(item.quantity) || 1}</p>
                    <p>Unit price: ${formatPrice(item.price)}</p>
                  </div>

                  <strong>
                    ${formatPrice(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </strong>
                </div>
              `).join("")}
            </div>

            <div class="Order-Totals">
              <p>
                Subtotal:
                <strong>${formatPrice(order.subtotal)}</strong>
              </p>

              <p>
                Delivery:
                <strong>${formatPrice(order.deliveryFee || 0)}</strong>
              </p>

              <p class="Order-Grand-Total">
                Total:
                <strong>${formatPrice(order.total)}</strong>
              </p>
            </div>

          </article>
        `;
      }).join("");

    } catch (error) {
      console.error("Orders loading error:", error);

      message.textContent =
        "Order history read nahi ho saki. Please browser refresh karein.";
    }
  }

  loadOrders();
});