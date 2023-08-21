import pg from 'pg';
import dotenv from 'dotenv';
import express from "express";
import redis from 'ioredis';

const app = express();
const port: number = parseInt(process.env.EXPRESS_PORT || "8081", 10);

dotenv.config({ path: '.env' });

const client = new pg.Client(process.env.ELEPHANT_SQL_URL);

// Redis configuration
const redisClient = new redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

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
        var startTime = new Date();
        const cachedResult = await getFromCache(username);
        var endTime = new Date();
        var queryTime = endTime.getTime() - startTime.getTime(); // Calculate query execution time in milliseconds

        if (cachedResult !== null) {
            console.log(`Cache hit for ${username}`);
        } else {
            const query = `SELECT hash FROM users WHERE username = '${username}'`;

            startTime = new Date();
            const res = await client.query(query);
            endTime = new Date();
            queryTime = endTime.getTime() - startTime.getTime(); // Calculate query execution time in milliseconds

            if (res.rowCount == 0) {
                console.error("Not a valid user");
                return -1;
            }

            console.log(`Result: ${res.rows[0].hash}`);
            addToCache(username, res.rows[0].hash);
        }

        console.log(`Query completed in ${queryTime} ms`);
        return queryTime;
    } catch (error) {
        console.error('Error:', error);
    }
    return -1;
}

async function getFromCache(username: string): Promise<number | null> {
    const cachedResult = await redisClient.get(username);
    return cachedResult !== null ? parseInt(cachedResult) : null;
}

async function addToCache(username: string, queryTime: number): Promise<void> {
    //redisClient.setex(username, 6000, queryTime.toString()); // Cache for 60 seconds
    await redisClient.set(username, queryTime.toString()); // No expiration
}

app.get('/:username', async (req, res) => {
    const username = req.params.username;
    if (username == "favicon.ico") {
        res.sendStatus(200);
    }

    const time = await measureQueryTime(username);

    if (time < 0) {
        res.send("Not a valid username");
    } else {
        res.send("Heyo " + username + ", query time: " + time + " ms");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});
