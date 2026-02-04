
const { timeStamp, error } = require("console");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const methodOverride = require("method-override");
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const gamesRouter = require("./routes/games");
const {engine} = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
//import MongoStore from 'connect-mongo'
//Setup the templating engine
app.engine("hbs", engine({extname:".hbs"}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

if(!MONGO_URI){
    console.error("Missing connection data");
    process.exit(1);
}

//Serves Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

// //setup router
// app.use("/", gamesRouter);

async function connectToMongo() {
    try{
        await mongoose.connect(MONGO_URI);
        console.log("Connected to Database");

    }catch(err){
        console.error("Database connection error: ", err.message);
        process.exit(1);
    }
    
}

//Setup Passport Authentication
app.use(
    session(
        {
            secret:process.env.SESSION_SECRET,
            resave:false,
            saveUninitialized:false,
            store: MongoStore.create(
                {
                    mongoUrl:process.env.MONGO_URI,
                    dbName:"Games"
                }
            ),
            cookie:{httpOnly:true},
        }
    )
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
    res.locals.user = req.user;
    next();
});

require("./auth/passport");

//Sets up authentication router
const authRouter = require("./routes/auth");
app.use("/", authRouter);

//setup router
app.use("/", gamesRouter);



//Basic get route
// app.get("/", (req,res)=>{
//     res.send("Hell yeah the server is running!");
// });

// app.get("/index", (req,res)=>{
//     res.sendFile(path.join(__dirname, "public", "index.html"));
//     console.log("Hit Index");
// });

// app.get("/page2", (req,res)=>{
//     res.sendFile(path.join(__dirname, "public", "secondpage.html"));
//     console.log("Hit Page2");
// });

//Routes for data and data files
//JSON API data route
app.get("/api/data", (req,res)=>{
    res.json({
        message:"Hello from the server",
        timestamp:new Date(),
        items:["Node.js", "Express", "npm"]
    });
});

//Course route
app.get("/api/course",(req,res)=>{
    fs.readFile("data.json", "utf-8", (err,data)=>{
        //If failed
        if(err){
            res.status(500).json({error:"Failed to read data file"});
            return;
        }
        //if success
        res.json(JSON.parse(data));

    });
});

////Routes connected to database
// const videogames = new mongoose.Schema({},{strict:false});
// const Games = new mongoose.model("videogames", videogames);

// app.get("/api/games", async (req,res)=>{
//     const data = await Games.find();
//     console.log(data);
//     res.json(data);
// });

// app.get("/api/games/:game", async(req,res)=>{
//     console.log(req.params.game);
//     const ginfo = req.params.game;
//     const gameInfo = await Games.findOne({game:ginfo}); 
//     console.log(gameInfo);
//     res.json(gameInfo);
// });

connectToMongo().then(()=>{
    //route for runner our server
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    });
});

//Catch all for unauthorized routes
app.use((req,res)=>{
    res.status(404).redirect("/login");
});