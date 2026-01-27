import { query } from './src/database/db.js';

async function check() {
    try {
        const users = await query('SELECT email, name FROM users');
        console.log('Users:', users.rows);
        const jobs = await query('SELECT * FROM translation_jobs');
        console.log('Jobs:', jobs.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
