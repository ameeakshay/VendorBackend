
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
        },

        emailVerified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          set: function(value) {
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            this.setDataValue('emailVerified', value);
          }
        }
 
    });
 
    return Client;
 
}