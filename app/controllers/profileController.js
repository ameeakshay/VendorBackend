
var common = require('../common/common.js');
var models = require('../models');
var sequelize = require('sequelize');

exports.get_basic_details = function(req, res) {

    var User = null;

    if (req.user.type == 'client') {
        User = models.client;
    }
    else if (req.user.type == 'vendor') {
        User = models.vendor;
    }

    if (User != null) {

        User.findById(req.user.id, {attributes: ['name', 'phoneNumber', 'email']}).then(function(user) {


            temp = common.ResponseFormat(200, '', []);

            if (user) {
                temp.message = 'Basic Profile for ' + req.user.email;
                temp.data = user;
            }
            else {
                temp.message = 'Unable to retrieve the Basic Profile for ' + req.user.email;
            }

            res.status(temp.status)
                .json(temp);
        });
    }
};

exports.update_basic_details = function(req, res) {

    var User = null;

    if (req.user.type == 'client') {
        User = models.client;
    }
    else if (req.user.type == 'vendor') {
        User = models.vendor;
    }

    if (User != null) {

        if (req.body.name && req.body.phoneNumber && req.body.email) {

            User.update({name: req.body.name, phoneNumber: req.body.phoneNumber, email: req.body.email}, {where: {id: req.user.id}}).then(function(updatedUser) {
                if (updatedUser){

                    User.findById(req.user.id, {attributes: ['name', 'phoneNumber', 'email']}).then(function(user) {

                        temp = common.ResponseFormat(200, '', []);

                        if (user) {
                            temp.message = 'Basic Profile updated Successfully'
                            temp.data = user;
                        }
                        else {
                            temp.message = 'Unable to find the Updated User'
                        }

                        res.status(temp.status)
                            .json(temp);
                    });
                }
                else {
                    
                    temp = common.ResponseFormat(400, 'Something went wrong with the update.', []);

                    res.status(temp.status)
                        .json(temp);
                }
            })
        }
        else {
            temp.status = 422;
            temp.message = 'Missing Parameters!';
            temp.data = req.body;

            res.status(temp.status)
                .json(temp);
        }
    }
};

exports.get_business_details = function(req, res) {

    var BusinessDetails = models.business_details;

    BusinessDetails.findById(req.user.id).then(function(user) {

        temp = common.ResponseFormat(200, '', []);

        if (user) {
            temp.message = 'Business Profile for ' + req.user.email;
            temp.data = user;
        }
        else {
            temp.message = 'Unable to retrieve the Business Profile for ' + req.user.email;
        }

        res.status(temp.status)
            .json(temp);
    });
};

exports.update_business_details = function(req, res) {

    var BusinessDetails = models.business_details;
    var Verification = models.verification;
    var ClientInfo = models.client;

    if (req.body.bankName && req.body.ifscCode && req.body.bankBranch && req.body.address && req.body.gstNumber && req.body.accountNumber) {

        var tempBusinessDetails = {
            id: req.user.id,
            bankName: req.body.bankName,
            ifscCode: req.body.ifscCode,
            bankBranch: req.body.bankBranch,
            address: req.body.address,
            gstNumber: req.body.gstNumber,
            accountNumber: req.body.accountNumber
        };

        BusinessDetails.upsert(tempBusinessDetails).then(function(created) {
            
            BusinessDetails.findById(req.user.id).then(function(user) {

                temp = common.ResponseFormat(200, '', []);

                if (user) {
                    temp.status = 200;
                    ClientInfo.findOne({where: sequelize.and({id :req.user.id}, sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('HOUR'), sequelize.col('createdAt'), sequelize.fn('NOW')), '>=', 24))}).then(function(created) {

                        if(created) {
                                Verification.update({canPostTender : true}, {where: {id: req.user.id}}).then(function(client) {

                                if(client) {
                                    console.log('You can post tender for ' + req.user.id);
                                }
                                else {
                                    console.log('Tender cannot be posted for ' + req.user.id);
                                }
                            });
                        }
                        else {
                            console.log('Duration greater than 24 hours');
                        }
                    });
                    temp.message = 'Business Profile updated Successfully';
                    temp.data = user;
                    
                }
                else {
                    temp.status = 400;
                    temp.message = 'Unable to find the Updated User'
                    temp.data = null;
                }

                res.status(temp.status)
                    .json(temp);
            });
        });
    }
    else {
            
        temp = common.ResponseFormat(422, 'Missing Parameters!', req.body);

        res.status(temp.status)
            .json(temp);
    }
};