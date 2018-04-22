    

var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var randomstring = require('randomstring');

var common = require('../common/common.js');
var models = require('../models');
var sequelize = require('sequelize');

var Client = models.client;
var Vendor = models.vendor;

exports.login = function(req, res) {

    var User;

    if (req.body.type == 'client') {
        console.log('client');

        User = Client;
    }
    else if (req.body.type == 'vendor'){
        console.log('vendor');
    
        User = Vendor;
    }

    User.findOne({where: { email: req.body.username }}).then(function(user) {

        if (!user) {

            temp = common.ResponseFormat(401, 'Authentication Failed. User not found!', {});

            res.status(temp.status)
                .json(temp);
        }

        else if (user) {
            
            if (!common.isValidPassword(user.password, req.body.password)) { 

                temp = common.ResponseFormat(401, 'Authentication Failed. Password Incorrect!', []);

                 res.status(temp.status)
                    .json(temp);
            }
            else {
            
                var Verify = models.verification;
                var BusinessDetails = models.business_details;
                var tenderPosting = false;
                var temp = {};

                Verify.findOne({where: {id : user.id}}).then(function(verify) {
                
                    console.log(verify);
                    if (!verify.accountVerified) {

                        temp = common.ResponseFormat(403, 'Please complete the verification before logging in!', verify)

                        return res.status(temp.status)
                                    .json(temp);    
                    }

                    tenderPosting = verify.canPostTender;
                    temp = common.ResponseFormat(200, 'User logged in Successfully', {"token": jwt.sign({ email: user.email, id: user.id, type: req.body.type }, 'ClientVendor')});
                    
                    if (req.body.type == 'client') {
                        temp.data.canPostTender = tenderPosting;
                    }
                });

                BusinessDetails.findById(user.id).then(function(detailsPresent) {

                    if(detailsPresent) {

                        Client.findOne({where: sequelize.and({id : user.id}, sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('HOUR'), sequelize.col('createdAt'), sequelize.fn('UTC_TIMESTAMP')), '>=', 24))}).then(function(created) {

                            if(created && !tenderPosting) {

                                Verify.update({canPostTender : true}, {where: {id: user.id}}).then(function(client) {

                                    if(client) {
                                        temp.data.canPostTender = true;
                                        console.log('You can post tender for ' + user.id);
                                    }
                                    else {
                                        console.log('Tender cannot be posted for ' + user.id);
                                    }
                                });
                            }
                            else {
                                console.log('Duration less than 24 hours');
                            }
                        });

                    }
                    else {
                        console.log('The details are not yet updated.');
                    }

                    console.log(temp.data);
                    return res.status(temp.status)
                                .json(temp);      
                });
            }
        }
    })
};

exports.signup = function(req, res) {

    var User;

    if (req.body.type == 'client') {
        console.log('client');

        User = Client;
    }
    else if (req.body.type == 'vendor'){
        console.log('vendor');
    
        User = Vendor;
    }

    User.findOne({ where: { email: req.body.username }}).then(function(user) {

        if (user)
        {

            temp = common.ResponseFormat(409, 'User already exists', {});

            res.status(temp.status)
                .json(temp);
        } 
        else {

            var userPassword = common.generateHash(req.body.password);
            const random_id = crypto.randomBytes(16).toString('hex');
            console.log(random_id);

            var data = {
                id: random_id, 
                email: req.body.username,
                password: userPassword,
                name: req.body.name,
                phoneNumber: req.body.phoneNumber
            };

            if (req.body.type == 'vendor') {
                data.mainCategoryId = req.body.mainCategoryId
            }

            User.create(data).then(function(newUser) {
                
                if (!newUser) {

                    temp = common.ResponseFormat(200, 'Unable to create the User', []);
                }

                if (newUser) {

                    temp = common.ResponseFormat(200, 'User created Successfully', newUser);

                    var permalink_local = req.body.username.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();

                    var token = randomstring.generate({
                        length: 64
                    });

                    var link_data = {
                        id : newUser.id,
                        verify_token : token,
                        permalink : permalink_local,
                        accountVerified : false
                    }
                    console.log(permalink_local +token);

                    var link = "http://" + req.headers.host + "/verification/" + permalink_local + "/" + token + "/" + newUser.id;

                    var Verification = models.verification;
                    temp.status = 200;

                    Verification.create(link_data).then(function(client) {

                        if (!client) {
                            console.log("error");
                            temp.message = 'error with verification process';
                            temp.data = null;

                            return res.status(temp.status).json(temp);
                        }

                        temp.message = 'Successful Signup and link generated';
                        temp.data = newUser;
                        console.log(temp.message);
                    });

                    var mailOptions = {
                        to: newUser.email,
                        subject: 'Verification link',
                        user: {
                            login_link: link
                        },
                        attachments: [{   // file on disk as an attachment
                            filePath: "../../data/TnC.pdf" // stream this file
                        }]
                    }
                    if (req.body.type == 'client')
                    {
                        req.app.mailer.send('email', mailOptions, function (err, message) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log("mail sent");
                            temp.data = {"id": newUser.id, "email":newUser.email, "type": req.body.type};
                            return res.status(temp.status).json(temp);  
                        });
                    }
                    else
                    {
                        temp.message = 'Signup successfull, contact the admin for verification';
                        temp.data = {"id": newUser.id, "email":newUser.email, "type": req.body.type};
                        return res.status(temp.status).json(temp);
                    }
                    
                }
                
            });
        }
    }); 
};

exports.verify = function(req, res) {

    var Verification = models.verification;

    Verification.update({accountVerified : true}, {where :{id : req.params.id, $and:[
        {permalink : req.params.link}, 
        {verify_token : req.params.token},
        {accountVerified : false}
        ]}}).then(function(client) {

        if(!client) {

            temp = common.ResponseFormat(500, 'Verification Failed!', {});

            return res.status(temp.status)
                        .json(temp);
        }

        temp = common.ResponseFormat(200, 'The email for client ' + req.params.id + ' is verified!', client);

        return res.status(temp.status)
                    .json(temp);
    });
};
