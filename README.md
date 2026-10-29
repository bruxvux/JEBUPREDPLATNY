# 🇨🇿 JebuPředplatný - Stremio Addon (CZ/SK Free Stream)

Stremio doplněk (addon) zaměřený na **český a slovenský obsah zdarma bez nutnosti jakéhokoliv placeného předplatného (Webshare VIP, Kra.sk, Real-Debrid)**.

Kombinuje přímé streamování z **Prehraj.to** a **YouTube HD** s kurátorovaným katalogem kultovních českých seriálů a komedií.

---

## 🚀 Hlavní funkce

* **100% Zdarma bez předplatného:** Žádné účty, žádné platební karty ani VIP kredity.
* **Přímé MP4 streamy z Prehraj.to:** Přehrávání videí v 720p HD přímo v interním přehrávači Stremia (ExoPlayer / MPV / Web).
* **YouTube HD integrace:** Přehrávání celých epizod a filmů v 1080p s nulovým načítáním a oficiálními titulky.
* **Kompletní kultovní seriály:**
  * **Comeback** (Všech 51 dílů obou sérií s původními názvy, popisy a přebaly)
  * **Boží plán** (Nový seriál televize Nova 2026 s Tomášem Jeřábkem a Markem Lamborou)
  * **Hospoda** (52 dílů hospodského humoru U kotvy s Babulou, Duškem a Kachnou)
  * **Okresní přebor** (Všech 16 dílů Slavoje Houslice a trenéra Jirky Luňáka)
  * **Most!** (Kultovní osmidílná série Jana Prušinovského a Petra Kolečka)
  * **Vyšehrad** (Fotbalový fenomén Julius Lavický / Lavi)
  * **Čtvrtá hvězda**, **Kosmo**, **Devadesátky**, **Chalupáři** a další
* **Kultovní české filmy a komedie:**
  * *Pelíšky*, *Samotáři*, *Dědictví aneb Kurvahošigutntag*, *S tebou mě baví svět*, *Vratné lahve*, *Na samotě u lesa*, *Slunce, seno...*, *Vesničko má středisková*, *Černí baroni*.
* **Kompatibilita se všemi zařízeními:**
  * Samsung Smart TV (Tizen)
  * LG Smart TV (webOS)
  * Android TV & Google TV
  * Windows / Mac / Linux
  * Android & iOS

---

## 🛠️ Nasazení na Vercel (Deployment)

Tento projekt je připraven pro okamžité nasazení na [Vercel](https://vercel.com) jako serverless funkce:

### Možnost 1: Přes GitHub (Doporučeno)
1. Nahrajte tento repozitář na svůj GitHub účet:
   ```bash
   git add .
   git commit -m "Initial commit of JebuPredplatny Stremio addon"
   git push origin main
   ```
2. Jděte na [vercel.com](https://vercel.com) a klikněte na **Add New... -> Project**.
3. Vyberte repozitář `JEBUPREDPLATNY`.
4. V nastavení ponechte výchozí hodnoty (Framework Preset: *Other*) a klikněte na **Deploy**.
5. Po dokončení nasazení získáte URL ve tvaru:
   `https://jebupredplatny.vercel.app`

---

## 📺 Instalace do Stremia

1. Otevřete v prohlížeči vaši Vercel URL (např. `https://jebupredplatny.vercel.app`).
2. Klikněte na tlačítko **🚀 Nainstalovat do Stremia** (otevře se přímo Stremio).
3. Případně zkopírujte odkaz na manifest:
   ```text
   https://vas-projekt.vercel.app/manifest.json
   ```
   a vložte jej do vyhledávacího pole v záložce **Doplňky (Add-ons)** ve Stremiu.

---

## 📄 Licence
MIT License
