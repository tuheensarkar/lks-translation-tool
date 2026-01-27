import { query } from './src/database/db.js';

async function check() {
    try {
        const res = await query('SELECT * FROM translation_jobs');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
