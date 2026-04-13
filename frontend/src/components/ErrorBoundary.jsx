// components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">
            Er is een fout opgetreden
          </h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || "Probeer de pagina te vernieuwen"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Opnieuw proberen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
