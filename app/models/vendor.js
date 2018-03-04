
module.exports = function(sequelize, Sequelize) {
 
    var Vendor = sequelize.define('vendor', {
 
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
 
    return Vendor;
 
}