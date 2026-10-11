// Reads the email you open in Gmail and sends it to the background script.
// Gmail can change its page structure. If scanning ever stops working, check these three selectors first.
const SELECTORS = { subject: "h2.hP", sender: "span.gD", body: "div.a3s" };

let last = "";

// Replaces line breaks with spaces so text from the page can never add fake email headers.
// Careful: the pattern must be exactly [\r\n]. Any other character inside the brackets gets replaced too.
const oneLine = (s) => (s || "").replace(/[\r\n]+/g, " ").trim();

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

  // Gmail keeps the real address in "email". If it is missing, fall back to "data-hovercard-id"
  let addr = senderEl.getAttribute("email") || senderEl.getAttribute("data-hovercard-id") || "";
  if (!addr.includes("@") && addr.includes(":")) {
    addr = addr.split(":").pop(); // remove a prefix like "p:" from a hovercard id
  }
  addr = oneLine(addr);

  const html = bodyEl.innerHTML; // keeps the real link targets, so lookalikes and link tricks can be detected

  // Same email = same key, so it is scanned only once per opening
  const key = subject + "|" + addr + "|" + html.length;
  if (key === last) return;
  last = key;

  const eml =
    `From: "${name}" <${addr}>\r\n` +
    `Subject: ${subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset=utf-8\r\n\r\n` +
    html;

  try {
    chrome.runtime.sendMessage({ type: "scan", key, eml });
  } catch (e) {
    // The extension was reloaded while Gmail was open. Refresh the Gmail tab (Ctrl+F5).
  }
}, 1500);