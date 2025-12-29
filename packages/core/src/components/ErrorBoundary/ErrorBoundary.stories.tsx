import type { Story } from '@ladle/react';
import { useState } from 'react';
import { ErrorBoundary, ErrorDetails } from '../ErrorBoundary';
import './ErrorBoundary.stories.css';

export default {
  title: 'Core / ErrorBoundary',
};

// Component that throws an error when button is clicked
function ErrorThrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a simulated error!');
  }
  return (
    <div className="error-story-content">
      <p>✅ Everything is working fine!</p>
      <p>Click the button below to trigger an error.</p>
    </div>
  );
}

/**
 * Basic ErrorBoundary with default error UI
 */
export const BasicErrorBoundary: Story = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <div className="error-story-container">
      <h2>Basic Error Boundary</h2>
      <p>Click the button to trigger an error:</p>

      {!shouldThrow && (
        <button
          onClick={() => setShouldThrow(true)}
          className="error-story-button"
        >
          Trigger Error
        </button>
      )}

      <ErrorBoundary>
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
};

/**
 * ErrorBoundary with custom error message
 */
export const CustomMessage: Story = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <div className="error-story-container">
      <h2>Custom Error Message</h2>
      <p>Shows a custom error message when an error occurs:</p>

      {!shouldThrow && (
        <button
          onClick={() => setShouldThrow(true)}
          className="error-story-button"
        >
          Trigger Error
        </button>
      )}

      <ErrorBoundary errorMessage="The editor component failed to load">
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
};

/**
 * ErrorBoundary with error logging callback
 */
export const WithErrorLogging: Story = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  const handleError = (errorDetails: ErrorDetails) => {
    const logMessage = `[${errorDetails.timestamp.toISOString()}] ${
      errorDetails.error.message
    }`;
    setErrorLog((prev) => [...prev, logMessage]);
  };

  return (
    <div className="error-story-container">
      <h2>Error Logging</h2>
      <p>Errors are logged to the console and displayed below:</p>

      {!shouldThrow && (
        <button
          onClick={() => setShouldThrow(true)}
          className="error-story-button"
        >
          Trigger Error
        </button>
      )}

      <ErrorBoundary onError={handleError}>
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>

      {errorLog.length > 0 && (
        <div className="error-story-log">
          <h3>Error Log:</h3>
          {errorLog.map((log, index) => (
            <pre key={index}>{log}</pre>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ErrorBoundary with custom fallback UI
 */
export const CustomFallback: Story = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  const customFallback = (errorDetails: ErrorDetails) => (
    <div className="error-story-custom">
      <div className="error-story-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>We&apos;ve been notified and are working on a fix.</p>
      <details>
        <summary>Technical Details</summary>
        <pre>{errorDetails.error.message}</pre>
      </details>
      <button
        onClick={() => window.location.reload()}
        className="error-story-button"
      >
        Reload Page
      </button>
    </div>
  );

  return (
    <div className="error-story-container">
      <h2>Custom Fallback UI</h2>
      <p>Provides a custom error display:</p>

      {!shouldThrow && (
        <button
          onClick={() => setShouldThrow(true)}
          className="error-story-button"
        >
          Trigger Error
        </button>
      )}

      <ErrorBoundary fallback={customFallback}>
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
};

/**
 * ErrorBoundary without error details
 */
export const HiddenDetails: Story = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <div className="error-story-container">
      <h2>Hidden Error Details</h2>
      <p>Error details are hidden (production mode):</p>

      {!shouldThrow && (
        <button
          onClick={() => setShouldThrow(true)}
          className="error-story-button"
        >
          Trigger Error
        </button>
      )}

      <ErrorBoundary showDetails={false}>
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
};

/**
 * ErrorBoundary with retry/reset functionality
 */
export const WithReset: Story = () => {
  const [key, setKey] = useState(0);
  const [shouldThrow, setShouldThrow] = useState(false);

  const handleReset = () => {
    setShouldThrow(false);
    setKey((k) => k + 1);
  };

  return (
    <div className="error-story-container">
      <h2>Reset Functionality</h2>
      <p>Try again button resets the error state:</p>

      <button
        onClick={() => setShouldThrow(true)}
        className="error-story-button"
      >
        Trigger Error
      </button>

      <ErrorBoundary key={key} allowReset={true}>
        <ErrorThrower shouldThrow={shouldThrow} />
      </ErrorBoundary>

      {shouldThrow && (
        <button
          onClick={handleReset}
          className="error-story-button error-story-reset"
        >
          Reset Component
        </button>
      )}
    </div>
  );
};
