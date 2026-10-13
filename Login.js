
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000/api/auth";

  const loginTab = document.getElementById("Login-Tab");
  const registerTab = document.getElementById("Register-Tab");

  const loginForm = document.getElementById("Login-Form");
  const registerForm = document.getElementById("Register-Form");

  const message = document.getElementById("Auth-Message");
  const loginButton = document.getElementById("Login-Button");
  const registerButton = document.getElementById("Register-Button");

  function showMessage(text, success = false) {
    message.textContent = text;
    message.classList.toggle("success", success);
  }

  function switchTab(tab) {
    const showLogin = tab === "login";

    loginForm.hidden = !showLogin;
    registerForm.hidden = showLogin;

    loginTab.classList.toggle("active", showLogin);
    registerTab.classList.toggle("active", !showLogin);

    loginTab.setAttribute("aria-pressed", String(showLogin));
    registerTab.setAttribute("aria-pressed", String(!showLogin));

    showMessage("");
  }

  loginTab.addEventListener("click", () => {
    switchTab("login");
  });

  registerTab.addEventListener("click", () => {
    switchTab("register");
  });

  document.getElementById("Go-To-Signup").addEventListener("click", () => {
    switchTab("register");
  });

  document.getElementById("Go-To-Login").addEventListener("click", () => {
    switchTab("login");
  });

  async function sendRequest(endpoint, payload) {
    let response;

    try {
      response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch {
      throw new Error(
        "Backend se connection nahi ho raha. Check karein ke node server.js chal raha hai."
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Request failed. Please try again.");
    }

    return data;
  }

  // REGISTER USER
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("Register-Name").value.trim();
    const email = document.getElementById("Register-Email").value.trim();
    const password = document.getElementById("Register-Password").value;

    if (password.length < 8 || password.length > 72) {
      showMessage("Password 8 se 72 characters ka hona chahiye.");
      return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Creating Account...";
    showMessage("");

    try {
      const data = await sendRequest("register", {
        name,
        email,
        password
      });

      showMessage(
        "Account successfully create ho gaya! Ab login karein.",
        true
      );

      registerForm.reset();

      switchTab("login");

      document.getElementById("Login-Email").value = email;
      document.getElementById("Login-Password").focus();

    } catch (error) {
      showMessage(error.message);
    } finally {
      registerButton.disabled = false;
      registerButton.textContent = "Create Account";
    }
  });

  // LOGIN USER
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("Login-Email").value.trim();
    const password = document.getElementById("Login-Password").value;

    loginButton.disabled = true;
    loginButton.textContent = "Signing In...";
    showMessage("");

    try {
      const data = await sendRequest("login", {
        email,
        password
      });

      if (!data.token || !data.user) {
        throw new Error("Login response incomplete hai. Dobara try karein.");
      }

      // Demo project: save login session in browser
      localStorage.setItem("umairFurnitureToken", data.token);
      localStorage.setItem(
        "umairFurnitureUser",
        JSON.stringify(data.user)
      );

      showMessage("Login successful! Store open ho raha hai.", true);

      loginForm.reset();

      setTimeout(() => {
        window.location.href = "./Main_Work.html";
      }, 800);

    } catch (error) {
      showMessage(error.message);
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Login to Account";
    }
  });

  switchTab("login");
});
