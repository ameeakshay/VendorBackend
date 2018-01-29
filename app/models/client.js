	module.exports = function(sequelize, Sequelize) {
 
    var Client = sequelize.define('client', {
 
        client_id: {
            primaryKey: true,
            type: Sequelize.STRING
        },
 
        client_email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
 
        client_password: {
            type: Sequelize.STRING,
            allowNull: false
        }
 
    });
 
    return Client;
 
}