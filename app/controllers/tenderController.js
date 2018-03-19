
var common = require('../common/common.js');
var models = require('../models');

exports.add_tender = function(req, res) {

    var temp = new common.ResponseFormat();

    var Tender = models.tender;

    if (req.user.id && req.body.duration && req.body.quantity && req.body.subCategoryId) {

        console.log("Client:  " + req.user.id + " is posting a Tender. " + "Duration: " + req.body.duration + " Quantity: " + req.body.quantity + " SubCategory: " + req.body.subCategoryId);

        var tenderData = {
            tenderEnds: req.body.duration,
            quantity: req.body.quantity,
            clientId: req.user.id,
            subCategoryId: req.body.subCategoryId
        };

        Tender.create(tenderData).then(function(newTender) {

            if (newTender) {
                temp.status = 201;
                temp.message = 'Successfully created the Tender';
                temp.data = newTender;
            }
            else {
                temp.status = 409;
                temp.message = 'Unable to create the Tender';
                temp.data = [];
            }

            res.status(temp.status)
                .json(temp);
        });
    }
    else
    {
        temp.status = 403;
        temp.message = 'Client needs to be logged in to post a Tender';
        temp.data = null;

        res.status(temp.status)
            .json(temp);
    }
};

exports.get_main_category_tenders = function(req, res) {

    var temp = new common.ResponseFormat();

    var Tender = models.tender;
    var SubCategory = models.sub_category;

    var mainCategoryIds = req.query.mainCategoryId;

    if (!Array.isArray(req.query.mainCategoryId)){
        mainCategoryIds = Array.from(req.query.mainCategoryId);
    }   

    Tender.findAll({
        include: [{
            model: models.sub_category,
            where: {mainCategoryId: {in: mainCategoryIds}}
        }]
    }).then(function(tenders) {
        
        temp.status = 200;
            
        if (tenders.length) {
            temp.message = 'Tenders associated with the requested Main Categories';
            temp.data = tenders;
        }
        else {
            temp.message = 'No tenders for the requested Main Categories';
            temp.data = null;
        }

        res.status(temp.status)
            .json(temp);
    });
};

exports.get_client_tenders = function(req, res) {

    var temp = new common.ResponseFormat();

    var Tender = models.tender;

    if (req.user.id) {

        Tender.findAll({where: {clientId: req.user.id}}).then(function(clientTenders) {

            if (clientTenders.length) {
                temp.status = 200;
                temp.message = 'Retreived all Tenders for Client ' + req.user.id;
                temp.data = clientTenders;
            }
            else {
                temp.status = 200;
                temp.message = 'Unable to find Tenders posted by Client ' + req.user.id;
                temp.data = null;
            }
            
            res.status(temp.status)
                .json(temp);
        })
    }
    else
    {
        temp.status = 403;
        temp.message = 'Client needs to be logged in to retrieve all the Tenders';
        temp.data = null;
            
        res.status(temp.status)
            .json(temp);
    }
};