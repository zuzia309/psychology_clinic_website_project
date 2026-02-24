async function loadTeam() {
  const container = document.querySelector("#teamList");
  const errorBox = document.querySelector("#teamError");

  try {
    const res = await fetch("/api/therapists");

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const therapists = await res.json();

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