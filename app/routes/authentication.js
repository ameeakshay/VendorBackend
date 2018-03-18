
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var randomstring = require('randomstring');


module.exports = function(models, common){

    var authentication = {};

    authentication.Client = models.client;
    authentication.Vendor = models.vendor;

    // process the login form
    authentication.login = function(req, res, next) {

        var temp = common.ResponseFormat();

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
                temp.status = 401;
                temp.message = 'Authentication Failed. User not found!';
                temp.data = null;

                res.status(temp.status)
                    .json(temp);
            }

            else if (user) {
                
                if (!isValidPassword(user.password, req.body.password)) { 
                    temp.status = 401;
                    temp.message = 'Authentication Failed. Password Incorrect!';
                    temp.data = null; 

                     res.status(temp.status)
                        .json(temp);
                }
                else {
                
                        var Verify = models.verification;

                        Verify.findOne({where: {id : user.id}}).then(function(verify) {
                        
                                console.log(verify);
                                if (!verify.accountVerified) {
                                    temp.status = 403;
                                    temp.message = 'You are not verified, please verify your account.';
                                    temp.data = verify; 

                                    return res.status(temp.status).json(temp);    
                                }
                                temp.status = 200;
                                temp.message = 'User logged in Successfully';
                                temp.data = {"token": jwt.sign({ email: user.email, id: user.id, type: req.body.type }, 'ClientVendor')};

                                return res.status(temp.status).json(temp);
                        });
                }
            }
        })
    };

    authentication.signup = function(req, res, next) {

        var temp = common.ResponseFormat();

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
                temp.status = 200;
                temp.message = 'User already exists.';
                temp.data = null;

                res.status(temp.status)
                    .json(temp);
            } 
            else {

                var userPassword = generateHash(req.body.password);
                const random_id = crypto.randomBytes(16).toString('hex');
                console.log(random_id);

                var data = {
                    id: random_id, 
                    email: req.body.username,
                    password: userPassword,
                    name: req.body.name,
                    phoneNumber: req.body.phoneNumber
                };

                User.create(data).then(function(newUser) {
                    
                    if (!newUser) {
                        temp.status = 200;
                        temp.message = 'Unable to create the user.'
                        temp.data = null;
                    }

                    if (newUser) {
                        temp.status = 200;
                        temp.message = 'User created Successfully.'
                        temp.data = newUser;

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

                        var link = "http://localhost:8080/verification/" + permalink_local + "/" + token + "/" + newUser.id;

                        var Verification = models.verification;
                        temp.status = 200;

                        Verification.create(link_data).then(function(client) {

                            if (!client) {
                                console.log("error");
                                temp.message = 'error with verification process';
                                temp.data = null;

                                return res.status(temp.status).json(temp);
                            }

                            //console.log("added to verification");
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
                            app.mailer.send('email', mailOptions, function (err, message) {
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


    authentication.verify = function(req, res) {

        var temp = common.ResponseFormat();

        var Verification = models.verification;

        Verification.update({accountVerified : true}, {where :{id : req.params.id, $and:[
            {permalink : req.params.link}, 
            {verify_token : req.params.token},
            {accountVerified : false}
            ]}}).then(function(client) {

            if(!client) {
                temp.status = 500;
                temp.message = 'verification unsuccessfull';
                temp.data = null;

                return res.status(temp.status)
                    .json(temp);
            }

            temp.status = 200;
            temp.message = 'The email for client ' + req.params.id + ' is verified.';
            temp.data = client;

            return res.status(temp.status).json(temp);
        });
    };

    return authentication;
}
