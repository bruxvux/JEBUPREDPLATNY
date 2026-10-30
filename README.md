# 🇨🇿 JebuPředplatný – Stremio addon (CZ/SK zdarma)

Stremio addon pro český a slovenský obsah bez placeného předplatného. Streamy hledá na **Prehraj.to** a **Hellspy** (přímé MP4, bez přihlášení), případně jako zálohu na YouTube.

## Jak funguje

* **Metadata a epizody dodává Cinemeta** (addon nemá vlastní `meta`), takže se epizody ve Stremiu vždy správně vytvoří.
* **Streamy fungují u každého českého/slovenského titulu**, který Cinemeta zná (sekce *Populární*, *Hledání*, *Knihovna*). Cizí seriály addon ignoruje.
* Vlastní katalogy: 🇨🇿 České a slovenské seriály / filmy (+ vyhledávání v nich).
* Epizody se párují přísně podle názvu a označení (`S01E02`, `1x02`, `2. díl`, název epizody), takže se nezobrazují kompilace ani jiné seriály.
* Odkazy se získávají až při stisku přehrát (`/resolve/...` → přesměrování na MP4), takže seznam streamů je rychlý.

## Omezení (důležité)

Dostupnost závisí na tom, co uživatelé nahráli. Pořady TV Nova (**Comeback, Boží plán**…) jsou z Prehraj.to i Hellspy pravidelně mazány kvůli autorským právům – addon je ukáže, jakmile se objeví, ale nic neumí vytvořit z ničeho. Tituly ČT a starší klasiky (Čtvrtá hvězda, Hospoda, Pelíšky…) fungují dobře.

## Nasazení na Vercel

```powershell
git push origin main
```

Pak na vercel.com **Add New → Project → JEBUPREDPLATNY → Deploy**. Funkce má v `vercel.json` nastaveno `maxDuration: 30`.

Instalace: otevři adresu projektu a klikni na *Nainstalovat do Stremia*, nebo vlož `https://<projekt>.vercel.app/manifest.json` do Doplňků. **Starý addon ve Stremiu nejdřív odinstaluj**, aby se načetl nový manifest.

## Lokální test

```powershell
npm install
node -e "require('http').createServer(require('./api/index.js')).listen(3000)"
```
