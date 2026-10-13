const API_URL = "http://localhost:5000/api/products";

document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("Product-Grid");
  const productMessage = document.getElementById("Product-Message");

  // Check whether required HTML elements exist
  if (!productGrid || !productMessage) {
    console.error("Product-Grid or Product-Message element not found.");
    return;
  }

  // Load products when the page opens
  loadProducts();

  // Fetch products from the backend
  async function loadProducts() {
    try {
      productMessage.textContent = "Loading products...";

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to fetch products.");
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.products) ||
          data.products.length === 0) {
        productMessage.textContent = "No products available.";
        return;
      }

      productMessage.textContent = "";

      // Display products on the homepage
      displayProducts(data.products);

    } catch (error) {
      console.error("Product loading error:", error);

      productMessage.textContent =
        "Products load nahi ho sake. Please check the backend server.";
    }
  }

  // Display all products
  function displayProducts(products) {
    productGrid.innerHTML = products.map(product => `
      <div class="Product">

        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        />

        <div class="Product-Info">

          <p class="Product-Category">
            ${product.category || "Furniture"}
          </p>

          <h2>${product.name}</h2>

          <p class="Product-Price">
            Rs. ${Number(product.price).toLocaleString("en-PK")}
          </p>

          <div class="Product-Buttons">

            <button
              class="Details-Button"
              data-id="${product._id}"
            >
              View Details
            </button>

            <button
              class="Add-Cart-Button"
              data-id="${product._id}"
            >
              Add to Cart
            </button>

          </div>
        </div>
      </div>
    `).join("");

    // Add to Cart button functionality
    productGrid
      .querySelectorAll(".Add-Cart-Button")
      .forEach(button => {
        button.addEventListener("click", () => {
          const product = products.find(
            item => item._id === button.dataset.id
          );

          if (product) {
            addToCart(product);
          }
        });
      });

    // View Details button functionality
    productGrid
      .querySelectorAll(".Details-Button")
      .forEach(button => {
        button.addEventListener("click", () => {
          const productId = button.dataset.id;

          // Open the separate product details page
          window.location.href =
            `./Products.html?id=${encodeURIComponent(productId)}`;
        });
      });
  }

  // Add product to the shopping cart
  function addToCart(product) {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("umairFurnitureCart") || "[]"
      );

      // Make sure the saved cart is an array
      if (!Array.isArray(savedCart)) {
        throw new Error("Invalid cart data.");
      }

      const cart = savedCart;

      // Check whether the product is already in the cart
      const existingProduct = cart.find(
        item => item.productId === product._id
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 1
        });
      }

      // Save the updated cart in localStorage
      localStorage.setItem(
        "umairFurnitureCart",
        JSON.stringify(cart)
      );

      alert(`${product.name} added to cart successfully!`);

    } catch (error) {
      console.error("Cart error:", error);

      alert(
        "Cart update nahi ho saka. Please dobara try karein."
      );
    }
  }
});