
module.exports = function(sequelize, Sequelize) {
 
    var Bank_Details = sequelize.define('bank_details', {
 
        id: {
            primaryKey: true,
            type: Sequelize.STRING
        },
 
        bankName: {
            type: Sequelize.STRING,
            allowNull: false
        },
 
        ifscCode: {
            type: Sequelize.STRING,
            allowNull: false
        },

        bankBranch: {
            type: Sequelize.STRING,
            allowNull: false
        },

        address: {
            type: Sequelize.STRING,
            allowNull: false
        }
 
    });
 
    return Bank_Details;
 
}