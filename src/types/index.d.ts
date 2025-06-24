export interface Arguments {
    source: string;
    from?: string;
    to?: string;
    override?: boolean;
    delay?: number;
    log?: 'info' | 'verbose' | 'none';
}
