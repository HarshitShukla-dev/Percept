// src/scripts/drop-tables.ts
import pool from '../config/db';

async function dropTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query('DROP TABLE IF EXISTS tasks CASCADE');
        await client.query('DROP TABLE IF EXISTS meetings CASCADE');
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        await client.query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');

        await client.query('COMMIT');
        console.log('Tables dropped successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error dropping tables:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

dropTables();