const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

function normPhone(v) {
  return String(v || "").replace(/[^\d+]/g, "").trim();
}

function isValidEmail(email) {
  const s = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function setStatus(type, text, ms = 3500) {
  statusEl.textContent = text;
  statusEl.classList.remove("ok", "err");
  if (type) statusEl.classList.add(type);

  if (ms) {
    window.clearTimeout(setStatus._t);
    setStatus._t = window.setTimeout(() => {
      statusEl.textContent = "";
      statusEl.classList.remove("ok", "err");
    }, ms);
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus(null, "", 0);

  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  const fullName = String(payload.fullName || "").trim();
  const email = String(payload.email || "").trim();
  const phoneRaw = String(payload.phone || "").trim();
  const message = String(payload.message || "").trim();

  if (fullName.length < 3) return setStatus("err", "Imię i nazwisko: min. 3 znaki.");
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return setStatus("err", "Podaj imię i nazwisko (min. 2 słowa).");

  if (!isValidEmail(email)) return setStatus("err", "Podaj poprawny adres email.");

  if (phoneRaw) {
    const phoneDigits = normPhone(phoneRaw).replace(/^\+/, "");
    if (phoneDigits.length < 7) {
      return setStatus("err", "Numer telefonu: min. 7 cyfr.");
    }
  }

  if (message.length < 10) return setStatus("err", "Wiadomość: min. 10 znaków.");

  payload.fullName = fullName;
  payload.email = email;
  payload.phone = phoneRaw;
  payload.message = message;

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Błąd wysyłki");

    setStatus("ok", "Wiadomość zapisana. Dziękujemy!", 3000);
    form.reset();
  } catch (err) {
    setStatus("err", err.message || "Nie udało się wysłać wiadomości.", 4000);
  }
});