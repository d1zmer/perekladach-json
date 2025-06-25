import {JsonTranslator} from "./json-translator";
import {writeJson} from "../disk/write-json";
import {definePaths} from "../tools/define-paths";
import {Args} from "../types";

/**
 * Translate the source file to the target queue
 * @param args
 * @return {Promise<void>}
 */
export async function translateQueue(args: Args): Promise<void> {

  const queue = args['to'] !== undefined ? typeof args['to'] === 'string' ? [args['to']] : args['to'] : [];
  const from = args['from'] ?? 'auto';
  const source = args['source'] ?? '';
  const override = args['override'] ?? false;
  const delay = args['delay'] ?? 500;
  const log = args['log'] ?? 'info';

  for ( const to of queue ) {

    if ( log === 'verbose' ) {
      console.info(`Start translating to ${to}`);
    }

    const dest = definePaths(from, to, source);

    const translator = new JsonTranslator();
    const targetTranslation = await translator.translate({
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
