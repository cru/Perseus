// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { CONCEPT_TABLES } from './concept-tables'

export const environment = {
  production: false,
  local: false,
  server: 'jnjcicdu1',
  dbServer: 'jnjcicdu1',
  port: 8080,
  conceptTables: CONCEPT_TABLES
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
