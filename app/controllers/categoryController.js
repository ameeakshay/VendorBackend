
var common = require('../common/common.js');
var models = require('../models');

exports.get_main_categories = function(req, res) {

    var MainCategory = models.main_category;

    MainCategory.findAll().then(function(mainCategories) {
        
        temp = common.ResponseFormat(200, '', {});

        if (!mainCategories.length) {
            temp.message = 'No Main Categories Found';
            temp.data = {};    
        }
        else { 
            temp.message = 'All the Main Categories';
            temp.data = mainCategories;   
        }

        res.status(temp.status)
            .json(temp);
    })
};

exports.add_main_category = function(req, res) {

    var MainCategory = models.main_category;

        var data = {
            name: req.body.name
        };

        MainCategory.create(data).then(function(mainCategory) {

            temp = common.ResponseFormat(201, '', {});
            
            if (mainCategory) {
                temp.message = 'Successfully created the categorY';
                temp.data = mainCategory;
            }
            else {
                temp.status = 409;
                temp.message = 'Unable to create the category';
                temp.data = {};
            }

            res.status(temp.status)
                .json(temp);
        });
};

exports.get_sub_categories = function(req, res) {

    var SubCategory = models.sub_category;

    SubCategory.findAll({where: {mainCategoryId : req.params.id}}).then(function(subCategories) {


        temp = common.ResponseFormat(200, '', {});
        
        if (!subCategories.length) {
            temp.message = 'No Sub Categories Found';
            temp.data = {};
        }
        else {
            temp.message = 'Sub categories corresponding to Main Category #' + req.params.id;
            temp.data = subCategories;   
        }

        res.status(temp.status)
            .json(temp);
    })
};

exports.add_sub_category = function(req, res) {

    var SubCategory = models.sub_category;

    var data = {
            name: req.body.name,
            mainCategoryId: req.body.mainCategoryId
        };

    SubCategory.create(data).then(function(subCategory) {


        temp = common.ResponseFormat(201, '', {});

        if (subCategory) {
                temp.status = 201;
                temp.message = 'Successfully created the sub category';
                temp.data = subCategory;
            }
            else {
                temp.status = 409;
                temp.message = 'Unable to create the sub category';
                temp.data = {};
            }

            res.status(temp.status)
                .json(temp);
    })
};