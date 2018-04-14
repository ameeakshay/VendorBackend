
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
            },
            unique: true
        },
 
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },

        name: {
            type: Sequelize.STRING,
            allowNull: false
        },

        phoneNumber: {
            type: Sequelize.STRING,
            allowNull: false
        }
 
    });
 
    return Client;
 
}