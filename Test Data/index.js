var pg = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const dbConfig = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: 5432,
	database: 'postgres', // Replace with your actual database name
};

var client = new pg.Client(dbConfig);

const dataArray = [];

try {
	// Read the file synchronously
	const data = fs.readFileSync('Test Data/hashes.txt', 'utf8');

	// Split the data into lines
	const lines = data.trim().split('\n');

	// Initialize the dataArray


	// Iterate through each line and split into username and hash
	for (const line of lines) {
		const [username, hash] = line.split(' ');
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

		for (let i = 0; i < dataArray.length; i++) {
			const username = dataArray[i][0];
			const hash = dataArray[i][1].trim();

			await client.query('INSERT INTO users (username, hash) VALUES ($1, $2)', [username, hash]);
			//console.log('Inserted:', username, " index:", i);
		}
	} catch (error) {
		console.error('Error:', error);
	} finally {
		try {
			await client.end();
			console.log('Connection ended');
		} catch (error) {
			console.error('Error ending connection:', error);
		}
	}
}

insertData();

