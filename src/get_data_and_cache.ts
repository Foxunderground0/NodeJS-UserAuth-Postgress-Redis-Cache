import pg from 'pg';
import dotenv from 'dotenv';
import express from "express";

const app = express();
const port: number = parseInt(process.env.EXPRESS_PORT || "8081", 10);

dotenv.config({ path: '.env' });

const client = new pg.Client(process.env.ELEPHANT_SQL_URL);

// Corrected async function definition
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
}

connectToDatabase(); // Call the function to connect to the database

async function measureQueryTime(username: string) {
    try {
        const query = `SELECT hash FROM users WHERE username = '${username}'`;

        const startTime = new Date();
        const res = await client.query(query);
        const endTime = new Date();

        const queryTime = endTime.getTime() - startTime.getTime(); // Calculate query execution time in milliseconds

        console.log(`Query completed in ${queryTime} ms`);

        console.log(`Result: ${res.rows[0].hash}`);
        return queryTime;
    } catch (error) {
        console.error('Error:', error);
    }
}

app.get('/:username', async (req, res) => {
    const username = req.params.username;
    const time = await measureQueryTime(username);
    res.send("Heyo " + username + ", query time: " + time + " ms");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});
