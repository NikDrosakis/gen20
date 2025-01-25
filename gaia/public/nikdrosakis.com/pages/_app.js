// pages/_app.js
// pages/index.js
import 'vertical-timeline-component-for-react/dist/Timeline.css'; // Import Timeline CSS
import '../styles/App.css'; // Your global styles
import '../styles/globals.css'; // Any additional global styles if applicable
import logo from '../public/logo.svg';  // Adjust path if necessary
import '../styles/App.css';
import '../styles/globals.css'; // Import your global styles
import Main from '../components/Main'; // Adjust the import path as needed
import { AppProvider } from '../components/AppContext'; // Import the AppProvider


function MyApp({ Component, pageProps }) {
    return (
        <AppProvider>
            <Main>
                <Component {...pageProps} />
            </Main>
        </AppProvider>
    );
}

export default MyApp;
