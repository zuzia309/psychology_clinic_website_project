const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Błąd wysyłki");

    statusEl.textContent = "Wiadomość zapisana. Dziękujemy!";
    form.reset();
  } catch (err) {
    statusEl.textContent = `Błąd: ${err.message}`;  }
});