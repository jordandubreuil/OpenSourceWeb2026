const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");

passport.use(
    new LocalStrategy(async (username, password, done)=>{
        try{
            const user = await User.findOne({username});

            //Check that user is valid
            if(!user)return done(null, false, {message:"Invalid user not found"});

            const ok = await bcrypt.compare(password, user.passwordhash);

            //Check that password is correct
            if(!ok)return done(null, false, {message:"Password does not match"});

            return done(null,user);

        }catch(err){
            return done(err);
        }
    })
);

passport.serializeUser((user, done)=>{
    //store user id in session
    done(null, user.id); 
});

passport.deserializeUser(async (id, done)=>{
    try{
        const user = await User.findById(id).lean();
        done(null, user);
    }catch(err){
        done(err)
    }
});


