// /components/ErrorBoundary.jsx
import React from "react";
import "./ErrorBoundary.css";

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
            if (this.props.fallback) {
                return this.props.fallback(this.state.error);
            }
            return (
                <div className="container text-center error-boundary">
                    <h1>Something went wrong</h1>
                    <p>Please refresh the page or contact support if the issue persists.</p>
                    <button onClick={() => window.location.reload()}>Refresh Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
