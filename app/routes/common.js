

module.exports = function(){

    var common = {};

    common.ResponseFormat = function() {
        this.status = '',
        this.message = '',
        this.data = ''
    };

    common.generateHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
    };

    common.isValidPassword = function(userpass, password) {
        return bCrypt.compareSync(password, userpass);
    };


    // route middleware to make sure
    common.isLoggedIn = function(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.user) return next();

        // if they aren't redirect them to the home page
        res.redirect('/');
    }

    return common;
}

