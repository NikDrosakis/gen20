import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./Home.jsx";
import Postpage from "./Postpage.jsx";



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
