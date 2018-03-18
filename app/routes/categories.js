
module.exports = (models, common) => {

    var categories = {};

    var Client = models.client;
    var Vendor = models.vendor;
    
    //Route to get all the Main Categories
    categories.get_main_categories = function(req, res) {

        var temp = common.ResponseFormat();
        var MainCategory = models.main_category;

        MainCategory.findAll().then(function(mainCategories) {
                
            temp.status = 200;

            if (!mainCategories.length) {
                temp.message = 'No Main Categories Found';
                temp.data = [];    
            }
            else { 
                temp.message = 'All the Main Categories';
                temp.data = mainCategories;   
            }

            res.status(temp.status)
                .json(temp);
        })
    };

    //Route to create a main category...this will only be used by developers and Admin
    categories.add_main_category = function(req, res) {

        var temp = common.ResponseFormat();

        var MainCategory = models.main_category;

            var data = {
                name: req.body.name
            };

            MainCategory.create(data).then(function(mainCategory) {

                if (mainCategory) {
                    temp.status = 201;
                    temp.message = 'Successfully created the categorY';
                    temp.data = mainCategory;
                }
                else {
                    temp.status = 409;
                    temp.message = 'Unable to create the category';
                    temp.data = [];
                }

                res.status(temp.status)
                    .json(temp);
            });
    };

    //Route to get all the Sub Categories associated with a Main Category
    categories.get_sub_categories = function(req, res) {

        var temp = common.ResponseFormat();
        var SubCategory = models.sub_category;

        SubCategory.findAll({where: {mainCategoryId : req.params.id}}).then(function(subCategories) {

            temp.status = 200;
            
            if (!subCategories.length) {
                temp.message = 'No Sub Categories Found';
                temp.data = [];
            }
            else {
                temp.message = 'Sub categories corresponding to Main Category #' + req.params.id;
                temp.data = subCategories;   
            }

            res.status(temp.status)
                .json(temp);
        })
    };

    //Route to create sub categories for a main category...for Developers and Admin usage only
    categories.add_sub_category = function(req, res) {

        var temp = common.ResponseFormat();
        var SubCategory = models.sub_category;

        var data = {
                name: req.body.name,
                mainCategoryId: req.body.mainCategoryId
            };

        SubCategory.create(data).then(function(subCategory) {

            if (subCategory) {
                    temp.status = 201;
                    temp.message = 'Successfully created the sub category';
                    temp.data = subCategory;
                }
                else {
                    temp.status = 409;
                    temp.message = 'Unable to create the sub category';
                    temp.data = [];
                }

                res.status(temp.status)
                    .json(temp);
        })
    };

    return categories;
}    