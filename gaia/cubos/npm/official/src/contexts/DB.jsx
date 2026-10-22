// DB.jsx

export default class DB {
    static baseURL = process.env.REACT_APP_HTTP_API;
    static username = 'nikos';
    static password = '130177';
    static lang= localStorage.getItem("lang") || 'el';
    static setLang(lang) {
        return localStorage.getItem("lang") || "el";
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
            from gen_gen20net.post_block as b join gen_gen20net.post as p on b.postid = p.id
            where p.uri='${uri}'
        `;
        if (order) expr += ` order by ${order}`;
        if (limit) expr += ` limit ${limit}`;
        console.log('[SQL]', expr);
        return await this.query(expr, 'fa');
    }

    static async updateBlockContent(id, content, row, lang = 'el') {
        const escaped = content.replace(/'/g, "\\'");
        const expr = `
            update gen_gen20net.post_block 
            set ${row}_${lang} = '${escaped}'
            where id = ${id}
        `;
        console.log(expr);
        return await this.query(expr, 'f');
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


    static async query(where, fun = 'fa') {
        const url = `${this.baseURL}maria/${fun}?expression=${encodeURIComponent(where)}`;
        const headers = {
            Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
        };
        try {
            const res = await fetch(url, { headers });
            const json = await res.json();
            return json.data || json.val || null;
        } catch (err) {
            console.error('[DB ERROR]', err);
            return null;
        }
    }
}
