import {translateFile} from "./translate-file";
import {writeJson} from "../disk/write-json";

/**
 * Translate the source file to the target queue
 * @param args
 * @return {Promise<void>}
 */
export async function translateQueue(args) {

  const queue = args['to'] ?? [];

  for ( const to of queue ) {

    console.info(`Start translating to ${to}`);

    // Set the target language
    args['to'] = to;

    // Translate the source file to the target
    const targetTranslation = await translateFile(args);

    // Save the target translation
    writeJson(targetTranslation, args);

    console.info(`End translating to ${to}`);

  }

}
