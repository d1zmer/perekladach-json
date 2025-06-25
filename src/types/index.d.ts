import {CompletionUsage} from "openai/resources/completions";

export interface Args {
  source?: string;
  from?: string;
  to?: string;
  override?: boolean;
  delay?: number;
  log?: 'info' | 'verbose' | 'none';
  help?: boolean;

  // Allow any other string key with safe types
  [key: string]: string | number | boolean | string[] | Record<string, any> | undefined | null;
}

export interface FileArgs {
  to: string;
  source: string;
  dest: string;
  override: boolean;
  delay: number;
  log: 'info' | 'verbose' | 'none';
}

export interface Translation {
  lang?: string
  trans?: string
  usage?: CompletionUsage
}
