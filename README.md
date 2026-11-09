# Tixify Admin-SPA

**Der Touchpoint für Administratoren:** Events anlegen, ändern und löschen, den Bestand pflegen und Nutzerrollen verwalten. Gebaut als **Single-Page-Application** mit Angular.

Live: https://tixify-wwi25a.github.io/tixify-frontend-spa/
Zugang nur mit einem Konto mit der Rolle `admin`. Studienprojekt (DHBW Mosbach, WWI25A).

| Repo | Aufgabe |
|---|---|
| Tixify_frontend | MPA für Kunden |
| **tixify-frontend-spa** | **Admin-SPA (dieses Repo)** |
| Tixify_backend | gateway (BFF) und identity: einzige Adresse beider Frontends |
| tixify-catalog | Events, GraphQL, Reservierungen |
| tixify-orders | Warenkorb, PayPal, Bestellungen, Mails |

## SPA-Prinzip

Es gibt nur eine `index.html`. Der Angular-Router tauscht beim Navigieren die Komponente aus, der Browser lädt die Seite nicht neu. Die Daten holt die App über `HttpClient` aus der API des gateway (Adresse an einer Stelle in `src/app/config.ts`).

| Route | Komponente | Inhalt |
|---|---|---|
| `/login` | `pages/login` | Anmeldung (nur Admins kommen weiter) |
| `/dashboard` | `pages/dashboard` | Kennzahlen: Anzahl Events, Gesamtbestand, Warenwert, Durchschnittspreis, knappe Events, Kategorien |
| `/events` | `pages/events` | Eventtabelle mit Suche, Sortierung und Seiten; anlegen, ändern, löschen, Bestand direkt in der Tabelle ändern, Adresssuche mit Karte |
| `/users` | `pages/users` | Nutzerliste, Rolle ändern, Nutzer löschen |

Alle Seiten werden erst bei Bedarf geladen (`loadComponent`). Der **Route Guard** (`guards/auth-guard.ts`) lässt nur angemeldete Nutzer mit der Rolle `admin` (oder `organizer`) auf die Seiten. Er dient der Bedienung; die eigentliche Rechteprüfung macht das Backend bei jeder Anfrage.

## REST und GraphQL

`services/api.ts` bündelt alle Aufrufe:

| Funktion | Schnittstelle |
|---|---|
| Eventtabelle laden | GraphQL `query { events { … } }` (bei Fehler Rückfall auf `GET /api/events`) |
| Bestand ändern | GraphQL `mutation updateStock(eventId, stock)` |
| Event anlegen, ändern, löschen | REST `POST`, `PATCH`, `DELETE /api/events` |
| Adresssuche | REST `GET /api/geocode?q=…` (Nominatim über das Backend) |
| Nutzer laden, Rolle ändern, löschen | REST `GET /api/users`, `PATCH /api/users/:id/role`, `DELETE /api/users/:id` |
| Dashboard | REST `GET /api/events` |

Der Zustand liegt in Angular-Signals; `computed()` berechnet gefilterte Listen und Kennzahlen neu, sobald sich ein Signal ändert. Der angemeldete Nutzer liegt im `AuthService`, das Token im `localStorage`.

## Lokal starten

```bash
npm ci
npx ng serve          # http://localhost:4200
```

## Tests

```bash
npm test -- --watch=false   # 44 Unit-Tests (Vitest), Node 22 oder neuer
npm run test:ci             # zusätzlich mit Abdeckungsbericht in coverage/
```

Die CI (`.github/workflows/ci.yml`) führt die Tests bei jedem Push aus. `.github/workflows/pages.yaml` baut die App und veröffentlicht sie auf GitHub Pages.

## KI-Kennzeichnung

Die Admin-SPA ist mit KI entstanden: Die Erstfassung (Seiten, Dienste, Guard, Styles) wurde am 13.10. mit Gemini erstellt (KI-Log Nr. 17), spätere Erweiterungen wie die Adresssuche, das Entfernen des Check-ins, der Admin-Login und der Studienhinweis ebenfalls mit KI (KI-Log Nr. 18). Das Team hat jede Änderung im Browser getestet und den Code bewertet, bevor sie übernommen wurde. Die Unit-Tests und die CI (`.github/workflows/ci.yml`) wurden mit Claude erstellt (KI-Log Nr. 62). Jede Datei nennt im Kopfkommentar, was mit KI entstanden ist und welche Änderungen danach folgten.
