// DB.jsx

import Cookies from 'js-cookie';

export default class DB {
    static baseURL =  import.meta.env.VITE_HTTP_API;
    static username = 'nikos';
    static password = '130177';
    static lang= Cookies.get('lang') || 'el';
    static setLang(lang) {
        return Cookies.get('lang') || "el";
    }

    static async maria(method, sql) {
        const url = `${this.baseURL}maria/${method}?sql=${encodeURIComponent(sql)}`;
        const headers = {
            Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
        };

        try {
            const res = await fetch(url, { headers });
            const json = await res.json();
            return json.data || json.val || null;
        } catch (err) {
            console.error('[DB MARIA ERROR]', err);
            return null;
        }
    }

    static async fetchOne(table, id) {
        const expr = `select * from ${table} where id=${id}`;
        return await this.query(expr, 'f');
    }

    static async fetchPost(uri, order = '', limit = 10) {
        console.log('[FETCH POST]', { uri, lang: this.lang });
        let expr = `
            select p.title, p.description, p.img as postimg, b.title_${this.lang} as title,b.content_${this.lang} as content,
                   b.sort, b.id, b.img
            from gen_poetabookgr.post_block as b join gen_poetabookgr.post as p on b.postid = p.id
            where p.uri='${uri}'
        `;
        if (order) expr += ` order by ${order}`;
        if (limit) expr += ` limit ${limit}`;
        console.log('[SQL]', expr);
        return await this.query(expr, 'fa');
    }

    static async updateBlockContent({ tableName, idField = 'id', id, content, row, lang = 'el' }) {
        // Απλός έλεγχος identifiers για να αποφύγουμε injection
        const identifierRegex = /^[a-zA-Z0-9_\.]+$/;
        if (!identifierRegex.test(tableName) || !identifierRegex.test(idField) ||
            !identifierRegex.test(row) || !identifierRegex.test(lang)) {
            throw new Error('Invalid table, field, or language identifier');
        }

        const field = `${row}_${lang}`;

        const expr = `
        UPDATE ${tableName}
        SET ${field} = '${content}'
        WHERE ${idField} = ${id}
    `;
console.log(expr)
        // Υποθέτουμε ότι η this.query υποστηρίζει prepared statements
        return await this.query(expr, 'q','POST');
    }


    static async insertBlock(table,data) {
        const url = `${this.baseURL}maria/inse`;  // no query string for data
        const headers = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
        };

        const body = JSON.stringify({ table, data });

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body
            });

            const json = await res.json();
            return json.data || json.val || null;
        } catch (err) {
            console.error('[DB ERROR]', err);
            return null;
        }
    }


    static async query(where, fun = 'fa', method = 'GET') {
        const url = `${this.baseURL}maria/${fun}${method === 'GET' ? `?expression=${encodeURIComponent(where)}` : ''}`;

        const headers = {
            Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`),
            'Content-Type': 'application/json',
        };

        const options = {
            method,
            headers,
            ...(method === 'POST' ? { body: JSON.stringify({ expression: where }) } : {}),
        };

        try {
            const res = await fetch(url, options);
            const json = await res.json();
            return json.data || json.val || null;
        } catch (err) {
            console.error('[DB ERROR]', err);
            return null;
        }
    }

}
