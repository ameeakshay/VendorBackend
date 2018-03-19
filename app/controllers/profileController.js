
var common = require('../common/common.js');
var models = require('../models');

exports.get_basic_details = function(req, res) {

    var temp = new common.ResponseFormat();

    var User = null;

    if (req.user.type == 'client') {
        User = models.client;
    }
    else if (req.user.type == 'vendor') {
        User = models.vendor;
    }

    if (User != null) {

        User.findById(req.user.id, {attributes: ['name', 'phoneNumber', 'email']}).then(function(user) {

            if (user) {
                temp.status = 200;
                temp.message = 'Basic Profile for ' + req.user.email;
                temp.data = user;
            }
            else {
                temp.status = 200;
                temp.message = 'Unable to retrieve the Basic Profile for ' + req.user.email;
                temp.data = null;
            }

            res.status(temp.status)
                .json(temp);
        });
    }
};

exports.update_basic_details = function(req, res) {

    var temp = new common.ResponseFormat();

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

                        if (user) {
                            temp.status = 200;
                            temp.message = 'Basic Profile updated Successfully'
                            temp.data = user;
                        }
                        else {
                            temp.status = 200;
                            temp.message = 'Unable to find the Updated User'
                            temp.data = null;
                        }

                        res.status(temp.status)
                            .json(temp);
                    });
                }
                else {
                    temp.status = 400;
                    temp.message = 'Something went wrong with the update'
                    temp.data = null;

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

    var temp = new common.ResponseFormat();

    var BusinessDetails = models.business_details;

    BusinessDetails.findById(req.user.id).then(function(user) {

        if (user) {
            temp.status = 200;
            temp.message = 'Business Profile for ' + req.user.email;
            temp.data = user;
        }
        else {
            temp.status = 200;
            temp.message = 'Unable to retrieve the Business Profile for ' + req.user.email
            temp.data = null;
        }

        res.status(temp.status)
            .json(temp);
    });
};

exports.update_business_details = function(req, res) {

    var temp = new common.ResponseFormat();
    var BusinessDetails = models.business_details;

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

                if (user) {
                    temp.status = 200;
                    temp.message = 'Business Profile updated Successfully'
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
        temp.status = 422;
        temp.message = 'Missing Parameters!';
        temp.data = req.body;

        res.status(temp.status)
            .json(temp);
    }
};