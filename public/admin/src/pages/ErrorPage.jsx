// ErrorPage.jsx
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();

    let errorMessage = "Something went wrong";
    let errorDetails = "";

    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText || "Page not found";
        errorDetails = error.data?.message || "";
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || "";
    }

    // Μόνο σε development δείχνουμε details
    const showDetails = import.meta.env.DEV;

    return (
        <div className="error-page">
            <div className="error-container">
                <div className="error-icon">🧬</div>
                <h1>Oops! Something went wrong</h1>
                <p>{errorMessage}</p>
                {showDetails && errorDetails && (
                    <pre className="error-details">{errorDetails}</pre>
                )}
                <button onClick={() => window.location.href = "/"}>
                    ← Return to Home
                </button>
                <button onClick={() => window.location.reload()}>
                    ↻ Try Again
                </button>
            </div>
        </div>
    );
}