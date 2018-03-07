
module.exports = function(sequelize, Sequelize) {
 
    var Business_Details = sequelize.define('business_details', {
 
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
        },

        gstNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },

        accountNumber: {
            type: Sequelize.STRING,
            allowNull: false
        }
 
    });
 
    return Business_Details;
 
}