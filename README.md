# 🇨🇿 JebuPředplatný v3.1.0 – Přímé CZ/SK streamy přímo ve Stremiu

Český a slovenský streamovací addon pro **Stremio** zcela zdarma bez předplatného. Všechny streamy hrají **přímo ve vnitřním přehrávači Stremia** – žádné otevírání externího webového prohlížeče!

---

## 🌟 Jak to funguje

1. **Pouze přímé streamy uvnitř Stremia:**
   - Žádné odkazy na externí webové stránky (`externalUrl` bylo kompletně odstraněno).
   - Každý stream je buď přímý **MP4 video stream** (přehrávaný interním video přehrávačem Stremia s možností posouvání), nebo oficiální **YouTube stream** (`ytId`, který Stremio přehrává nativně).
2. **Podporované zdroje:**
   - **⚡ Čeknito.cz (přímé MP4):** Kultovní seriály jako *Comeback* (všechny epizody: Křeslo, Gott ex machina, Zlatá ledvina...), *Hospoda* a další.
   - **⚡ Hellspy (1080p FHD / 720p HD MP4):** Špičková kvalita filmů a seriálů (*Hospoda*, *Čtvrtá hvězda*, *Most!*, *Pelíšky*, *Samotáři*...).
   - **⚡ Prehraj.to (přímé MP4):** Přímé streamy z veřejných zdrojů.
   - **▶ YouTube HD:** Striktně ověřené celé epizody a české filmy přehrávané přímo v aplikaci Stremio.
3. **Výchozí katalog Cinemeta:**
   - Addon nemá žádný omezený katalog – hledejte nebo vybírejte přímo v sekcích *Populární*, *Objevovat* a *Vyhledávání* ve Stremiu. Všechny epizody a plakáty dodává Cinemeta.
4. **Cizí obsah ignoruje:**
   - Zahraniční tituly (jako *Breaking Bad*) addon nepřekrývá a přenechává vašim ostatním doplňkům.

---

## 🚀 Instalace do Stremia

1. **DŮLEŽITÉ:** Pokud jste měli nainstalovanou starší verzi doplňku, **ve Stremiu ji v záložce Doplňky nejprve odinstalujte**.
2. Otevřete webovou adresu vašeho nasazeného Vercel projektu:
   ```text
   https://<vas-projekt>.vercel.app
   ```
   a klikněte na tlačítko **🚀 Nainstalovat do Stremia**.
3. Případně zadejte adresu manifestu přímo do vyhledávacího pole Doplňků ve Stremiu:
   ```text
   https://<vas-projekt>.vercel.app/manifest.json
   ```
