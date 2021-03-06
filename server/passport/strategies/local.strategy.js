const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../../models/User");

passport.use(
  new LocalStrategy({ session: false }, async (username, password, done) => {
    try {
      const foundUser = await User.findOne({
        username: username.toLowerCase()
      });
      if (foundUser) {
        foundUser.isPasswordOk(password)
          ? done(null, foundUser)
          : done(null, false, { success: false, message: "Invalid password" });
      } else {
        done(null, false, { success: false, message: "Invalid username" });
      }
    } catch (error) {
      done(error);
    }
  })
);
