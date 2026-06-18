// Povlači listu prijavljenih kandidata sa ePMF portala, filtrira po
// prijemnoj grupi "Geografija" i studijskom programu "Geoprostorni analitičar",
// računa prosjek 4 godine srednje škole, rangira kandidate i upisuje data.json

const API_URL = "https://eportal.pmf.uns.ac.rs/ePMFWebServisi/prijemni/getPrijave";

// Filteri - po ID-evima iz API odgovora (stabilniji od naziva teksta)
const GRUPA_ID = 11; // Geografija
const PROFIL_ID = 11; // Geoprostorni analitičar

// Osoba čiju poziciju pratimo
const TARGET_IME_RAW = "Pavle";
const TARGET_PREZIME_RAW = "Palikuća";

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
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      referer: "https://eportal.pmf.uns.ac.rs/",
      origin: "https://eportal.pmf.uns.ac.rs",
    },
  });

  console.log(`HTTP status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const body = await res.text();
    console.error("Tijelo odgovora (prvih 500 karaktera):", body.slice(0, 500));
    throw new Error(`API odgovor nije OK: ${res.status} ${res.statusText}`);
  }

  const raw = await res.text();
  let all;
  try {
    all = JSON.parse(raw);
  } catch (e) {
    console.error("Odgovor nije validan JSON. Prvih 500 karaktera:", raw.slice(0, 500));
    throw e;
  }

  if (!Array.isArray(all)) {
    console.error("Odgovor nije niz. Tip:", typeof all, "Sadržaj (prvih 500 kar.):", JSON.stringify(all).slice(0, 500));
    throw new Error("Neočekivan format odgovora");
  }

  console.log(`Ukupno kandidata u odgovoru: ${all.length}`);

  // dijagnostika: pronađi sve zapise sa prezimenom koje liči na "Palikuća",
  // bez obzira na grupu/profil filter, da vidimo da li uopšte postoji u odgovoru
  const possibleMatches = all.filter((p) =>
    normalize(p.prezime).includes("palikuc")
  );
  console.log(
    `Zapisi koji liče na "Palikuća" u CIJELOM odgovoru (bilo koja grupa):`,
    JSON.stringify(possibleMatches)
  );

  const filtered = all.filter(
    (p) => p.sfrPrijemniGrupa === GRUPA_ID && p.sfrPrijemniProfil === PROFIL_ID
  );

  console.log(
    `Kandidata u grupi/profilu (${GRUPA_ID}/${PROFIL_ID}): ${filtered.length}`
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

  const TARGET_IME = normalize(TARGET_IME_RAW);
  const TARGET_PREZIME = normalize(TARGET_PREZIME_RAW);

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
