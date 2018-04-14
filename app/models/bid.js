
module.exports = function(sequelize, Sequelize) {
 
    var Bid = sequelize.define('bid', {
 
        id: {
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement: true
        },
 
        value: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
 
        position: {
            type: Sequelize.INTEGER,
            allowNull: false
        },

        attemptsRemaining: {
            type: Sequelize.INTEGER,
            defaultValue: 2,
            allowNull: false
        }
    });
 
    return Bid;
 
}