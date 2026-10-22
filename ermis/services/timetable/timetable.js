    const mariadb = require('mariadb');

module.exports = function(params, config) {
    console.log(params)
    let action = params.type;
    let sql = '';
    let pms = [];

    // Create a pool of database connections
    const pool = mariadb.createPool({
        host: '127.0.0.1',
        user: 'root',
        password: 'n130177!',
        database: "gen_admin",
        connectionLimit: 10,
        waitForConnections: true,
        multipleStatements: true,
        queueLimit: 0
    });

    const call = async function() {
        let conn;
        try {
            conn = await pool.getConnection();

            if (action === 'get') {
                sql = 'SELECT * FROM tasks; SELECT * from links;';
                const result = await conn.query(sql);

                // Process the results of multiple queries
                const tasks = result[0]; // First query result (tasks)
                const links = result[1]; // Second query result (links)

                return {
                    data: tasks.map(task => ({
                        id: task.id,
                        text: task.text,
                        start_date: formatDate(task.start_date),
                        end_date: formatDate(task.end_date),
                        duration: task.duration,
                        progress: task.progress || 0,
                        parent: task.parent || null
                    })),
                    links: links.map(link => ({
                        id: link.id,
                        source: link.source,
                        target: link.target,
                        type: link.type
                    }))
                };
            } else if (action === 'post') {
                const { text, start_date, end_date, progress, duration, parent } = params.body;
                const systems_name = text.split('_')[0];
                const cubos_name = text.split('_')[1];

                // Get or Insert system ID
                let systems_id = await conn.query(
                    'SELECT id FROM systems WHERE name = ?',
                    [systems_name]
                );
                if (systems_id.length === 0) {
                    const insertSystem = await conn.query(
                        'INSERT INTO systems (name) VALUES (?)',
                        [systems_name]
                    );
                    systems_id = insertSystem.insertId;
                } else {
                    systems_id = systems_id[0].id;
                }

                // Get or Insert cubos ID
                let cubosid = await conn.query(
                    'SELECT id FROM cubos WHERE name = ?',
                    [cubos_name]
                );
                if (cubosid.length === 0) {
                    const insertCubos = await conn.query(
                        'INSERT INTO cubos (name) VALUES (?)',
                        [cubos_name]
                    );
                    cubosid = insertCubos.insertId;
                } else {
                    cubosid = cubosid[0].id;
                }

                // Insert into tasks
                sql = `INSERT INTO tasks (systems_id, cubosid, text, start_date, end_date, progress, parent, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                pms = [systems_id, cubosid, text, start_date, end_date, progress, parent, duration];
                await conn.query(sql, pms);

                return { success: true };
            } else if (action === 'put') {
                const { text, start_date, end_date, progress, duration } = params.body;
                const { id } = params;
                sql = 'UPDATE tasks SET text = ?, start_date = ?, end_date = ?, progress = ?, duration = ?  WHERE id = ?';
                pms = [text, start_date, end_date, progress, duration, id];
                await conn.query(sql, pms);
                return { success: true };
            } else if (action === 'delete') {
                const { id } = params;
                sql = 'DELETE FROM tasks WHERE id = ?';
                pms = [id];
                await conn.query(sql, pms);
                return { success: true };
            } else {
                throw new Error('Invalid action type');
            }

        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    };

    // Helper function to format date
    function formatDate(date) {
        if (!date) return null;
        let d = new Date(date);
        return d.toISOString().slice(0, 19).replace('T', ' ');
    }

    return {
        [action]: function(callback) {
            call().then(result => callback(result)).catch(err => callback(err));
        }
    };
};
