import Cookies from 'js-cookie';
// contexts/Gen.jsx
export default class Gen {
    static baseURL = import.meta.env.VITE_HTTP_API;
    static username = 'nikos';
    static password = '130177';

    // Get or set language from cookie or fallback to 'el'
    static lang() {
        return Cookies.get('lang') || 'el';
    }

    static setLang(lang) {
        this.coo('LANG', lang, 86400 * 365); // 1 year cookie
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

    // Cookie set/get/all
    static coo(name, value, time = null, domain = null) {
        const cookies = document.cookie;
        const hostnameParts = window.location.hostname.split('.');
        // Βασικό domain πχ .gen20.net, αλλά όχι για localhost ή IP
        const baseDomain = hostnameParts.length >= 2
            ? '.' + hostnameParts.slice(-2).join('.')
            : window.location.hostname;

        // Αν δεν δώσουμε όνομα, επιστρέφουμε ΟΛΑ τα cookies σε object
        if (!name) {
            const result = {};
            cookies.split(';').forEach(cookie => {
                const i = cookie.indexOf('=');
                if (i < 0) return;
                const k = cookie.slice(0, i).trim();
                const v = cookie.slice(i + 1);
                result[k] = decodeURIComponent(v);
            });
            return result;
        }

        // GET cookie
        if (value === undefined) {
            const regex = new RegExp('(^|;\\s*)' + encodeURIComponent(name) + '=([^;]*)');
            const result = regex.exec(cookies);
            return result ? decodeURIComponent(result[2]) : false;
        }

        // DELETE cookie (value === null)
        if (value === null) {
            // Διαγραφή με domain, αν δεν είμαστε localhost ή IP
            if (window.location.hostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
                document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${domain || baseDomain}`;
            }
            // Διαγραφή χωρίς domain (για localhost ή fallback)
            document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
            return;
        }

        // SET cookie
        const expires = new Date();
        expires.setTime(expires.getTime() + (time ? time * 1000 : 1000 * 36000 * 1000)); // default 1000 ώρες

        let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;

        // Domain μόνο αν δεν είμαστε localhost ή IP
        if (window.location.hostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
            cookie += `;domain=${domain || baseDomain}`;
        }

        // HTTPS-only flags
        if (window.location.protocol === 'https:') {
            cookie += `;SameSite=None;Secure`;
        }

        document.cookie = cookie;
    }



}
