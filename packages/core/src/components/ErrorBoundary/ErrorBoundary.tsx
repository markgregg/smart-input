import React, { Component, ReactNode, ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.less';

/**
 * Error information displayed when an error occurs
 */
export interface ErrorDetails {
  /** The error that was caught */
  error: Error;
  /** React component stack trace */
  errorInfo: ErrorInfo;
  /** Timestamp when the error occurred */
  timestamp: Date;
}

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional fallback UI to display on error */
  fallback?: (error: ErrorDetails) => ReactNode;
  /** Callback invoked when an error is caught */
  onError?: (error: ErrorDetails) => void;
  /** Optional custom error message */
  errorMessage?: string;
  /** Whether to show detailed error information (default: only in development) */
  showDetails?: boolean;
  /** Whether to allow reset/retry (default: true) */
  allowReset?: boolean;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  timestamp: Date | null;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole application.
 *
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={({ error }) => logErrorToService(error)}
 *   errorMessage="Something went wrong with the editor"
 * >
 *   <SmartInput>
 *     <Editor />
 *   </SmartInput>
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      timestamp: new Date(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorDetails: ErrorDetails = {
      error,
      errorInfo,
      timestamp: new Date(),
    };

    // Log error details to console in development
    if (
      typeof process !== 'undefined' &&
      process.env?.['NODE_ENV'] === 'development'
    ) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(errorDetails);
    }

    // Update state with error info
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, timestamp } = this.state;
    const {
      children,
      fallback,
      errorMessage,
      showDetails = typeof process !== 'undefined' &&
        process.env?.['NODE_ENV'] === 'development',
      allowReset = true,
    } = this.props;

    if (hasError && error && errorInfo && timestamp) {
      const errorDetails: ErrorDetails = { error, errorInfo, timestamp };

      // Use custom fallback if provided
      if (fallback) {
        return fallback(errorDetails);
      }

      // Default error UI
      return (
        <div className={styles['errorBoundary']} role="alert">
          <div className={styles['errorContainer']}>
            <h2 className={styles['errorTitle']}>
              {errorMessage || 'Something went wrong'}
            </h2>

            <p className={styles['errorDescription']}>
              An error occurred while rendering this component. Please try
              refreshing the page or contact support if the problem persists.
            </p>

            {showDetails && (
              <details className={styles['errorDetails']}>
                <summary className={styles['errorSummary']}>
                  Error Details
                </summary>
                <div className={styles['errorContent']}>
                  <div className={styles['errorSection']}>
                    <strong>Error:</strong>
                    <pre className={styles['errorPre']}>{error.toString()}</pre>
                  </div>

                  {error.stack && (
                    <div className={styles['errorSection']}>
                      <strong>Stack Trace:</strong>
                      <pre className={styles['errorPre']}>{error.stack}</pre>
                    </div>
                  )}

                  <div className={styles['errorSection']}>
                    <strong>Component Stack:</strong>
                    <pre className={styles['errorPre']}>
                      {errorInfo.componentStack}
                    </pre>
                  </div>

                  <div className={styles['errorSection']}>
                    <strong>Timestamp:</strong>
                    <pre className={styles['errorPre']}>
                      {timestamp.toISOString()}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {allowReset && (
              <button
                className={styles['errorButton']}
                onClick={this.handleReset}
                type="button"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
