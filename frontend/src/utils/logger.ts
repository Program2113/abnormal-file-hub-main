// logger.ts
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

class Logger {
  private static instance: Logger;
  private logLevel: number;

  private constructor() {
    this.logLevel = LOG_LEVELS.INFO;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' ');
    return `[${timestamp}] [${level}] ${message} ${formattedArgs}`;
  }

  private async writeToFile(message: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        console.error('Failed to write log to backend');
      }
    } catch (error) {
      console.error('Error writing log:', error);
    }
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = LOG_LEVELS[level];
  }

  public debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LOG_LEVELS.DEBUG) {
      const formattedMessage = this.formatMessage('DEBUG', message, ...args);
      console.debug(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.logLevel <= LOG_LEVELS.INFO) {
      const formattedMessage = this.formatMessage('INFO', message, ...args);
      console.info(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LOG_LEVELS.WARN) {
      const formattedMessage = this.formatMessage('WARN', message, ...args);
      console.warn(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.logLevel <= LOG_LEVELS.ERROR) {
      const formattedMessage = this.formatMessage('ERROR', message, ...args);
      console.error(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }
}

export const logger = Logger.getInstance();