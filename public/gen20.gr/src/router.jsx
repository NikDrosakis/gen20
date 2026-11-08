
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Contact from "./Contact.jsx";
import DatasetTable from "./DatasetTable.jsx";
import Home from "./Home.jsx";
import Injector from "./Injector.jsx";
import Land from "./Land.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import ErrorBoundary from "./ErrorBoundary";
import TestComponent from "./TestComponent";

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
