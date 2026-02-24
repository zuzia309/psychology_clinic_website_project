document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("appointmentForm");
  const apptStatus = document.getElementById("apptStatus");

  const list = document.getElementById("appointmentsList");
  const listStatus = document.getElementById("listStatus");

  const serviceSelect = document.getElementById("serviceSelect");
  const therapistSelect = document.getElementById("therapistSelect");

  const lookupId = document.getElementById("lookupId");
  const lookupBtn = document.getElementById("lookupBtn");
  const lookupReset = document.getElementById("lookupReset");

  const scheduledDate = document.getElementById("scheduledDate");
  const timeChips = document.getElementById("timeChips");
  const timeHint = document.getElementById("timeHint");
  const scheduledAtHidden = document.getElementById("scheduledAt");

  const OPEN_HOUR = 10;
  const CLOSE_HOUR = 20;
  const STEP_MIN = 60;

  function pad2(n) { return String(n).padStart(2, "0"); }

  function toDateInputValue(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function toLocalDateTimeValue(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  function isSundayDateStr(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    return d.getDay() === 0;
  }

  function buildTimes() {
    const out = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      out.push(`${pad2(h)}:00`);
    }
    return out.filter(t => t !== "20:00"); // jeśli CLOSE_HOUR = 20
  }

  const ALL_TIMES = buildTimes();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const minDateStr = toDateInputValue(tomorrow);

  if (scheduledDate) scheduledDate.min = minDateStr;

  function clearSelectedTime() {
    if (scheduledAtHidden) scheduledAtHidden.value = "";
    timeChips?.querySelectorAll(".time-chip.is-selected").forEach(btn => btn.classList.remove("is-selected"));
  }

  function renderTimeChips(dateStr) {
    if (!timeChips || !timeHint) return;

    timeChips.innerHTML = "";
    clearSelectedTime();

    if (!dateStr) {
      timeHint.textContent = "Wybierz datę, aby zobaczyć dostępne godziny.";
      return;
    }

    if (isSundayDateStr(dateStr)) {
      timeHint.textContent = "W niedziele poradnia jest nieczynna — wybierz inny dzień.";
      return;
    }

    timeHint.textContent = "Wybierz godzinę wizyty";

    const therapistId = therapistSelect?.value;
    const busySet = getBusyTimesFor(dateStr, therapistId);

    ALL_TIMES.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "time-chip";
      btn.textContent = t;

      const isBusy = busySet.has(t);

      if (!therapistId) {
      btn.disabled = true;
      btn.classList.add("is-disabled");
       btn.title = "Najpierw wybierz terapeutę";
      } else if (isBusy) {
      btn.disabled = true;
       btn.classList.add("is-disabled");
       btn.title = "Termin zajęty";
      }

      btn.addEventListener("click", () => {
        timeChips.querySelectorAll(".time-chip").forEach(b => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");

        if (scheduledAtHidden) scheduledAtHidden.value = `${dateStr}T${t}`;
      });

      timeChips.appendChild(btn);
    });
  }

  scheduledDate?.addEventListener("change", async () => {
    apptStatus.textContent = "";
    apptStatus.classList.remove("ok", "err");
  
    if (scheduledDate.value && isSundayDateStr(scheduledDate.value)) {
      apptStatus.textContent = "W niedziele poradnia jest nieczynna. Wybierz inny dzień.";
      apptStatus.classList.add("err");
      scheduledDate.value = "";
      renderTimeChips("");
      return;
    }
  
    try { allAppointments = await api.get("/api/appointments"); } catch {}
  
    renderTimeChips(scheduledDate.value);
  });

  therapistSelect?.addEventListener("change", async () => {
    try { allAppointments = await api.get("/api/appointments"); } catch {}
    renderTimeChips(scheduledDate?.value || "");
  });

  renderTimeChips(scheduledDate?.value || "");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[m]));
  }

  function formatDateTime(isoOrLocal) {
    if (!isoOrLocal) return "-";
    const d = new Date(isoOrLocal);
    return d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
  }

  function showNotice(targetEl, type, text) {
    if (!targetEl) return;
    const old = targetEl.querySelector(".notice");
    if (old) old.remove();
    const box = document.createElement("div");
    box.className = `notice ${type === "ok" ? "ok" : "err"}`;
    box.textContent = text;
    targetEl.appendChild(box);
    setTimeout(() => box.remove(), 4000);
  }

  function validateScheduledAtLocal(localValue) {
    const tmp = new Date(localValue);
    if (Number.isNaN(tmp.getTime())) return "Wybierz poprawny termin wizyty.";

    const now2 = new Date();
    const startOfTomorrow = new Date(now2);
    startOfTomorrow.setDate(now2.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);
    if (tmp < startOfTomorrow) return "Termin wizyty musi być od jutra.";

    if (tmp.getDay() === 0) return "W niedziele poradnia jest nieczynna. Wybierz inny dzień.";

    const minutes = tmp.getHours() * 60 + tmp.getMinutes();
    const open = OPEN_HOUR * 60;
    const close = CLOSE_HOUR * 60;
    if (minutes < open || minutes >= close) return `Godziny przyjęć: ${pad2(OPEN_HOUR)}:00–${pad2(CLOSE_HOUR)}:00.`;

    const m = tmp.getMinutes();
    if (m !== 0) return "Wybierz godzinę tylko o pełnej godzinie (:00).";
    
    return null;
  }

  function toYMD(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  
  function getBusyTimesFor(dateStr, therapistId) {
    const busy = new Set();
    if (!dateStr || !therapistId) return busy;
  
    allAppointments.forEach(a => {
      if (!a.scheduledAt) return;
      if (Number(a.therapistId) !== Number(therapistId)) return;
  
      const d = new Date(a.scheduledAt);
      if (toYMD(d) !== dateStr) return;
  
      busy.add(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
    });
  
    return busy;
  }

  function renderAppointments(items) {
    if (!items.length) {
      list.innerHTML = "";
      listStatus.textContent = "Brak wizyt do wyświetlenia.";
      return;
    }

    listStatus.textContent = "";
    list.innerHTML = items.map(a => {
      const dtLocal = a.scheduledAt ? toLocalDateTimeValue(new Date(a.scheduledAt)) : "";
      return `
        <div class="wizyta" data-id="${a.id}">
          <div class="meta">
            <div><strong>Nr rezerwacji: ${a.id}</strong></div>
            <div><strong>${escapeHtml(a.fullName)}</strong> • ${escapeHtml(a.email)}${a.phone ? ` • ${escapeHtml(a.phone)}` : ""}</div>
            <div>Usługa: ${escapeHtml(a.service?.title ?? "-")}</div>
            <div>Terapeuta: ${escapeHtml(a.therapist?.name ?? "-")}</div>
            <div>Termin: <strong>${formatDateTime(a.scheduledAt)}</strong></div>
            ${a.note ? `<div>Notatka: ${escapeHtml(a.note)}</div>` : ""}
          </div>

          <div class="actions">
            <input class="dtInput" type="datetime-local"
              value="${dtLocal}"
              data-original="${dtLocal}"
              step="3600">
            <input class="noteInput" type="text" placeholder="Zmień notatkę (opcjonalnie)" value="${a.note ? escapeHtml(a.note) : ""}">
            <button class="btn-mini btnSave" type="button">Zapisz zmiany</button>
            <button class="btn-mini btn-danger btnDelete" type="button">Anuluj (usuń)</button>
          </div>
        </div>
      `;
    }).join("");

    const now3 = new Date();
    const tmr = new Date(now3);
    tmr.setDate(now3.getDate() + 1);
    tmr.setHours(OPEN_HOUR, 0, 0, 0);
    const minStr = toLocalDateTimeValue(tmr);

    list.querySelectorAll(".dtInput").forEach(inp => {
      inp.min = minStr;
      inp.step = "3600";
    });
  }

  // ===== API loads =====
  async function loadSelects() {
    try {
      const [services, therapists] = await Promise.all([
        api.get("/api/services"),
        api.get("/api/therapists"),
      ]);

      serviceSelect.innerHTML =
        `<option value="" selected disabled>Wybierz usługę</option>` +
        services.map(s => `<option value="${s.id}">${s.title} • ${s.price} zł</option>`).join("");

      therapistSelect.innerHTML =
        `<option value="" selected disabled>Wybierz terapeutę</option>` +
        therapists.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    } catch (e) {
      apptStatus.textContent = "Nie udało się wczytać listy usług/terapeutów.";
      apptStatus.classList.add("err");
    }
  }

  let allAppointments = [];

  async function loadAppointments() {
    listStatus.textContent = "";
    list.innerHTML = "";

    try {
      allAppointments = await api.get("/api/appointments");

      if (!allAppointments.length) {
        listStatus.textContent = "Brak umówionych wizyt.";
        return;
      }

      const typedId = lookupId?.value ? Number(lookupId.value) : null;
      if (typedId && Number.isFinite(typedId)) {
        renderAppointments(allAppointments.filter(a => a.id === typedId));
      } else {
        renderAppointments(allAppointments);
      }
    } catch {
      listStatus.textContent = "Nie udało się pobrać listy wizyt.";
    }
  }

  // ===== CREATE (POST) =====
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    apptStatus.textContent = "";
    apptStatus.classList.remove("ok", "err");

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    const missing =
      !payload.fullName?.trim() ||
      !payload.email?.trim() ||
      !payload.phone?.trim() ||
      !payload.serviceId ||
      !payload.therapistId ||
      !payload.scheduledAt;

    if (missing) {
      apptStatus.textContent = (!payload.scheduledAt && payload.scheduledDate)
        ? "Wybierz godzinę wizyty."
        : "Uzupełnij wymagane pola w formularzu.";
      apptStatus.classList.add("err");
      return;
    }

    payload.serviceId = Number(payload.serviceId);
    payload.therapistId = Number(payload.therapistId);

    const err = validateScheduledAtLocal(payload.scheduledAt);
    if (err) {
      apptStatus.textContent = err;
      apptStatus.classList.add("err");
      return;
    }

    try {
      const created = await api.post("/api/appointments", payload);
      apptStatus.textContent = `Wizyta została zapisana. Numer rezerwacji: ${created.id}.`;
      apptStatus.classList.add("ok");

      form.reset();
      renderTimeChips(""); // czyści chipsy
      await loadAppointments();
    } catch (err2) {
      apptStatus.textContent = err2.message || "Nie udało się zapisać wizyty. Sprawdź dane.";
      apptStatus.classList.add("err");
    }
  });

  // ===== LOOKUP =====
  lookupBtn?.addEventListener("click", async () => {
    const id = Number(lookupId.value);
    if (!Number.isFinite(id) || id <= 0) {
      listStatus.textContent = "Wpisz poprawny numer rezerwacji.";
      return;
    }
    await loadAppointments();
  });

  lookupReset?.addEventListener("click", async () => {
    lookupId.value = "";
    await loadAppointments();
  });

  // ===== EDIT/DELETE =====
  list.addEventListener("click", async (e) => {
    const card = e.target.closest(".wizyta");
    if (!card) return;

    const id = Number(card.getAttribute("data-id"));
    if (!Number.isFinite(id)) return;

    if (e.target.classList.contains("btnSave")) {
      const dtInput = card.querySelector(".dtInput");
      const noteInput = card.querySelector(".noteInput");

      const dtLocal = dtInput?.value || null;
      const originalValue = dtInput?.dataset?.original || "";
      const note = noteInput?.value || null;

      if (dtLocal) {
        const err = validateScheduledAtLocal(dtLocal);
        if (err) {
          showNotice(card, "err", err);
          if (dtInput) dtInput.value = originalValue;
          return;
        }
      }

      try {
        await api.patch(`/api/appointments/${id}`, {
          scheduledAt: dtLocal ? dtLocal : null,
          note: note ? note : null,
        });

        if (dtInput) dtInput.dataset.original = dtInput.value;
        showNotice(card, "ok", "Zmiany zapisane.");
        
        await loadAppointments();

        try { allAppointments = await api.get("/api/appointments"); } catch {}
        renderTimeChips(scheduledDate?.value || "");
      } catch (err3) {
        showNotice(card, "err", err3.message || "Nie udało się zapisać zmian.");
        if (dtInput) dtInput.value = originalValue;
      }
    }

    if (e.target.classList.contains("btnDelete")) {
      if (!confirm("Anulować (usunąć) tę wizytę?")) return;
      try {
        await api.del(`/api/appointments/${id}`);
        await loadAppointments();
      } catch {
        listStatus.textContent = "Nie udało się usunąć wizyty.";
      }
    }
  });

  // INIT
  await loadSelects();
  await loadAppointments();
});