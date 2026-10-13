document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/api/products";
  const CART_KEY = "umairFurnitureCart";

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const message = document.getElementById("Details-Message");
  const allProductsGrid = document.getElementById("All-Products-Grid");
  const allProductsSection = document.querySelector(".All-Products-Section");
  const singleDetails = document.getElementById("Single-Product-Details");

  const backButton = document.getElementById("Back-To-Products");
  const addButton = document.getElementById("Details-Add-Cart");
  const quantityInput = document.getElementById("Product-Quantity");
  const cartMessage = document.getElementById("Cart-Message");

  let currentProduct = null;

  function formatPrice(amount) {
    return "Rs. " + Number(amount).toLocaleString("en-PK");
  }

  // Load all products when Product Details opens
  async function loadAllProducts() {
    try {
      message.textContent = "Loading products...";

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to fetch products.");
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.products)) {
        throw new Error("Invalid products response.");
      }

      if (data.products.length === 0) {
        message.textContent = "No products available.";
        return;
      }

      message.textContent = "";

      allProductsGrid.innerHTML = data.products.map(product => `
        <article class="All-Product-Card">
          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
          >

          <div class="All-Product-Info">
            <p class="Details-Category">
              ${product.category || "Furniture"}
            </p>

            <h2>${product.name}</h2>

            <p class="Details-Price">
              ${formatPrice(product.price)}
            </p>

            <p class="All-Product-Description">
              ${product.description ||
                "Quality furniture for your home and office."}
            </p>

            <button
              type="button"
              class="Open-Product-Details"
              data-id="${product._id}"
            >
              View Full Details
            </button>

            <button
              type="button"
              class="List-Add-Cart"
              data-id="${product._id}"
            >
              Add to Cart
            </button>
          </div>
        </article>
      `).join("");

      // Open an individual product's detailed view
      allProductsGrid
        .querySelectorAll(".Open-Product-Details")
        .forEach(button => {
          button.addEventListener("click", () => {
            const selectedProduct = data.products.find(
              product => product._id === button.dataset.id
            );

            if (selectedProduct) {
              showSingleProduct(selectedProduct);
            }
          });
        });

      // Add a product directly from the collection
      allProductsGrid
        .querySelectorAll(".List-Add-Cart")
        .forEach(button => {
          button.addEventListener("click", () => {
            const selectedProduct = data.products.find(
              product => product._id === button.dataset.id
            );

            if (selectedProduct) {
              addToCart(selectedProduct, 1);
            }
          });
        });

    } catch (error) {
      console.error("Products loading error:", error);
      message.textContent =
        "Products load nahi ho sake. Backend server check karein.";
    }
  }

  // Show details for one selected product
  function showSingleProduct(product) {
    currentProduct = product;

    document.getElementById("Details-Name").textContent = product.name;
    document.getElementById("Details-Category").textContent =
      product.category || "Furniture";
    document.getElementById("Details-Price").textContent =
      formatPrice(product.price);
    document.getElementById("Details-Description").textContent =
      product.description ||
      "Quality furniture for your home and office.";

    const image = document.getElementById("Details-Image");
    image.src = product.image;
    image.alt = product.name;

    quantityInput.value = 1;
    cartMessage.textContent = "";
    document.title = `${product.name} | Umair Furniture`;

    allProductsSection.hidden = true;
    singleDetails.hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Return to the complete collection
  backButton.addEventListener("click", () => {
    singleDetails.hidden = true;
    allProductsSection.hidden = false;
    currentProduct = null;

    document.title = "All Products | Umair Furniture";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Add the selected quantity to the cart
  addButton.addEventListener("click", () => {
    if (!currentProduct) return;

    const quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      cartMessage.textContent =
        "Quantity 1 se 99 ke darmiyan enter karein.";
      return;
    }

    const success = addToCart(currentProduct, quantity);

    if (success) {
      cartMessage.textContent = "Product successfully added to your cart!";
    }
  });

  // Shared cart function
  function addToCart(product, quantity) {
    try {
      const cart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      if (!Array.isArray(cart)) {
        throw new Error("Invalid cart data.");
      }

      const existingItem = cart.find(
        item => item.productId === product._id
      );

      if (existingItem) {
        if (existingItem.quantity + quantity > 99) {
          if (cartMessage) {
            cartMessage.textContent = "Maximum quantity 99 hai.";
          } else {
            alert("Maximum quantity 99 hai.");
          }

          return false;
        }

        existingItem.quantity += quantity;
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: Number(product.price),
          quantity
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      return true;

    } catch (error) {
      console.error("Cart error:", error);

      if (cartMessage) {
        cartMessage.textContent = "Cart save nahi ho saka.";
      } else {
        alert("Cart save nahi ho saka.");
      }

      return false;
    }
  }

  // If an ID is present, open that individual product.
  // Otherwise, display the complete product collection.
  if (productId) {
    loadAllProducts().then(() => {
      const selectedCard = allProductsGrid.querySelector(
        `.Open-Product-Details[data-id="${productId}"]`
      );

      if (selectedCard) {
        selectedCard.click();
      } else {
        message.textContent = "Selected product nahi mila.";
      }
    });
  } else {
    loadAllProducts();
  }
});