/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for the Davos directory's public CSV source (see src/features/davos/sheets-config.mjs). */
  readonly VITE_DAVOS_EVENTS_CSV_URL?: string;
}
