import { apiFetch, setSession } from "./api.js";

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const messageBox = document.querySelector("#message");

const showMessage = (text, isError = false) => {
  messageBox.textContent = text;
  messageBox.className = isError ? "notice" : "notice";
};

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setSession(data.user, data.token);
    if (data.user.role === "ADMIN") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    showMessage(error.message, true);
  }
});

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(registerForm);
    const payload = Object.fromEntries(formData.entries());
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setSession(data.user, data.token);
    window.location.href = "dashboard.html";
  } catch (error) {
    showMessage(error.message, true);
  }
});
