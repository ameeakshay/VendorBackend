
module.exports = function(sequelize, Sequelize) {
 
    var Sub_Category = sequelize.define('sub_category', {
 
        id: {
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement: true
        },
 
        name: {
            type: Sequelize.STRING,
        }
    });

    return Sub_Category;
}