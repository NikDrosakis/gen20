
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Archive from "./pages/Archive.jsx";
import Freepost from "./pages/Freepost.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Onecolumn from "./pages/Onecolumn.jsx";
import PostL from "./pages/PostL.jsx";
import PostR from "./pages/PostR.jsx";
import Signup from "./pages/Signup.jsx";
import Threecolumn from "./pages/Threecolumn.jsx";
import Twocolumn1 from "./pages/Twocolumn1.jsx";
import Twocolumn2 from "./pages/Twocolumn2.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

const ErrorElement = () => <ErrorBoundary><div /></ErrorBoundary>;

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorElement />,
        children: [
            { index: true, element: <Home /> },
            { path: "archive", element: <Archive /> },
            { path: "freepost", element: <Freepost /> },
            { path: "login", element: <Login /> },
            { path: "notfound", element: <NotFound /> },
            { path: "onecolumn", element: <Onecolumn /> },
            { path: "postl", element: <PostL /> },
            { path: "postr", element: <PostR /> },
            { path: "signup", element: <Signup /> },
            { path: "threecolumn", element: <Threecolumn /> },
            { path: "twocolumn1", element: <Twocolumn1 /> },
            { path: "twocolumn2", element: <Twocolumn2 /> }
        ]
    }
]);

export default router;
