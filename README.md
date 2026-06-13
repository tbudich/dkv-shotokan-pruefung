# dkv-shotokan-pruefung

Mobile, installierbare Version (PWA) des **Shotokan-Prüfungsprogramms** im Deutschen Karate
Verband – von **9. Kyu bis 8. Dan**. Optimiert für iPhone und iPad, funktioniert vollständig
offline und lässt sich über „Zum Home-Bildschirm“ wie eine App installieren.

## Funktionen

- **Grade durchblättern** – alle Kyu- und Dan-Grade mit Gürtelfarben; pro Grad Kihon, Kata,
  Anwendung/Bunkai und Kumite (Tori/Uke als mobil lesbare Karten statt PDF-Tabellen).
- **Glossar mit Suche** – japanische Begriffe nach Kategorie (Kommandos, Stellungen, Techniken,
  Kampfformen …).
- **Volltextsuche** – über Grade, Techniken, Kata und Begriffe.
- **Dark Mode & Offline** – heller/dunkler Modus (gespeichert) und vollständige Offline-Nutzung
  via Service Worker.

## Tech-Stack

Vite · React · TypeScript · React Router (HashRouter) · `vite-plugin-pwa`. Die Inhalte liegen als
typisierte Daten in `src/data/` und werden nativ gerendert.

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server (http://localhost:5173)
npm run build      # Typecheck + Produktionsbuild nach dist/
npm run preview    # Produktionsbuild lokal testen
npm run lint       # tsc --noEmit (Typecheck)
```

## Deployment

Statisches Build (`dist/`). Dank relativer `base: './'` und HashRouter läuft die App auf
GitHub Pages (Projektseite), Netlify, Vercel o. Ä. ohne weitere Konfiguration.

## Datenquelle & Hinweis

Inhaltsgrundlage ist die offizielle
[Prüfungsordnung Shotokan des DKV](https://www.karate.de/) (Stand 01.01.2023, redaktionelle
Änderungen 20.03.2024 und 09.12.2025), abgelegt unter [`pdfs/`](pdfs/).

Dies ist eine **inoffizielle**, mobil-optimierte Aufbereitung. Maßgeblich ist stets das offizielle
PDF des DKV. Vervielfältigungen, auch auszugsweise, sind nur mit vorheriger Genehmigung des
Deutschen Karate Verbandes e.V. (Stilrichtung „Shotokan“) gestattet.

## Lizenz

Der Quellcode steht unter der [MIT-Lizenz](LICENSE). Die abgebildeten Prüfungsinhalte sind
urheberrechtlich vom DKV geschützt (siehe oben).
