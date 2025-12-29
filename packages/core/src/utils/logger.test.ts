import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  enableDebug,
  disableDebug,
  configureLogger,
  LogLevel,
  devWarn,
  devError,
  devAssert,
} from './logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Disable all debugging
    disableDebug();

    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Configure logger to use console and DEBUG level (to ensure it's using the mocked version)
    configureLogger({ output: console, level: LogLevel.DEBUG });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('createLogger', () => {
    it('creates a logger with the correct namespace', () => {
      const log = createLogger('test');
      expect(log.namespace).toBe('test');
    });

    it('logger is disabled by default', () => {
      const log = createLogger('test');
      expect(log.enabled).toBe(false);
    });

    it('does not log when disabled', () => {
      const log = createLogger('test');
      log('Test message');
      log.info('Info message');
      log.warn('Warning message');
      log.error('Error message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('logs when enabled with exact namespace', () => {
      enableDebug('test');
      const log = createLogger('test');

      expect(log.enabled).toBe(true);

      log('Debug message');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('[DEBUG]');
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('[smart-input:test]');
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('Debug message');
    });

    it('logs when enabled with wildcard', () => {
      enableDebug('*');
      const log = createLogger('test:feature');

      expect(log.enabled).toBe(true);

      log('Wildcard message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('logs when enabled with namespace wildcard', () => {
      enableDebug('test:*');
      const log = createLogger('test:feature');

      expect(log.enabled).toBe(true);

      log('Namespace wildcard message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('does not log when namespace does not match', () => {
      enableDebug('other');
      const log = createLogger('test');

      expect(log.enabled).toBe(false);

      log('Should not log');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Log levels', () => {
    it('logs debug messages at DEBUG level', () => {
      configureLogger({ level: LogLevel.DEBUG });
      enableDebug('test');
      const log = createLogger('test');

      log('Debug message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('logs info messages at INFO level', () => {
      configureLogger({ level: LogLevel.INFO });
      enableDebug('test');
      const log = createLogger('test');

      log.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('logs warn messages at WARN level', () => {
      configureLogger({ level: LogLevel.WARN });
      enableDebug('test');
      const log = createLogger('test');

      log.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('logs error messages at ERROR level', () => {
      configureLogger({ level: LogLevel.ERROR });
      enableDebug('test');
      const log = createLogger('test');

      log.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('does not log below configured level', () => {
      configureLogger({ level: LogLevel.WARN });
      enableDebug('test');
      const log = createLogger('test');

      log('Debug message');
      log.info('Info message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      log.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('configureLogger', () => {
    it('updates logger configuration', () => {
      configureLogger({
        level: LogLevel.ERROR,
        timestamps: false,
      });

      enableDebug('test');
      const log = createLogger('test');

      log('Should not log');
      log.info('Should not log');
      log.warn('Should not log');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      log.error('Should log');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('enableDebug / disableDebug', () => {
    it('enables debugging for specified namespaces', () => {
      enableDebug('test');
      const log = createLogger('test');

      expect(log.enabled).toBe(true);
    });

    it('disables all debugging', () => {
      enableDebug('test');
      const log1 = createLogger('test');
      expect(log1.enabled).toBe(true);

      disableDebug();
      const log2 = createLogger('test');
      expect(log2.enabled).toBe(false);
    });
  });

  describe('devWarn', () => {
    it('warns in development mode', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      devWarn('Development warning');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[smart-input] Development warning',
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('does not warn in production mode', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';

      devWarn('Production warning');

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      process.env['NODE_ENV'] = originalEnv;
    });
  });

  describe('devError', () => {
    it('logs errors in development mode', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      devError('Development error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[smart-input] Development error',
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('does not log errors in production mode', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';

      devError('Production error');

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      process.env['NODE_ENV'] = originalEnv;
    });
  });

  describe('devAssert', () => {
    it('does not throw when condition is true', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      expect(() => {
        devAssert(true, 'Should not throw');
      }).not.toThrow();

      process.env['NODE_ENV'] = originalEnv;
    });

    it('throws when condition is false in development', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      expect(() => {
        devAssert(false, 'Condition failed');
      }).toThrow('[smart-input] Assertion failed: Condition failed');

      process.env['NODE_ENV'] = originalEnv;
    });

    it('does not throw in production even when condition is false', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';

      expect(() => {
        devAssert(false, 'Should not throw in production');
      }).not.toThrow();

      process.env['NODE_ENV'] = originalEnv;
    });
  });
});
