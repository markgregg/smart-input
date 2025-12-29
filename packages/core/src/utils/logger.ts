/**
 * Debug logging utility for Open Input
 *
 * Provides structured logging with namespace support, similar to the 'debug' package.
 * Logs are only output when debugging is enabled via localStorage or environment variables.
 *
 * @example
 * ```ts
 * import { createLogger } from '@smart-input/core';
 *
 * const log = createLogger('editor:state');
 * log('Blocks updated', { count: blocks.length });
 * log.warn('Large content detected', { size: content.length });
 * log.error('Failed to parse', error);
 * ```
 */

/**
 * Log level for filtering messages
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  /** Minimum log level to display */
  level: LogLevel;
  /** Whether to include timestamps */
  timestamps: boolean;
  /** Custom output function (default: console) */
  output?: typeof console;
}

/**
 * Logger instance for a specific namespace
 */
export interface Logger {
  /** Log a debug message */
  (message: string, ...args: unknown[]): void;
  /** Log an info message */
  info: (message: string, ...args: unknown[]) => void;
  /** Log a warning message */
  warn: (message: string, ...args: unknown[]) => void;
  /** Log an error message */
  error: (message: string, ...args: unknown[]) => void;
  /** Check if namespace is enabled */
  enabled: boolean;
  /** The namespace of this logger */
  namespace: string;
}

// Global configuration
let globalConfig: LoggerConfig = {
  level:
    typeof process !== 'undefined' &&
    process.env?.['NODE_ENV'] === 'development'
      ? LogLevel.DEBUG
      : LogLevel.WARN,
  timestamps: true,
  output: console,
};

// Store enabled namespaces
const enabledNamespaces = new Set<string>();

/**
 * Check if localStorage is available
 */
function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Load debug configuration from localStorage or environment
 */
function loadDebugConfig(): void {
  // Check localStorage for debug flag
  if (hasLocalStorage()) {
    const debugValue = localStorage.getItem('debug');
    if (debugValue) {
      parseDebugString(debugValue);
    }
  }

  // Check environment variable (for Node.js environments)
  if (typeof process !== 'undefined' && process.env?.['DEBUG']) {
    parseDebugString(process.env?.['DEBUG'] || '');
  }
}

/**
 * Parse debug string and enable matching namespaces
 * Examples: 'smart-input:*', 'smart-input:editor:*', 'smart-input:editor:state'
 */
function parseDebugString(debugStr: string): void {
  const patterns = debugStr.split(',').map((s) => s.trim());

  patterns.forEach((pattern) => {
    if (pattern === '*' || pattern === 'smart-input:*') {
      // Enable all smart-input namespaces
      enabledNamespaces.add('*');
    } else if (pattern.startsWith('smart-input:')) {
      enabledNamespaces.add(pattern);
    }
  });
}

/**
 * Check if a namespace is enabled
 */
