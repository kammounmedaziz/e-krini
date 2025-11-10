import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.socialProvider = 'google';
          user.profilePicture = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 5),
          email: profile.emails[0].value,
          googleId: profile.id,
          socialProvider: 'google',
          profilePicture: profile.photos[0].value,
          role: 'client',
          kycStatus: 'approved', // Social login users are pre-verified
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;