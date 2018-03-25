
module.exports = function(sequelize, Sequelize) {
 
    var Tender = sequelize.define('tender', {
 
        id: {
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement: true
        },
 
        tenderEnds: {
            type: 'TIMESTAMP',
            allowNull: false
        },

        quantity: {
            type: Sequelize.STRING,
            allowNull: false
        },

        status: {
            type: Sequelize.STRING,
            defaultValue: "OnGoing"
        }
 
    });
 
    return Tender;
 
}