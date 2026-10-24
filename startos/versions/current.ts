import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '2.16.3:0',
  releaseNotes: {
    en_US: `Updated Linkwarden to 2.16.3.

- Much faster link, search, tag, collection and dashboard queries on large libraries.
- Names now sort case-insensitively.
- Dismissed announcements stay dismissed across devices.
- Includes the October 2026 Node.js security fixes.
- Search results may be incomplete for a while after the update, until Linkwarden finishes rebuilding its search index.

Full release notes: https://github.com/linkwarden/linkwarden/releases`,
    es_ES: `Actualiza Linkwarden a 2.16.3.

- Consultas de enlaces, búsqueda, etiquetas, colecciones y panel mucho más rápidas en bibliotecas grandes.
- Los nombres se ordenan sin distinguir mayúsculas y minúsculas.
- Los anuncios descartados siguen descartados en todos los dispositivos.
- Incluye las correcciones de seguridad de Node.js de octubre de 2026.
- Los resultados de búsqueda pueden estar incompletos durante un tiempo tras la actualización, hasta que Linkwarden termine de reconstruir su índice de búsqueda.

Notas completas de la versión: https://github.com/linkwarden/linkwarden/releases`,
    de_DE: `Aktualisiert Linkwarden auf 2.16.3.

- Deutlich schnellere Abfragen von Links, Suche, Tags, Sammlungen und Dashboard bei großen Bibliotheken.
- Namen werden ohne Beachtung der Groß- und Kleinschreibung sortiert.
- Ausgeblendete Ankündigungen bleiben auf allen Geräten ausgeblendet.
- Enthält die Node.js-Sicherheitskorrekturen vom Oktober 2026.
- Suchergebnisse können nach dem Update eine Weile unvollständig sein, bis Linkwarden seinen Suchindex neu aufgebaut hat.

Vollständige Versionshinweise: https://github.com/linkwarden/linkwarden/releases`,
    pl_PL: `Aktualizuje Linkwarden do wersji 2.16.3.

- Znacznie szybsze zapytania o linki, wyszukiwanie, tagi, kolekcje i pulpit w dużych bibliotekach.
- Nazwy są sortowane bez rozróżniania wielkości liter.
- Odrzucone ogłoszenia pozostają odrzucone na wszystkich urządzeniach.
- Zawiera poprawki bezpieczeństwa Node.js z października 2026.
- Wyniki wyszukiwania mogą być przez pewien czas po aktualizacji niepełne, dopóki Linkwarden nie odbuduje swojego indeksu wyszukiwania.

Pełne informacje o wydaniu: https://github.com/linkwarden/linkwarden/releases`,
    fr_FR: `Met à jour Linkwarden vers 2.16.3.

- Requêtes de liens, de recherche, d'étiquettes, de collections et du tableau de bord bien plus rapides sur les grandes bibliothèques.
- Les noms sont triés sans tenir compte de la casse.
- Les annonces masquées le restent sur tous les appareils.
- Inclut les correctifs de sécurité Node.js d'octobre 2026.
- Les résultats de recherche peuvent être incomplets pendant un moment après la mise à jour, le temps que Linkwarden reconstruise son index de recherche.

Notes de version complètes : https://github.com/linkwarden/linkwarden/releases`,
  },
  migrations: {
    up: async ({ effects }) => {
      // MeiliSearch 1.13 can't open a 1.12 index; Linkwarden re-indexes links whose indexVersion is unset.
      if (existsSync(sdk.volumes.db.subpath('data/PG_VERSION')))
        await sdk.SubContainer.withTemp(
          effects,
          { imageId: 'postgres' },
          sdk.Mounts.of().mountVolume({
            volumeId: 'db',
            subpath: null,
            mountpoint: '/var/lib/postgresql',
            readonly: false,
          }),
          'reset-search-index',
          (sub) =>
            sub.execFail(
              [
                'postgres',
                '--single',
                '-D',
                '/var/lib/postgresql/data',
                '-c',
                'exit_on_error=on',
                'postgres',
              ],
              {
                user: 'postgres',
                input: 'UPDATE "Link" SET "indexVersion" = NULL',
                timeout: null,
              },
            ),
        )
      await rm(sdk.volumes.search.subpath('data.ms'), {
        recursive: true,
        force: true,
      })
    },
    down: IMPOSSIBLE,
  },
})