function isNamespaceEnabled(namespace: string): boolean {
  // Always disabled in production unless explicitly enabled
  if (
    typeof process !== 'undefined' &&
    process.env?.['NODE_ENV'] === 'production' &&
    enabledNamespaces.size === 0
  ) {
    return false;
  }

  // Check if all namespaces are enabled
  if (enabledNamespaces.has('*')) {
    return true;
  }

  // Check exact match
  const fullNamespace = `smart-input:${namespace}`;
  if (enabledNamespaces.has(fullNamespace)) {
    return true;
  }

  // Check wildcard patterns
  for (const pattern of enabledNamespaces) {
    if (pattern.endsWith(':*')) {
      const prefix = pattern.slice(0, -2);
      if (fullNamespace.startsWith(prefix)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Format log message with timestamp and namespace
 */
function formatMessage(
  namespace: string,
  level: string,
  message: string,
): string {
  const parts: string[] = [];

  if (globalConfig.timestamps) {
    const timestamp = new Date().toISOString();
    parts.push(`[${timestamp}]`);
  }

  parts.push(`[${level.toUpperCase()}]`);
  parts.push(`[smart-input:${namespace}]`);
  parts.push(message);

  return parts.join(' ');
}

/**
 * Create a logger for a specific namespace
 *
 * @param namespace - Namespace for the logger (e.g., 'editor:state', 'typeahead')
 * @returns Logger instance
 */
export function createLogger(namespace: string): Logger {
  const log = (message: string, ...args: unknown[]): void => {
    if (!isNamespaceEnabled(namespace) || globalConfig.level > LogLevel.DEBUG)
      return;
    const formatted = formatMessage(namespace, 'debug', message);
    globalConfig.output?.log(formatted, ...args);
  };

  log.info = (message: string, ...args: unknown[]): void => {
    if (!isNamespaceEnabled(namespace) || globalConfig.level > LogLevel.INFO)
      return;
    const formatted = formatMessage(namespace, 'info', message);
    globalConfig.output?.info(formatted, ...args);
  };

  log.warn = (message: string, ...args: unknown[]): void => {
    if (!isNamespaceEnabled(namespace) || globalConfig.level > LogLevel.WARN)
      return;
    const formatted = formatMessage(namespace, 'warn', message);
    globalConfig.output?.warn(formatted, ...args);
  };

  log.error = (message: string, ...args: unknown[]): void => {
    if (!isNamespaceEnabled(namespace) || globalConfig.level > LogLevel.ERROR)
      return;
    const formatted = formatMessage(namespace, 'error', message);
    globalConfig.output?.error(formatted, ...args);
  };

  // Make enabled a getter so it's always up-to-date
  Object.defineProperty(log, 'enabled', {
    get() {
      return isNamespaceEnabled(namespace);
    },
    enumerable: true,
    configurable: true,
  });

  log.namespace = namespace;

  return log as Logger;
}

/**
 * Enable debugging for specific namespaces
 *
 * @param namespaces - Namespace pattern(s) to enable (e.g., '*', 'editor:*', 'typeahead')
 *
 * @example
 * ```ts
 * // Enable all namespaces
 * enableDebug('*');
 *
 * // Enable specific namespace
 * enableDebug('editor:state');
 *
 * // Enable all editor namespaces
 * enableDebug('editor:*');
 *
 * // Enable multiple namespaces
 * enableDebug('editor:*,typeahead');
 * ```
 */
export function enableDebug(namespaces: string): void {
  parseDebugString(`smart-input:${namespaces}`);

  // Save to localStorage if available
  if (hasLocalStorage()) {
    const currentDebug = localStorage.getItem('debug') || '';
    const newDebug = currentDebug
      ? `${currentDebug},smart-input:${namespaces}`
      : `smart-input:${namespaces}`;
    localStorage.setItem('debug', newDebug);
  }
}

/**
 * Disable all debugging
 */
export function disableDebug(): void {
  enabledNamespaces.clear();

  if (hasLocalStorage()) {
    localStorage.removeItem('debug');
  }
}

/**
 * Configure global logger settings
 *
 * @param config - Partial configuration to update
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get current logger configuration
 */
export function getLoggerConfig(): Readonly<LoggerConfig> {
  return { ...globalConfig };
}

// Load configuration on module import
loadDebugConfig();

/**
 * Development mode warning utility
 * Shows warnings only in development mode
 */
export function devWarn(message: string, ...args: unknown[]): void {
  if (
    typeof process !== 'undefined' &&
    process.env?.['NODE_ENV'] === 'development'
  ) {
    console.warn(`[smart-input] ${message}`, ...args);
  }
}

/**
 * Development mode error utility
 * Shows errors only in development mode
 */
export function devError(message: string, ...args: unknown[]): void {
  if (
    typeof process !== 'undefined' &&
    process.env?.['NODE_ENV'] === 'development'
  ) {
    console.error(`[smart-input] ${message}`, ...args);
  }
}

/**
 * Assert a condition in development mode
 * Throws an error if the condition is false
 */
export function devAssert(
  condition: boolean,
  message: string,
): asserts condition {
  if (
    typeof process !== 'undefined' &&
    process.env?.['NODE_ENV'] === 'development' &&
    !condition
  ) {
    throw new Error(`[smart-input] Assertion failed: ${message}`);
  }
}
