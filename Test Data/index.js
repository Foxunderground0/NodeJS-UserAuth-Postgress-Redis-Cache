var pg = require('pg');
const fs = require('fs');

var conString = ""; // Replace with your actual PostgreSQL connection string
var client = new pg.Client(conString);

fs.readFile('hashes.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  
  var dataArray = data.trim().split('\n').map(line => line.split(' ')); // Split data into lines and then split each line into username and hash
  //console.log(dataArray); // Check if data is parsed correctly
  
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    
    // Iterate through the dataArray and execute INSERT query for each entry
    dataArray.forEach(entry => {
      var username = entry[0];
      var hash = entry[1];
      console.log(username);
      //console.log(hash);
      
      var query = 'INSERT INTO users (username, hash) VALUES ($1, $2)';
      client.query(query, [username, hash], function(err, result) {
        if (err) {
          console.error('error running query', err);
        } else {
          console.log('Inserted:', username, hash);
        }
      });
    });
    
    client.end();
  });
});
