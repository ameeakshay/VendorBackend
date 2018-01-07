var mysql = require('mysql')

exports.connect = function(){
  var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'VendorApp'
})

connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')


      connection.query('SELECT * FROM Vendor', function(err, results) {
        if (err) throw err
        console.log(results[0].varId)
        console.log(results[0].username)
        console.log(results[0].email)
        console.log(results[0].password)
      })
})
}