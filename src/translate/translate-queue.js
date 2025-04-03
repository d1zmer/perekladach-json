import {translateFile} from "./translate-file";
import {writeJson} from "../disk/write-json";
import {definePaths} from "../tools/define-paths";

/**
 * Translate the source file to the target queue
 * @param args
 * @return {Promise<void>}
 */
export async function translateQueue(args) {

  const queue = args['to'] !== undefined ? typeof args['to'] === 'string' ? [args['to']] : args['to'] : [];
  const from = args['from'] ?? null;
  const source = args['source'] ?? null;
  const override = args['override'] ?? false;
  const delay = args['delay'] ?? 500;
  const log = args['log'] ?? 'info';

  for ( const to of queue ) {

    if ( log === 'verbose' ) {
      console.info(`Start translating to ${to}`);
    }

    const dest = definePaths(from, to, source);

    // Translate the source file to the target
    const targetTranslation = await translateFile({
      from: from,
      to: to,
      source: source,
      dest: dest,
      override: override,
      delay: delay,
      log: log
    });
    if (targetTranslation) {
      writeJson(targetTranslation, dest);
    }

    if ( log === 'verbose' ) {
      console.info(`End translating to ${to}`);
    }

  }

}
