// contexts/Gen.jsx
import Cookies from 'js-cookie';
export default class Gen {
    static baseURL = import.meta.env.VITE_HTTP_API;
    static username = 'nikos';
    static password = '130177';

    // Get or set language from cookie or fallback to 'el'
    static lang() {
        return Cookies.get('lang') || 'el';
    }

    static setLang(lang) {
        Cookies.set('lang', lang,{ expires: 10, path: '/' }); // 1 year cookie
        return lang;
    }

    // Centralized fetch to Maria endpoint with auth
    static async maria(method, sql) {
        const url = `${this.baseURL}maria/${method}?sql=${encodeURIComponent(sql)}`;
        const headers = {
            Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
        };

        const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
        return await res.json();
    }

}
