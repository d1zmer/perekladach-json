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
