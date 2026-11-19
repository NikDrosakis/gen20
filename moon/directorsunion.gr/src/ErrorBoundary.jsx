// //ErrorBoundary.jsx
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
                <div className="container text-center" style={{ padding: "4rem 2rem" }}>
                    <h1>Κάτι δεν πήγε καλά</h1>
                    <p>Ανανέωσε τη σελίδα, αν δεν επανέλθει, ενημέρωσε τον αρμόδιο.</p>
                    <button onClick={() => window.location.reload()}>Refresh Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;