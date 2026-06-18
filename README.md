# Pavle Palikuća — rang lista

Jednostavan sajt koji prikazuje trenutnu poziciju Pavla Palikuće na rang listi
prijavljenih kandidata za **Geografija → Geoprostorni analitičar**, na osnovu
prosjeka 4 razreda srednje škole, sa ePMF portala PMF-a u Novom Sadu.

## Kako radi

- `scripts/fetch.mjs` — Node skripta koja pozove API
  (`https://eportal.pmf.uns.ac.rs/ePMFWebServisi/prijemni/getPrijave`),
  filtrira kandidate po grupi/profilu, računa prosjek i rang, i upisuje
  rezultat u `data.json`.
- `.github/workflows/update.yml` — GitHub Action koja tu skriptu pokreće
  automatski na svaka 3 sata (i ručno preko "Run workflow" dugmeta), i
  commit-uje novi `data.json` ako se promijenio.
- `index.html` — statična stranica (GitHub Pages) koja čita `data.json` i
  lijepo prikazuje poziciju i cijelu listu.

## Postavljanje (5 minuta)

1. Napravi novi **public** repozitorijum na GitHub-u (npr. `pavle-rank`).
2. Otpakuj/ubaci sve fajlove iz ovog foldera u taj repozitorijum (zadrži
   strukturu foldera, uključujući skriveni folder `.github`).
3. Push-uj na `main` granu.
4. Idi u repozitorijum → **Settings → Pages** → pod "Build and deployment"
   izaberi **Deploy from a branch**, granu `main`, folder `/ (root)` → Save.
   Za par minuta sajt će biti dostupan na
   `https://<tvoj-username>.github.io/<naziv-repozitorijuma>/`.
5. Idi u **Actions** tab, izaberi workflow "Update rank data" i klikni
   **Run workflow** da odmah povučeš najsvježije podatke (inače će se
   pokrenuti samo automatski na svaka 3 sata).

To je sve — sajt se sam ažurira, ne moraš ništa dalje da radiš.

## Napomena

`data.json` u repozitorijumu trenutno sadrži primjer podataka (snapshot od
trenutka kad je sajt napravljen) tako da stranica radi odmah; prva
automatska/ručna pokretanje Action-a će ga osvježiti pravim, najnovijim
podacima.
