import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const dbConfig: pg.ClientConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 5432,
  database: 'postgres', // Replace with your actual database name
};

const client = new pg.Client(process.env.ELEPHANT_SQL_URL);

const dataArray: [string, string][] = [];

try {
  // Read the file synchronously
  const data: string = fs.readFileSync('src/Test Data/hashes.txt', 'utf8');

  // Split the data into lines
  const lines: string[] = data.trim().split('\n');

  // Iterate through each line and split into username and hash
  for (const line of lines) {
    const [username, hash]: string[] = line.split(' ');
    dataArray.push([username, hash]);
  }

  // Now you can access the data as you requested
} catch (err) {
  console.error('Error reading the file:', err);
}

async function insertData() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const insertPromises: Promise<void>[] = dataArray.map(async (data) => {
      const [username, hash] = data;
      // console.log(username);
      await client.query('INSERT INTO users (username, hash) VALUES ($1, $2)', [username, hash]);
    });

    await Promise.all(insertPromises);
    console.log('All queries completed');

    await client.end();
    console.log('Connection ended');
  } catch (error) {
    console.error('Error:', error);
  }
}

insertData();
