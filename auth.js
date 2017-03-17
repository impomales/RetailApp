function setupAuth(User, app) {
    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;
    
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.
            findOne({_id: id}).
            exec(done);
    });
    
    passport.use(new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.APP_URL + '/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name']
        },
        function(accessToken, refreshToken, profile, done) {
            if (!profile.emails || !profile.emails.length) {
                return done('No emails associated with this account!');
            }
            
            User.findOneAndUpdate(
                {'data.oauth': profile.id},
                {
                    $set: {
                        'profile.username': profile.emails[0].value,
                        'profile.picture': 'http://graph.facebook.com/' + profile.id.toString() + '/picture?type=large'
                    }
                },
                {'new': true, upsert: true, runValidators: true},
                function(err, user) {
                    done(err, user);
                }
            );
    }));
    
    app.use(require('express-session')({
            secret: 'shh...this is a secret',
            resave: false,
            saveUninitialized: true
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.get('/auth/facebook', function(req, res, next) {
        var redirect = encodeURIComponent(req.query.redirect || '/');
        
        passport.authenticate('facebook', {
            scope: ['email'],
            callbackURL: process.env.APP_URL + '/auth/facebook/callback?redirect=' + redirect
        })(req, res, next);
    });
    // redirect appends weird chars.
    app.get('/auth/facebook/callback', function(req, res, next) {
        var redirect = encodeURIComponent(req.query.redirect || '/');
        var url = process.env.APP_URL + '/auth/facebook/callback?redirect=' + redirect;
        
        passport.authenticate('facebook', {
            callbackURL: url
        })(req, res, next);
    }, function(req, res) {
        res.redirect(req.query.redirect);
    });
}

module.exports = setupAuth;