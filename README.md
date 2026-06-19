# Pavle Palikuća — rang lista

Jednostavan sajt koji prikazuje trenutnu poziciju Pavla Palikuće na rang listi
prijavljenih kandidata za **Geografija → Geoprostorni analitičar**, na osnovu
zbira ocjena 4 razreda srednje škole, sa ePMF portala PMF-a u Novom Sadu.

## Kako radi

- `index.html` — statična stranica (GitHub Pages). Na otvaranju prikazuje
  posljednje sačuvane podatke iz `data.json`. Dugme **"Osvježi sada"**
  (narandžasto) direktno iz browsera zove ePMF API, izračunava rang uživo i
  odmah prikazuje rezultat (sa "live" oznakom) — bez čekanja na bilo kakav
  raspored.
- `scripts/fetch.mjs` + `.github/workflows/update.yml` — opcioni rezervni
  mehanizam. Pokreće se **samo ručno** (Actions → "Update rank data" → "Run
  workflow"), povlači podatke server-side i trajno ih upisuje u `data.json`
  (ovo postaje "posljednje sačuvano stanje" koje se prikazuje pri otvaranju
  stranice).

### Zašto dugme ne pokreće GitHub Action

Statična GitHub Pages stranica ne može bezbjedno da pokrene GitHub Action
direktno (to bi zahtijevalo javno objavljen token, što bi bilo nebezbjedno).
Zato dugme radi nešto bolje za ovu svrhu: poziva ePMF server **direktno iz
browsera** i odmah prikazuje svjež rezultat, bez ikakvog čekanja.

Ako server ikad blokira pozive iz browsera (CORS), dugme će prikazati jasnu
poruku — u tom slučaju i dalje možeš ručno pokrenuti GitHub Action (Actions
tab → "Run workflow") da osvježiš `data.json`.

## Postavljanje (5 minuta)

1. Napravi novi **public** repozitorijum na GitHub-u (npr. `pavle-rank`).
2. Otpakuj/ubaci sve fajlove iz ovog foldera u taj repozitorijum (zadrži
   strukturu foldera, uključujući skriveni folder `.github`).
3. Push-uj na `main` granu.
4. Idi u repozitorijum → **Settings → Pages** → pod "Build and deployment"
   izaberi **Deploy from a branch**, granu `main`, folder `/ (root)` → Save.
   Za par minuta sajt će biti dostupan na
   `https://<tvoj-username>.github.io/<naziv-repozitorijuma>/`.
5. Otvori sajt i klikni **"Osvježi sada"** da provjeriš radi li live
   osvježavanje direktno iz browsera.

## Napomena

`data.json` u repozitorijumu trenutno sadrži primjer podataka (snapshot od
trenutka kad je sajt napravljen). Klik na dugme prikazuje svježe podatke samo
za tu posjetu stranici (ne upisuje trajno u repo) — ako želiš da i "zadnje
sačuvano stanje" (ono što se vidi prije klika na dugme) bude ažurno, povremeno
ručno pokreni GitHub Action.
