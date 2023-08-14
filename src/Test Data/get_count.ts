import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const client = new pg.Client(process.env.ELEPHANT_SQL_URL);

async function insertData() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    while(1){
        const res = await client.query('SELECT COUNT(*) FROM users');
        console.log(res.rows[0].count);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Use Promise with setTimeout
    }

    console.log('All queries completed');
    await client.end();
    console.log('Connection ended');
  } catch (error) {
    console.error('Error:', error);
  }
}

insertData();