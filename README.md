# 🇨🇿 JebuPředplatný v3.0.0 – Univerzální CZ/SK Stremio Addon

Český a slovenský streamovací addon pro **Stremio** zcela zdarma bez jakéhokoliv předplatného (bez Webshare VIP, bez Kra.sk, bez Real-Debrid).

---

## 🌟 Jak to funguje

1. **Žádný omezený katalog:**
   - Addon nemá žádný vlastní umělý katalog se 4 položkami.
   - Využívá přímo výchozí katalog **Cinemeta ve Stremiu** – jakýkoliv český film nebo seriál, který najdete v sekci *Populární*, *Objevovat* nebo ve *Vyhledávání* Stremia (Comeback, Boží plán, Hospoda, Čtvrtá hvězda, Most!, Pelíšky, Samotáři...), má k dispozici všechny epizody, plakáty i popisy.
2. **Vícezónový resolver streamů:**
   - **⚡ Hellspy (1080p FHD / 720p HD MP4):** Přímé streamy konvertované do MP4, které se přehrávají přímo v interním přehrávači Stremia (např. *Hospoda*, *Čtvrtá hvězda*, *Pelíšky* atd.).
   - **📺 Oficiální přehrávače vysílatelů:**
     - **TV Nova / Oneplay:** Přímé spuštění pro *Comeback*, *Boží plán*, *Hospoda*, *Okresní přebor*, *Specialisté*, *Ordinace* jedním klikem.
     - **Česká televize iVysílání:** Přímé spuštění pro *Most!*, *Čtvrtá hvězda*, *Devadesátky*, *Kukačky*, *Kosmo*, *Chalupáři*, *Rapl*, *Svět pod hlavou* atd.
     - **TV Prima / Prima+:** Vyhledání a spuštění pro seriály Primy (*Slunečná*, *ZOO*...).
   - **▶ YouTube HD:** Striktně filtrované celé oficiální epizody a filmy (odfiltrovány všechny nesmyslné kompilace, rozhovory a falešná videa).
   - **🌐 Sleduj.to / Sleduj.online:** 1-klikové vyhledání streamu pro danou epizodu/film.
3. **Cizí obsah ignoruje:**
   - Pokud si pustíte *Breaking Bad* nebo *Inception*, addon se neplete do cesty a nechává prostor vašim ostatním torrent/debrid addonům.

---

## 🚀 Instalace do Stremia

1. **DŮLEŽITÉ:** Pokud jste měli nainstalovanou starší verzi doplňku (v1 nebo v2), **nejdříve ji ve Stremiu v záložce Doplňky odinstalujte** (aby Stremio vymazalo starou mezipaměť a katalog).
2. Otevřete webovou adresu vašeho nasazeného Vercel projektu:
   ```text
   https://<vas-projekt>.vercel.app
   ```
   a klikněte na tlačítko **🚀 Nainstalovat do Stremia**.
3. Případně zadejte adresu manifestu přímo do vyhledávacího pole Doplňků ve Stremiu:
   ```text
   https://<vas-projekt>.vercel.app/manifest.json
   ```

---

## 💻 Lokální vývoj a testování

```powershell
# Spuštění lokálního serveru
node -e "require('http').createServer(require('./api/index.js')).listen(3000)"
```
Manifest bude dostupný na `http://localhost:3000/manifest.json`.
