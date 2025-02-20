import pool from '../config/db';

async function initializeDatabase() {
    try {
        // Begin transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Create users table
            await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
            console.log('Users table created');

            // Create meetings table
            await client.query(`
        CREATE TABLE IF NOT EXISTS meetings (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          title VARCHAR(255),
          transcript TEXT,
          summary TEXT,
          meeting_date TIMESTAMP WITH TIME ZONE,
          participants TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
            console.log('Meetings table created');

            // Create tasks table
            await client.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          meeting_id INTEGER REFERENCES meetings(id),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          deadline TIMESTAMP WITH TIME ZONE,
          status VARCHAR(50) DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
            console.log('Tasks table created');

            // Create updated_at trigger function
            await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

            // Create triggers
            await client.query(`
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);

            await client.query(`
        DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
        CREATE TRIGGER update_meetings_updated_at
          BEFORE UPDATE ON meetings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);

            await client.query(`
        DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
        CREATE TRIGGER update_tasks_updated_at
          BEFORE UPDATE ON tasks
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);

            await client.query('COMMIT');
            console.log('Database initialized successfully');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await pool.end();
    }
}

// Run the initialization
initializeDatabase();