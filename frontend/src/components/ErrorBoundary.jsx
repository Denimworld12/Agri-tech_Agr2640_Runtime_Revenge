import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-red-200 p-8">
                        <h1 className="text-2xl font-bold text-red-700 mb-4">
                            Something went wrong
                        </h1>
                        <div className="bg-red-50 p-4 rounded-lg mb-6 overflow-auto max-h-60">
                            <p className="font-mono text-sm text-red-800 break-words">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </div>
                        {this.state.errorInfo && (
                            <details className="mb-6">
                                <summary className="cursor-pointer text-gray-600 font-medium mb-2">
                                    Component Stack
                                </summary>
                                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
