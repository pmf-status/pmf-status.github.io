// Povlači listu prijavljenih kandidata sa ePMF portala, filtrira po
// prijemnoj grupi "Geografija" i studijskom programu "Geoprostorni analitičar",
// računa prosjek 4 godine srednje škole, rangira kandidate i upisuje data.json

const API_URL = "https://eportal.pmf.uns.ac.rs/ePMFWebServisi/prijemni/getPrijave";

// Filteri - po ID-evima iz API odgovora (stabilniji od naziva teksta)
const GRUPA_ID = 11; // Geografija
const PROFIL_ID = 11; // Geoprostorni analitičar

// Osoba čiju poziciju pratimo
const TARGET_IME = "Pavle";
const TARGET_PREZIME = "Palikuća";

function normalize(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // skida dijakritike (č, ć, š ...)
}

function prosek(p) {
  return (p.uspeh1 + p.uspeh2 + p.uspeh3 + p.uspeh4) / 4;
}

async function main() {
  const res = await fetch(API_URL, {
    headers: {
      accept: "application/json, text/plain, */*",
      "user-agent": "Mozilla/5.0 (compatible; PavleRankBot/1.0)",
    },
  });

  if (!res.ok) {
    throw new Error(`API odgovor nije OK: ${res.status} ${res.statusText}`);
  }

  const all = await res.json();

  const filtered = all.filter(
    (p) => p.sfrPrijemniGrupa === GRUPA_ID && p.sfrPrijemniProfil === PROFIL_ID
  );

  const withProsek = filtered.map((p) => ({
    ime: p.ime,
    srednjeIme: p.srednjeIme,
    prezime: p.prezime,
    prosek: Math.round(prosek(p) * 10000) / 10000,
    zavrseniDokumenti: p.zavrseniDokumenti,
    status: p.status,
  }));

  // Sortiranje od najboljeg ka najlošijem prosjeku
  withProsek.sort((a, b) => b.prosek - a.prosek);

  withProsek.forEach((p, i) => {
    p.rang = i + 1;
  });

  const target = withProsek.find(
    (p) =>
      normalize(p.ime) === TARGET_IME && normalize(p.prezime) === TARGET_PREZIME
  );

  const output = {
    updatedAt: new Date().toISOString(),
    grupa: "Geografija",
    profil: "Geoprostorni analitičar",
    ukupnoKandidata: withProsek.length,
    target: target || null,
    lista: withProsek,
  };

  const fs = await import("node:fs/promises");
  await fs.writeFile("data.json", JSON.stringify(output, null, 2), "utf-8");

  if (target) {
    console.log(
      `Pavle Palikuća: pozicija ${target.rang} od ${withProsek.length}, prosjek ${target.prosek}`
    );
  } else {
    console.warn("Pavle Palikuća nije pronađen u filtriranoj listi!");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
