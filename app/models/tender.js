
module.exports = function(sequelize, Sequelize) {
 
    var Tender = sequelize.define('tender', {
 
        id: {
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement: true
        },
 
        tenderEnds: {
            type: Sequelize.INTEGER,
            allowNull: false
        },

        quantity: {
            type: Sequelize.STRING,
            allowNull: false
        }
 
    });
 
    return Tender;
 
}