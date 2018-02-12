
module.exports = function(sequelize, Sequelize) {
 
    var Verification = sequelize.define('verification', {
 
        id: {
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement: true
        },
 
        verify_token : {
            type: Sequelize.STRING,
            allowNull: false
        },
 
        permalink: {
            type: Sequelize.STRING,
            allowNull: false
        },

        emailverified: {
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
 
    return Verification;
 
}