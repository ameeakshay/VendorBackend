
module.exports = function(sequelize, Sequelize) {
 
    var Verification = sequelize.define('verification', {
 
        id: {
            primaryKey: true,
            type: Sequelize.STRING
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
          allowNull: true,
          set: function(value) {
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            this.setDataValue('emailVerified', value);
          }
        }
 
    });
 
    return Verification;
 
}