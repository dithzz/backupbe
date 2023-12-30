const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
// const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
// const TwitterStrategy = require('passport-twitter').Strategy;
// const AppleStrategy = require('passport-appleid').Strategy;
// const InstagramStrategy = require('passport-instagram').Strategy;
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: 'GOOGLE_CLIENT_ID',
      clientSecret: 'GOOGLE_CLIENT_SECRET',
      callbackURL: 'http://localhost:3000/v1/auth/login/google/callback',
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

// facebook strategy
passport.use(
  new FacebookStrategy(
    {
      // pull in our app id and secret from our auth.js file
      clientID: 'zcds',
      clientSecret: 'sdfdsf',
      callbackURL: 'http://localhost:3000/v1/auth/login/facebook/callback',
      profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email'],
    }, // facebook will send back the token and profile
    function (token, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

// LinkedIn strategy
// passport.use(
//   new LinkedInStrategy(
//     {
//       clientID: process.env.LINKEDIN_CLIENT_ID,
//       clientSecret: process.env.LINKEDIN_SECRET_ID,
//       callbackURL: 'http://localhost:3000/linkedin/callback',
//       scope: ['r_emailaddress', 'r_liteprofile'],
//     },
//     function (token, tokenSecret, profile, done) {
//       return done(null, profile);
//     }
//   )
// );

// // Twitter Strategy
// passport.use(
//   new TwitterStrategy(
//     {
//       clientID: process.env.TWITTER_CLIENT_ID,
//       clientSecret: process.env.TWITTER_SECRET_ID,
//       callbackURL: 'http://localhost:3000/twitter/callback',
//     },
//     function (token, tokenSecret, profile, cb) {
//       console.log('call');
//       process.nextTick(function () {
//         console.log(profile);
//       });
//     }
//   )
// );

// // Apple Strategy
// passport.use(
//   new AppleStrategy(
//     {
//       clientID: APPLE_SERVICE_ID,
//       callbackURL: 'https://www.example.net/auth/apple/callback',
//       teamId: APPLE_TEAM_ID,
//       keyIdentifier: 'RB1233456',
//       privateKeyPath: path.join(__dirname, './AuthKey_RB1233456.p8'),
//     },
//     function (accessToken, refreshToken, profile, done) {
//       return done(null, profile);
//     }
//   )
// );

// passport.use(
//   new InstagramStrategy(
//     {
//       clientID: INSTAGRAM_CLIENT_ID,
//       clientSecret: INSTAGRAM_CLIENT_SECRET,
//       callbackURL: 'http://127.0.0.1:3000/auth/instagram/callback',
//     },
//     function (accessToken, refreshToken, profile, done) {
//       return done(null, profile);
//     }
//   )
// );

module.exports = {
  jwtStrategy,
};
