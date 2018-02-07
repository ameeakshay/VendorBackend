
module.exports = function(sequelize, Sequelize) {
 
    var Main_Category = sequelize.define('main_category', {
 
        id: {
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement: true
        },
 
        name: {
            type: Sequelize.STRING,
        }
    });
 
    return Main_Category;
 
}