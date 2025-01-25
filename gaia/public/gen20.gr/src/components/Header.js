import Timer from './Timer';
import Menu from '../components/Menu';
export default function Header() {
    return (
        <header>
            <Menu/>
            <Timer/>
            <span id="chatbot"></span>
        </header>
    );
}