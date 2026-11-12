
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home.jsx";
import Postpage from "./pages/Postpage.jsx";



const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        
        children: [
            { index: true, element: <Home /> },
            { path: "postpage", element: <Postpage /> }
        ]
    }
]);

export default router;
