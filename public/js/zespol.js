// public/js/zespol.js

async function loadTeam() {
  const container = document.querySelector("#teamList"); // tu będą wstawiani terapeuci
  const errorBox = document.querySelector("#teamError"); // tu pokażemy błąd

  try {
    // WAŻNE: zaczynamy od / żeby nie robiło /Zespol/api/...
    const res = await fetch("/api/therapists");

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const therapists = await res.json();

    // czyścimy
    container.innerHTML = "";

    therapists.forEach((t) => {
      const article = document.createElement("article");
      article.className = "czlonek";

      article.innerHTML = `
        <div class="czlonek-zdjecie">
          <img src="${t.imageUrl || ""}" alt="${t.name}">
        </div>
        <div class="czlonek-opis">
          <h3>${t.name}</h3>
          <p class="czlonek-rola">${t.role}</p>
          <p>${t.bio}</p>
        </div>
      `;

      container.appendChild(article);
    });

    errorBox.textContent = "";
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Nie udało się pobrać zespołu.";
  }
}

document.addEventListener("DOMContentLoaded", loadTeam);