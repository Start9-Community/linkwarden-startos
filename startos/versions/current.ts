import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'

export const current = VersionInfo.of({
  version: '2.16.0:1',
  releaseNotes: {
    en_US:
      '- Disable Registration asks for confirmation before running.\n- Set Primary URL lists only Linkwarden’s addresses. Until you choose one, Linkwarden uses its public domain, HTTPS first, or else its .local address.\n- Open UI opens Linkwarden at its primary URL when your connection can reach it.',
    es_ES:
      '- Deshabilitar Registro pide confirmación antes de ejecutarse.\n- Definir URL Principal muestra solo las direcciones de Linkwarden. Hasta que elijas una, Linkwarden usa su dominio público, primero HTTPS, o si no su dirección .local.\n- Abrir interfaz abre Linkwarden en su URL principal cuando tu conexión puede alcanzarla.',
    de_DE:
      '- „Registrierung deaktivieren“ fragt vor der Ausführung nach einer Bestätigung.\n- „Primäre URL festlegen“ listet nur die Adressen von Linkwarden auf. Bis du eine auswählst, verwendet Linkwarden seine öffentliche Domain, HTTPS zuerst, sonst seine .local-Adresse.\n- „UI öffnen“ öffnet Linkwarden unter seiner primären URL, wenn deine Verbindung sie erreichen kann.',
    pl_PL:
      '- „Wyłącz rejestrację” prosi o potwierdzenie przed uruchomieniem.\n- „Ustaw główny URL” pokazuje tylko adresy Linkwarden. Dopóki go nie wybierzesz, Linkwarden używa swojej domeny publicznej, najpierw HTTPS, a w przeciwnym razie adresu .local.\n- „Otwórz interfejs” otwiera Linkwarden pod jego głównym URL, gdy Twoje połączenie może go osiągnąć.',
    fr_FR:
      "- Désactiver l'inscription demande une confirmation avant de s'exécuter.\n- Définir l'URL principale ne propose que les adresses de Linkwarden. Tant que vous n'en choisissez pas, Linkwarden utilise son domaine public, HTTPS d'abord, sinon son adresse .local.\n- Ouvrir l'interface ouvre Linkwarden à son URL principale lorsque votre connexion peut l'atteindre.",
  },
  migrations: {
    up: async ({ effects }) => {
      if ((await storeJson.read((s) => s.primaryUrl).once()) === '')
        await storeJson.merge(effects, { primaryUrl: null })
    },
    down: IMPOSSIBLE,
  },
})
