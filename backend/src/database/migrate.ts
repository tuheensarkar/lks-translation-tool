import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    console.log('🚀 Starting database migration...');

    try {
        // Check if users table already exists
        const tableExistsResult = await pool.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);

        if (tableExistsResult.rows[0].exists) {
            console.log('✅ Database already initialized, skipping migration...');
            process.exit(0);
        }

        // Read the schema file
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf-8');

        // Hash the default admin password
        const defaultPassword = 'Admin123!';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        // Replace the placeholder with actual hash
        schema = schema.replace('$2b$10$YourHashedPasswordHere', passwordHash);

        // Execute the schema
        await pool.query(schema);

        console.log('✅ Database migration completed successfully!');
        console.log('\n📝 Default admin credentials:');
        console.log('   Email: admin@lks.com');
        console.log('   Password: Admin123!');
        console.log('\n⚠️  Please change the admin password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
