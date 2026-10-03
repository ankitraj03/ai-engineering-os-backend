export class Logger {
  private context: string;

  constructor(context = 'App') {
    this.context = context;
  }

  log(message: string, ...args: unknown[]) {
    console.log(`[${new Date().toISOString()}] [LOG] [${this.context}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]) {
    console.info(`[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`, ...args);
  }

  error(message: string, trace?: string, ...args: unknown[]) {
    console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`, trace || '', ...args);
  }

  debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`, ...args);
    }
  }
}

export const logger = new Logger('Server');
