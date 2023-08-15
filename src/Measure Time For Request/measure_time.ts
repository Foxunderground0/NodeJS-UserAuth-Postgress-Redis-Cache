import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const client = new pg.Client(process.env.ELEPHANT_SQL_URL);

async function measureQueryTime() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        const query = 'SELECT hash FROM users WHERE username = \'Rex\'';

        const startTime = new Date();
        const res = await client.query(query);
        const endTime = new Date();

        const queryTime = endTime.getTime() - startTime.getTime(); // Calculate query execution time in milliseconds

        console.log(`Query completed in ${queryTime} ms`);

        console.log(`Result: ${res.rows[0].hash}`);

        // This code won't be reached
        console.log('All queries completed');
        await client.end();
        console.log('Connection ended');
    } catch (error) {
        console.error('Error:', error);
    }
}

measureQueryTime();
