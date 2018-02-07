
module.exports = function(sequelize, Sequelize) {
 
    var Client = sequelize.define('client', {
 
        id: {
            primaryKey: true,
            type: Sequelize.STRING
        },
 
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
 
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }
 
    });
 
    return Client;
 
}