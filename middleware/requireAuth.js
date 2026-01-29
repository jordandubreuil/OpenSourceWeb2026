module.exports = function requireAuth(req,res,next){
    
    if(req.isAuthenticated && req.isAuthenticated()) {
        console.log("Working");
        return next()
    };
    return res.redirect("/login");
}