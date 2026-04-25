import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Oops! Something went wrong.</h1>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            We encountered an unexpected error while loading this page. 
            Our team has been notified.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-green-200 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Reload Page
          </button>
          
          {/* In development, show error details */}
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-12 text-left bg-gray-50 p-6 rounded-2xl border border-gray-200 w-full max-w-4xl overflow-auto">
              <p className="text-red-600 font-mono text-sm font-bold mb-2">
                {this.state.error.toString()}
              </p>
              <pre className="text-gray-500 font-mono text-xs whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
