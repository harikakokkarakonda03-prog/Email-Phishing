// Reads the email you open in Gmail and sends it to the background script.
// Gmail can change its page structure. If scanning ever stops working, check these three selectors first.
const SELECTORS = { subject: "h2.hP", sender: "span.gD", body: "div.a3s" };

let last = "";

// Removes line breaks so text from the page can never add fake email headers
const oneLine = (s) => (s || "").replace(/[\(\r\\)n]+/g, " ").trim();

setInterval(() => {
  const subjectEl = document.querySelector(SELECTORS.subject);
  const senderEl = document.querySelector(SELECTORS.sender);
  const bodyEl = document.querySelector(SELECTORS.body);

  if (!subjectEl || !senderEl || !bodyEl) {
    last = "";
    return;
  }

  const subject = oneLine(subjectEl.innerText);
  const name = oneLine(senderEl.getAttribute("name")).replace(/[<>"]/g, "") || "Unknown Sender";
  
  // FIXED CORE LOGIC: Fallback tracking for Gmail's real email attribute tags
  let addr = senderEl.getAttribute("email") || senderEl.getAttribute("data-hovercard-id") || "";
  if (addr.includes("@") === false && addr.includes(":") === true) {
    // If it extracted a hovercard ID like "p:user@domain.com", clean up the prefix
    addr = addr.split(":").pop();
  }
  addr = oneLine(addr);

  const html = bodyEl.innerHTML; // Keeps the real link targets, so lookalikes can be detected

  // Same email = same key, so it is scanned only once per opening
  const key = subject + "|" + addr + "|" + html.length;
  if (key === last) return;
  last = key;

  // Construct valid EML raw text block for Python engine parsing strings
  const eml =
    `From: "${name}" <${addr}>\r\n` +
    `Subject: ${subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset=utf-8\r\n\r\n` +
    html;

  try {
    chrome.runtime.sendMessage({ type: "scan", key, eml });
    console.log("Email captured cleanly, dispatching payload packet to background worker...");
  } catch (e) {
    // The extension was reloaded while Gmail was open. Refresh the Gmail tab (Ctrl+F5).
  }
}, 1500);
