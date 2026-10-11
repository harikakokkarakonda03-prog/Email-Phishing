const API = "https://email-phishing-ae8j.onrender.com";       // live Render backend
const FRONTEND = "https://email-phishing-dun.vercel.app";  // live Vercel frontend
const ALERT_FROM = 31;                     // threat score from which an alert is shown
const CACHE_MS = 24 * 3600 * 1000;         // an email opened again within 24 hours is not scanned twice

function notify(res) {
  chrome.notifications.create("scan-" + res.id, {
    type: "basic",
    iconUrl: "icon.png",
    title: "🚨 Alert: " + res.riskLevel + " Risk Detected!",
    message:
      "Threat Score: " + res.threatScore + "/100\n" +
      (res.top && res.top.length ? res.top.join(" • ") + "\n" : "") +
      "Click to view the forensic report.",
    priority: 2,
    requireInteraction: true, // stays on screen until you click or close it
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "scan") return;

  chrome.storage.local.get(["token", "scanned"], async ({ token, scanned = {} }) => {
    if (!token) {
      chrome.action.setBadgeText({ text: "!" }); // not logged in: the icon shows "!"
      return;
    }
    chrome.action.setBadgeText({ text: "" });

    // Opened again within 24 hours: reuse the earlier result instead of saving a duplicate report
    const cached = scanned[msg.key];
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      if (cached.threatScore >= ALERT_FROM) notify(cached);
      return;
    }

    try {
      const r = await fetch(API + "/scan", {
        method: "POST",
        headers: { Authorization: "Bearer " + token }, // proves who the user is
        body: msg.eml,
      });
      if (r.status === 401) {
        chrome.storage.local.remove(["token", "scanned"]); // login expired
        chrome.action.setBadgeText({ text: "!" });
        return;
      }
      if (!r.ok) return;

      const res = await r.json();
      scanned[msg.key] = { ...res, ts: Date.now() };
      for (const k of Object.keys(scanned)) {
        if (Date.now() - scanned[k].ts > CACHE_MS) delete scanned[k]; // forget old entries
      }
      chrome.storage.local.set({ scanned });

      if (res.threatScore >= ALERT_FROM) notify(res);
      else console.log("Email is safe (score " + res.threatScore + "). No alert.");
    } catch (e) {
      console.error("Scan failed. Is the backend running?", e);
    }
  });
});

// Clicking the alert opens the report on the website. The login token is NOT put in the link:
// the website uses its own saved login (log in there with the same account).
chrome.notifications.onClicked.addListener((id) => {
  if (!id.startsWith("scan-")) return;
  chrome.tabs.create({ url: FRONTEND + "/?report=" + encodeURIComponent(id.slice(5)) });
  chrome.notifications.clear(id);
});