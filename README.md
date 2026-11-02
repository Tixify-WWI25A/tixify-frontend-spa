# TixifyAdminSpa

## KI-Kennzeichnung

Die Admin-SPA ist mit KI entstanden: Die Erstfassung (Seiten, Dienste, Guard, Styles) wurde am 13.10. mit Gemini erstellt (KI-Log W3), spätere Erweiterungen wie die Adresssuche, das Entfernen des Check-ins, der Admin-Login und der Studienhinweis ebenfalls mit KI (KI-Log W6). Das Team hat jede Änderung im Browser getestet und den Code bewertet, bevor sie übernommen wurde. Die Unit-Tests und die CI (`.github/workflows/ci.yml`) wurden mit Claude erstellt (KI-Log Nr. 26). Jede Datei nennt im Kopfkommentar, was mit KI entstanden ist und welche Änderungen danach folgten.

## Tests

```bash
npm ci
npm test -- --watch=false   # 44 Unit-Tests (Vitest), Node 22.22.3 oder neuer
npm run test:ci             # zusätzlich mit Abdeckungsbericht in coverage/
```


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
