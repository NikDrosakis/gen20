import Main from './pages/Main';
import Cookies from 'js-cookie';
Cookies.set('uid', '1');
Cookies.set('grp', '7');

function App() {
  return (
      <>
        <div>
<Main/>
        </div>
      </>
  );
}

export default App;
