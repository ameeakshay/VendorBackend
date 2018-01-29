	module.exports = function(sequelize, Sequelize) {
 
    var Vendor = sequelize.define('vendor', {
 
        vendor_id: {
            primaryKey: true,
            type: Sequelize.STRING
        },
 
        vendor_email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
 
        vendor_password: {
            type: Sequelize.STRING,
            allowNull: false
        }
 
    });
 
    return Vendor;
 
}