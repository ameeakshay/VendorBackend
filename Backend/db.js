var mysql=require('mysql');

var connection=mysql.createConnection({
 
  host: 'localhost',
  user: 'arihantjain',
  password: 'Killerjoker',
  database: 'ClientVendor'
 
});

connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
});

 module.exports=connection;