const API = "https://email-phishing-ae8j.onrender.com";

function show(loggedIn) {
  document.getElementById("loginBox").style.display = loggedIn ? "none" : "block";
  document.getElementById("doneBox").style.display = loggedIn ? "block" : "none";
}

chrome.storage.local.get("token", ({ token }) => show(!!token));

document.getElementById("loginBtn").onclick = () => {
  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.token) {
        // Save the login and clear the saved scan results of any earlier account
        chrome.storage.local.set({ token: d.token, scanned: {} });
        chrome.action.setBadgeText({ text: "" });
        document.getElementById("msg").textContent = "";
        show(true);
      } else {
        document.getElementById("msg").textContent = d.detail || "Login failed";
      }
    })
    .catch(() => (document.getElementById("msg").textContent = "Server not running"));
};

document.getElementById("logoutBtn").onclick = () => {
  chrome.storage.local.remove(["token", "scanned"]);
  show(false);
};

// Switches the password box between hidden dots and visible text
document.getElementById("showPw").onchange = (e) => {
  document.getElementById("password").type = e.target.checked ? "text" : "password";
};