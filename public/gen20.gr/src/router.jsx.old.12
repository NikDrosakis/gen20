
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Contact from "./pages/Contact.jsx";
import DatasetTable from "./pages/DatasetTable.jsx";
import Home from "./pages/Home.jsx";
import Injector from "./pages/Injector.jsx";
import Land from "./pages/Land.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import TestComponent from "./components/TestComponent";

const ErrorElement = () => <ErrorBoundary><div /></ErrorBoundary>;

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorElement />,
        children: [
            { index: true, element: <Home /> },
            { path: "contact", element: <Contact /> },
            { path: "datasettable", element: <DatasetTable /> },
            { path: "injector", element: <Injector /> },
            { path: "login", element: <Login /> },
            { path: "signup", element: <Signup /> },
            { path: "test", element: <TestComponent /> }
        ]
    }
]);

export default router;
