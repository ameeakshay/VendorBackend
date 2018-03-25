
var common = require('../common/common.js');
var models = require('../models');
var Sequelize = require('sequelize');

const Op = Sequelize.Op;
var Bid = models.bid;
var Tender = models.tender;
var SubCategory = models.sub_category;

exports.add_tender = function(req, res) {

    if (req.body.duration && req.body.quantity && req.body.subCategoryId) {

        console.log("Client:  " + req.user.id + " is posting a Tender. " + "Duration: " + req.body.duration + " Quantity: " + req.body.quantity + " SubCategory: " + req.body.subCategoryId);

        var tenderData = {
            tenderEnds: req.body.duration,
            quantity: req.body.quantity,
            clientId: req.user.id,
            subCategoryId: req.body.subCategoryId
        };

        Tender.create(tenderData).then(function(newTender) {


            temp = common.ResponseFormat(201, '', []);

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
        temp = common.ResponseFormat(422, 'Missing Parameters!', req.body);
        res.status(temp.status)
            .json(temp);
    }
};

exports.get_potential_tenders = function(req, res) {

    var mainCategoryIds = req.query.mainCategoryId;
    var bidsByVendor = new Set();

    if (!Array.isArray(req.query.mainCategoryId)){
        mainCategoryIds = Array.from(req.query.mainCategoryId);
    }   

    Bid.findAll({where: {vendorId: req.user.id}, attributes: ['tenderId']}).then(function(bids) {
        if (bids.length) {
            bids.forEach(bid => bidsByVendor.add(bid.tenderId));
        }

        Tender.findAll({
            include: [{
                model: models.sub_category,
                where: {mainCategoryId: {in: mainCategoryIds}}
            }], where: {id: {
                [Op.notIn]: Array.from(bidsByVendor)
            }}
        }).then(function(tenders) {
            
            temp = common.ResponseFormat(200, '', []);            
            
            if (tenders.length) {
                temp.message = 'Tenders associated with the requested Main Categories';
                temp.data = tenders;
            }
            else {
                temp.message = 'No tenders for the requested Main Categories';
            }

            res.status(temp.status)
                .json(temp);
        });
    })
};

exports.get_client_tenders = function(req, res) {

    Tender.findAll({where: {clientId: req.user.id}}).then(function(clientTenders) {

        temp = common.ResponseFormat(200, '', []);

        if (clientTenders.length) {
            temp.message = 'Retreived all Tenders for Client ' + req.user.id;
            temp.data = clientTenders;
        }
        else {
            temp.message = 'Unable to find Tenders posted by Client ' + req.user.id;
        }
        
        res.status(temp.status)
            .json(temp);
    })
};

exports.get_all_bids = function(req, res) {

    if (req.params.tenderId) {

        Tender.findById(req.params.tenderId).then(function(tender) {

            if (tender) {

                Bid.findAll({where: {tenderId: req.params.tenderId}, order: ['value'], limit: 3, raw: true}).then(function(bids) {

                    temp = common.ResponseFormat(200, '', []);

                    if (bids.length) {
                        temp.message = 'Top 3 bids for Tender ' + req.params.tenderId;
                        temp.data = bids;
                    }
                    else {                
                        temp.message = 'No bids';
                    }

                    res.status(temp.status)
                        .json(temp);
                });       
            }
            else {
                temp = common.ResponseFormat(200, 'Tender ' +  req.params.tenderId + ' is not present', [])

                res.status(temp.status)
                    .json(temp);
            }
        });

    }
    else {
        temp = common.ResponseFormat(422, 'Tender ID missing', []);

        res.status(temp.status)
            .json(temp);
    }
};

exports.get_tender = function(req, res) {

    if (req.params.tenderId) {

        Tender.findById(req.params.tenderId).then(function(tender) {

            temp = common.ResponseFormat(200, '', {});

            if (tender) {
                temp.message = 'Tender Details';
                temp.data = tender;
            }
            else {
                temp.message = 'Tender ' + req.params.tenderId + ' is not present';
            }

            res.status(temp.status)
                .json(temp);
        });
    }
    else {
        temp = common.ResponseFormat(422, 'Tender ID missing', {});

        res.status(temp.status)
            .json(temp);
    }
};