import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.16.0:0',
  releaseNotes: {
    en_US: `Updated Linkwarden to 2.16.0.

- Refreshed design: the top navbar is gone and its functions moved into the sidebar, along with a number of smaller UX fixes
- New search modal opened with \`Ctrl+K\` (\`⌘K\` on macOS), keeping your recent searches in the browser
- New "System" theme option that follows your device's light/dark preference
- Link banners now accept PNG uploads in addition to JPEG

[Full upstream release notes](https://github.com/linkwarden/linkwarden/releases/tag/v2.16.0)`,
    es_ES: `Linkwarden actualizado a 2.16.0.

- Diseño renovado: la barra de navegación superior desaparece y sus funciones pasan a la barra lateral, junto con varias correcciones menores de usabilidad
- Nuevo modal de búsqueda que se abre con \`Ctrl+K\` (\`⌘K\` en macOS) y guarda tus búsquedas recientes en el navegador
- Nueva opción de tema "Sistema" que sigue la preferencia de claro/oscuro de tu dispositivo
- Los banners de enlaces ahora aceptan imágenes PNG además de JPEG

[Notas de la release upstream](https://github.com/linkwarden/linkwarden/releases/tag/v2.16.0)`,
    de_DE: `Linkwarden auf 2.16.0 aktualisiert.

- Überarbeitetes Design: die obere Navigationsleiste entfällt, ihre Funktionen sind in die Seitenleiste gewandert, dazu mehrere kleinere UX-Korrekturen
- Neues Suchfenster, das mit \`Strg+K\` (\`⌘K\` unter macOS) öffnet und die letzten Suchanfragen im Browser speichert
- Neue Theme-Option „System“, die der Hell-/Dunkel-Einstellung des Geräts folgt
- Link-Banner akzeptieren jetzt PNG-Uploads zusätzlich zu JPEG

[Vollständige Upstream-Release-Notes](https://github.com/linkwarden/linkwarden/releases/tag/v2.16.0)`,
    pl_PL: `Linkwarden zaktualizowany do 2.16.0.

- Odświeżony wygląd: górny pasek nawigacji zniknął, a jego funkcje przeniesiono do panelu bocznego, wraz z szeregiem drobnych poprawek UX
- Nowe okno wyszukiwania otwierane skrótem \`Ctrl+K\` (\`⌘K\` na macOS), zapamiętujące ostatnie wyszukiwania w przeglądarce
- Nowa opcja motywu „System”, podążająca za ustawieniem jasny/ciemny na Twoim urządzeniu
- Banery linków przyjmują teraz pliki PNG obok JPEG

[Pełne notatki wydania upstream](https://github.com/linkwarden/linkwarden/releases/tag/v2.16.0)`,
    fr_FR: `Linkwarden mis à jour vers 2.16.0.

- Design rafraîchi : la barre de navigation supérieure disparaît et ses fonctions passent dans la barre latérale, avec plusieurs corrections d'ergonomie
- Nouvelle fenêtre de recherche ouverte par \`Ctrl+K\` (\`⌘K\` sur macOS), qui conserve vos recherches récentes dans le navigateur
- Nouvelle option de thème « Système » qui suit la préférence clair/sombre de votre appareil
- Les bannières de liens acceptent désormais les fichiers PNG en plus du JPEG

[Notes de version amont complètes](https://github.com/linkwarden/linkwarden/releases/tag/v2.16.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
