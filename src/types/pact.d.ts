declare module '@pact-foundation/pact' {
  // todo: consider removing this file. Without it pacts are not generated. Need to investigate.

  interface PactOptions {
    consumer: string;
    provider: string;
    port?: number;
    log?: string;
    dir?: string;
    logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    spec?: number;
    [key: string]: unknown;
  }

  interface Interaction {
    state?: string;
    uponReceiving: string;
    withRequest: Record<string, unknown>;
    willRespondWith: Record<string, unknown>;
  }

  export class Pact {
    constructor(options: PactOptions);
    setup(): Promise<void>;
    addInteraction(interaction: Interaction): Promise<void>;
    verify(): Promise<void>;
    finalize(): Promise<void>;
  }

  export class Matchers {
    static like<T>(value: T): T;
    static eachLike<T>(value: T, options?: { min: number }): T[];
    static term(options: { generate: string; matcher: string }): string;
    static integer(value?: number): number;
    static decimal(value?: number): number;
    static boolean(value?: boolean): boolean;
    static date(format: string, value?: string): string;
    static timestamp(format: string, value?: string): string;
    static regex(regex: RegExp | string, value: string): string;
    
    // Additional matcher functions
    static string(value: string): string;
    static iso8601DateTime(value?: string): string;
    static iso8601Date(value?: string): string;
    static iso8601Time(value?: string): string;
    static uuid(value?: string): string;
    static ipv4Address(value?: string): string;
    static ipv6Address(value?: string): string;
    static email(value?: string): string;
    static hexadecimal(value?: string): string;
  }
}
