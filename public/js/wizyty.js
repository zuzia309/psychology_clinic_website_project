// public/js/wizyty.js
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("appointmentForm");
  const apptStatus = document.getElementById("apptStatus");

  const list = document.getElementById("appointmentsList");
  const listStatus = document.getElementById("listStatus");

  const serviceSelect = document.getElementById("serviceSelect");
  const therapistSelect = document.getElementById("therapistSelect");

  const lookupId = document.getElementById("lookupId");
  const lookupPhone = document.getElementById("lookupPhone");
  const lookupBtn = document.getElementById("lookupBtn");
  const lookupReset = document.getElementById("lookupReset");

  // po poprawnym lookup zapisujemy telefon do PATCH/DELETE
  let verifiedPhone = null;

  // ===== TERMIN: data + chipsy godzin + hidden scheduledAt =====
  const scheduledDate = document.getElementById("scheduledDate");
  const timeChips = document.getElementById("timeChips");
  const timeHint = document.getElementById("timeHint");
  const scheduledAtHidden = document.getElementById("scheduledAt");

  const OPEN_HOUR = 10;
  const CLOSE_HOUR = 20; // ostatnia startowa 19:00
  const STEP_MIN = 60;

  function pad2(n) { return String(n).padStart(2, "0"); }

  function normPhone(v) {
    return String(v || "").replace(/[^\d+]/g, "").trim();
  }

  function toDateInputValue(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function toLocalDateTimeValue(d) {
    // YYYY-MM-DDTHH:mm (dla datetime-local)
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
    // CLOSE_HOUR=20 => generuje do 19:00 włącznie (ok)
    return out;
  }

  const ALL_TIMES = buildTimes();

  // min data: jutro
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const minDateStr = toDateInputValue(tomorrow);
  if (scheduledDate) scheduledDate.min = minDateStr;

  // ===== BUSY TIMES (do szarych godzin) =====
  let allAppointments = [];

  function toYMD(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function getBusyTimesFor(dateStr, therapistId) {
    const busy = new Set();
    if (!dateStr || !therapistId) return busy;

    allAppointments.forEach((a) => {
      if (!a.scheduledAt) return;
      if (Number(a.therapistId) !== Number(therapistId)) return;

      const d = new Date(a.scheduledAt);
      if (toYMD(d) !== dateStr) return;

      busy.add(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
    });

    return busy;
  }

  async function refreshAppointmentsForBusy() {
    try {
      allAppointments = await api.get("/api/appointments");
    } catch {
      allAppointments = [];
    }
  }

  // ===== CHIPSY =====
  function clearSelectedTime() {
    if (scheduledAtHidden) scheduledAtHidden.value = "";
    timeChips?.querySelectorAll(".time-chip.is-selected")
      .forEach((btn) => btn.classList.remove("is-selected"));
  }

  function renderTimeChips(dateStr) {
    if (!timeChips || !timeHint) return;

    timeChips.innerHTML = "";
    clearSelectedTime();

    if (!dateStr) {
      if (timeHint) timeHint.textContent = "";
      return;
    }

    if (isSundayDateStr(dateStr)) {
      timeHint.textContent = "W niedziele poradnia jest nieczynna — wybierz inny dzień.";
      return;
    }

    timeHint.textContent = "";

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
        timeChips.querySelectorAll(".time-chip").forEach((b) => b.classList.remove("is-selected"));
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

    await refreshAppointmentsForBusy();
    renderTimeChips(scheduledDate.value);
  });

  therapistSelect?.addEventListener("change", async () => {
    await refreshAppointmentsForBusy();
    renderTimeChips(scheduledDate?.value || "");
  });

  // ===== UI helpers =====
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[m]));
  }

  function formatDateTime(val) {
    if (!val) return "-";
    const d = new Date(val);
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
    setTimeout(() => box.remove(), 3500);
  }

  function setListStatus(text, ms = 3500) {
    if (!listStatus) return;
    listStatus.textContent = text || "";
    if (!text) return;
  
    window.clearTimeout(setListStatus._t);
    setListStatus._t = window.setTimeout(() => {
      listStatus.textContent = "";
    }, ms);
  }

  function validateScheduledAtLocal(localValue) {
    const tmp = new Date(localValue);
    if (Number.isNaN(tmp.getTime())) return "Wybierz poprawny termin wizyty.";

    // jutro lub później
    const now2 = new Date();
    const startOfTomorrow = new Date(now2);
    startOfTomorrow.setDate(now2.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);
    if (tmp < startOfTomorrow) return "Termin wizyty musi być od jutra.";

    // niedziela
    if (tmp.getDay() === 0) return "W niedziele poradnia jest nieczynna. Wybierz inny dzień.";

    // godziny 10–20 (ostatnia startowa 19:00)
    const minutes = tmp.getHours() * 60 + tmp.getMinutes();
    const open = OPEN_HOUR * 60;
    const close = CLOSE_HOUR * 60;
    if (minutes < open || minutes >= close) return "Godziny przyjęć: 10:00–20:00 (ostatnia: 19:00).";

    // pełna godzina
    if (tmp.getMinutes() !== 0) return "Wybierz godzinę tylko o pełnej godzinie (:00).";

    return null;
  }

  // ===== RENDER jednej wizyty =====
  function renderAppointments(items) {
    if (!items.length) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = items.map((a) => {
      const dtLocal = a.scheduledAt ? toLocalDateTimeValue(new Date(a.scheduledAt)) : "";

      return `
        <div class="wizyta" data-id="${a.id}">
          <div class="meta">
            <div><strong>Nr rezerwacji: ${a.id}</strong></div>
            <div><strong>${escapeHtml(a.fullName)}</strong> • ${escapeHtml(a.email)}${a.phone ? ` • ${escapeHtml(a.phone)}` : ""}</div>
            <div>Usługa: ${escapeHtml(a.service?.title ?? "-")}</div>
            <div>Terapeuta: ${escapeHtml(a.therapist?.name ?? "-")}</div>
            <div>Termin: <strong class="termText">${formatDateTime(a.scheduledAt)}</strong></div>
            ${a.note ? `<div>Notatka: ${escapeHtml(a.note)}</div>` : ""}
          </div>

          <div class="actions">
            <div class="viewActions">
              <button class="btn-mini btn-outline btnEdit" type="button">Edytuj wizytę</button>
              <button class="btn-mini btn-danger btnDelete" type="button">Anuluj wizytę</button>
            </div>

            <div class="editPanel" hidden>
              <input class="dtInput" type="datetime-local"
                value="${dtLocal}"
                data-original="${dtLocal}"
                step="3600">

              <input class="noteInput" type="text"
                placeholder="Zmień notatkę (opcjonalnie)"
                value="${a.note ? escapeHtml(a.note) : ""}"
                data-original="${a.note ? escapeHtml(a.note) : ""}">

              <button class="btn-mini btnSave" type="button">Zapisz zmiany</button>
              <button class="btn-mini btn-ghost btnCancelEdit" type="button">Anuluj edycję</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // ustaw min + step na edycji
    const now3 = new Date();
    const tmr = new Date(now3);
    tmr.setDate(now3.getDate() + 1);
    tmr.setHours(OPEN_HOUR, 0, 0, 0);
    const minStr = toLocalDateTimeValue(tmr);

    list.querySelectorAll(".dtInput").forEach((inp) => {
      inp.min = minStr;
      inp.step = "3600";
    });
  }

  // ===== SELECTS =====
  async function loadSelects() {
    try {
      const [services, therapists] = await Promise.all([
        api.get("/api/services"),
        api.get("/api/therapists"),
      ]);

      serviceSelect.innerHTML =
        `<option value="" selected disabled>Wybierz usługę</option>` +
        services.map((s) => `<option value="${s.id}">${s.title} • ${s.price} zł</option>`).join("");

      therapistSelect.innerHTML =
        `<option value="" selected disabled>Wybierz terapeutę</option>` +
        therapists.map((t) => `<option value="${t.id}">${t.name}</option>`).join("");
    } catch {
      apptStatus.textContent = "Nie udało się wczytać listy usług/terapeutów.";
      apptStatus.classList.add("err");
    }
  }

  // ===== CREATE =====
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
      apptStatus.textContent = "Uzupełnij wymagane pola i wybierz godzinę wizyty.";
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
      renderTimeChips("");

      await refreshAppointmentsForBusy();
      renderTimeChips(scheduledDate?.value || "");
    } catch (err2) {
      apptStatus.textContent = err2.message || "Nie udało się zapisać wizyty. Sprawdź dane.";
      apptStatus.classList.add("err");
    }
  });

  // ===== LOOKUP (ID + TELEFON) =====
  lookupBtn?.addEventListener("click", async () => {
    listStatus.textContent = "";
    list.innerHTML = "";

    const id = Number(lookupId?.value);
    const phone = normPhone(lookupPhone?.value);

    if (!Number.isFinite(id) || id <= 0) {
      listStatus.textContent = "Wpisz poprawny numer rezerwacji.";
      verifiedPhone = null;
      return;
    }
    if (phone.length < 7) {
      listStatus.textContent = "Wpisz poprawny numer telefonu.";
      verifiedPhone = null;
      return;
    }

    try {
      const found = await api.post("/api/appointments/lookup", { id, phone });
      verifiedPhone = phone;
      renderAppointments([found]);
      listStatus.textContent = "";
    } catch (err) {
      verifiedPhone = null;
      listStatus.textContent = err.message || "Nie znaleziono wizyty lub błędny telefon.";
    }
  });

  lookupReset?.addEventListener("click", (e) => {
    e.preventDefault();
    if (lookupId) lookupId.value = "";
    if (lookupPhone) lookupPhone.value = "";
    verifiedPhone = null;
    list.innerHTML = "";
    listStatus.textContent = "Wpisz numer rezerwacji i telefon, aby wyświetlić wizytę.";
  });

  // ===== EDIT / DELETE =====
  list.addEventListener("click", async (e) => {
    const card = e.target.closest(".wizyta");
    if (!card) return;

    const id = Number(card.getAttribute("data-id"));
    if (!Number.isFinite(id)) return;

    const viewActions = card.querySelector(".viewActions");
    const editPanel = card.querySelector(".editPanel");

    const showEdit = () => {
      if (viewActions) viewActions.style.display = "none";
      if (editPanel) {
        editPanel.hidden = false;
        editPanel.style.display = "flex";
        editPanel.style.flexDirection = "column";
        editPanel.style.gap = "10px";
      }
    };

    const hideEdit = () => {
      if (editPanel) {
        editPanel.hidden = true;
        editPanel.style.display = "none";
      }
      if (viewActions) viewActions.style.display = "flex";
    };

    if (e.target.classList.contains("btnEdit")) {
      showEdit();
      return;
    }

    if (e.target.classList.contains("btnCancelEdit")) {
      const dtInput = card.querySelector(".dtInput");
      const noteInput = card.querySelector(".noteInput");

      if (dtInput) dtInput.value = dtInput.dataset.original || "";
      if (noteInput) noteInput.value = noteInput.dataset.original || "";

      hideEdit();
      return;
    }

    if (e.target.classList.contains("btnSave")) {
      const dtInput = card.querySelector(".dtInput");
      const noteInput = card.querySelector(".noteInput");

      const dtLocal = dtInput?.value || null;
      const originalValue = dtInput?.dataset?.original || "";
      const note = noteInput?.value ?? null;

      if (!verifiedPhone) {
        showNotice(card, "err", "Najpierw wyszukaj wizytę (ID + telefon).");
        return;
      }

      if (dtLocal) {
        const err = validateScheduledAtLocal(dtLocal);
        if (err) {
          showNotice(card, "err", err);
          if (dtInput) dtInput.value = originalValue;
          return;
        }
      }

      try {
        const updated = await api.patch(`/api/appointments/${id}`, {
          phone: verifiedPhone,
          scheduledAt: dtLocal ? dtLocal : null,
          note: note ? note : null,
        });

        // rerender karty, żeby termin/meta od razu się zaktualizowały
        renderAppointments([updated]);
        listStatus.textContent = "Zmiany zapisane.";

        await refreshAppointmentsForBusy();
        renderTimeChips(scheduledDate?.value || "");
      } catch (err3) {
        showNotice(card, "err", err3.message || "Nie udało się zapisać zmian.");
        if (dtInput) dtInput.value = originalValue;
      }

      return;
    }

    if (e.target.classList.contains("btnDelete")) {
      if (!confirm("Anulować (usunąć) tę wizytę?")) return;

      if (!verifiedPhone) {
        showNotice(card, "err", "Najpierw wyszukaj wizytę (ID + telefon).");
        return;
      }

      try {
        // DELETE id + phone jako query (bo api.del nie wysyła body)
        await api.del(`/api/appointments/${id}?phone=${encodeURIComponent(verifiedPhone)}`);

        list.innerHTML = "";
        listStatus.textContent =
          "Wizyta usunięta. Wpisz numer rezerwacji i telefon, aby wyszukać kolejną.";

        verifiedPhone = null;
        if (lookupId) lookupId.value = "";
        if (lookupPhone) lookupPhone.value = "";

        await refreshAppointmentsForBusy();
        renderTimeChips(scheduledDate?.value || "");
      } catch (err) {
        showNotice(card, "err", err.message || "Nie udało się usunąć wizyty.");
      }
    }
  });

  // ===== INIT =====
  await loadSelects();
  await refreshAppointmentsForBusy();
  renderTimeChips(scheduledDate?.value || "");

  list.innerHTML = "";
  listStatus.textContent = "Wpisz numer rezerwacji i telefon, aby wyświetlić wizytę.";
});