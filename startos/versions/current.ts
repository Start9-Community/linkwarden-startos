import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.15.1:0',
  releaseNotes: {
    en_US: `Initial release of Linkwarden for StartOS.

Bundles the three services from upstream's \`docker-compose.yml\` — \`ghcr.io/linkwarden/linkwarden:v2.15.1\`, \`postgres:16-alpine\`, and \`getmeili/meilisearch:v1.12.8\` — as three daemons sharing one localhost netns. The linkwarden image runs its own web server + background worker (\`concurrently\`) and applies Prisma migrations on every startup, so no separate migration oneshot is needed.

- Three volumes: \`main\` (archives/uploads at \`/data/data\`), \`db\` (PostgreSQL data at \`/var/lib/postgresql\`), \`search\` (MeiliSearch index at \`/meili_data\`).
- \`NEXTAUTH_URL\` is derived automatically from the web interface's current address; an optional "Set Primary URL" action lets SSO/OAuth users pin it to their external domain.
- Registration is enabled by default so the first registrant becomes the admin; a toggle action locks it down afterward (server-enforced).

[Full upstream release notes](https://github.com/linkwarden/linkwarden/releases/tag/v2.15.1)`,
    es_ES: `Primera versión de Linkwarden para StartOS.

Incluye los tres servicios del \`docker-compose.yml\` upstream — \`ghcr.io/linkwarden/linkwarden:v2.15.1\`, \`postgres:16-alpine\` y \`getmeili/meilisearch:v1.12.8\` — como tres daemons compartiendo un netns localhost. La imagen de linkwarden ejecuta su propio servidor web + worker en segundo plano (\`concurrently\`) y aplica las migraciones de Prisma en cada inicio, por lo que no hace falta un oneshot de migración.

- Tres volúmenes: \`main\` (archivos/uploads en \`/data/data\`), \`db\` (datos de PostgreSQL en \`/var/lib/postgresql\`), \`search\` (índice de MeiliSearch en \`/meili_data\`).
- \`NEXTAUTH_URL\` se deriva automáticamente de la dirección actual de la interfaz web; una acción opcional "Definir URL Principal" permite a los usuarios de SSO/OAuth fijarla a su dominio externo.
- El registro está habilitado por defecto para que el primer usuario registrado sea el administrador; una acción de conmutación lo bloquea después (aplicado en el servidor).

[Notas de la release upstream](https://github.com/linkwarden/linkwarden/releases/tag/v2.15.1)`,
    de_DE: `Erstes Release von Linkwarden für StartOS.

Bündelt die drei Dienste aus dem Upstream-\`docker-compose.yml\` — \`ghcr.io/linkwarden/linkwarden:v2.15.1\`, \`postgres:16-alpine\` und \`getmeili/meilisearch:v1.12.8\` — als drei Daemons, die sich ein localhost-Netns teilen. Das Linkwarden-Image betreibt seinen eigenen Webserver + Hintergrund-Worker (\`concurrently\`) und wendet bei jedem Start Prisma-Migrationen an, sodass kein separater Migrations-Oneshot nötig ist.

- Drei Volumes: \`main\` (Archive/Uploads unter \`/data/data\`), \`db\` (PostgreSQL-Daten unter \`/var/lib/postgresql\`), \`search\` (MeiliSearch-Index unter \`/meili_data\`).
- \`NEXTAUTH_URL\` wird automatisch aus der aktuellen Adresse der Web-Oberfläche abgeleitet; eine optionale „Primäre URL festlegen"-Aktion erlaubt SSO/OAuth-Nutzern, sie auf ihre externe Domain zu fixieren.
- Die Registrierung ist standardmäßig aktiviert, damit der erste Registrierende der Admin wird; eine Umschalt-Aktion sperrt sie danach (serverseitig erzwungen).

[Vollständige Upstream-Release-Notes](https://github.com/linkwarden/linkwarden/releases/tag/v2.15.1)`,
    pl_PL: `Pierwsze wydanie Linkwarden dla StartOS.

Zawiera trzy usługi z upstream-owego \`docker-compose.yml\` — \`ghcr.io/linkwarden/linkwarden:v2.15.1\`, \`postgres:16-alpine\` i \`getmeili/meilisearch:v1.12.8\` — jako trzy daemony współdzielące jeden netns localhost. Obraz linkwarden uruchamia własny serwer WWW + workera w tle (\`concurrently\`) i aplikuje migracje Prismy przy każdym starcie, więc osobny oneshot migracji nie jest potrzebny.

- Trzy wolumeny: \`main\` (archiwa/uploady w \`/data/data\`), \`db\` (dane PostgreSQL w \`/var/lib/postgresql\`), \`search\` (indeks MeiliSearch w \`/meili_data\`).
- \`NEXTAUTH_URL\` jest wyliczany automatycznie z bieżącego adresu interfejsu WWW; opcjonalna akcja „Ustaw główny URL\" pozwala użytkownikom SSO/OAuth ustawić go na swoją domenę zewnętrzną.
- Rejestracja jest domyślnie włączona, by pierwszy rejestrujący został adminem; akcja przełączania blokuje ją potem (egzekwowane po stronie serwera).

[Pełne notatki wydania upstream](https://github.com/linkwarden/linkwarden/releases/tag/v2.15.1)`,
    fr_FR: `Première version de Linkwarden pour StartOS.

Reprend les trois services du \`docker-compose.yml\` amont — \`ghcr.io/linkwarden/linkwarden:v2.15.1\`, \`postgres:16-alpine\` et \`getmeili/meilisearch:v1.12.8\` — sous forme de trois daemons partageant un netns localhost. L'image linkwarden exécute son propre serveur web + worker en arrière-plan (\`concurrently\`) et applique les migrations Prisma à chaque démarrage, donc aucun oneshot de migration n'est nécessaire.

- Trois volumes : \`main\` (archives/uploads dans \`/data/data\`), \`db\` (données PostgreSQL dans \`/var/lib/postgresql\`), \`search\` (index MeiliSearch dans \`/meili_data\`).
- \`NEXTAUTH_URL\` est dérivé automatiquement de l'adresse actuelle de l'interface web ; une action optionnelle « Définir l'URL principale » permet aux utilisateurs SSO/OAuth de la fixer à leur domaine externe.
- L'inscription est activée par défaut afin que le premier inscrit devienne l'administrateur ; une action de bascule la verrouille ensuite (appliqué côté serveur).

[Notes de version amont complètes](https://github.com/linkwarden/linkwarden/releases/tag/v2.15.1)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
