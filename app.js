const { timeStamp, error } = require("console");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

//Serves Static files
app.use(express.static(path.join(__dirname, "public")))

//Basic get route
app.get("/", (req,res)=>{
    res.send("Hell yeah the server is running!");
});

app.get("/index", (req,res)=>{
    res.sendFile(path.join(__dirname, "public", "index.html"));
    console.log("Hit Index");
});

app.get("/page2", (req,res)=>{
    res.sendFile(path.join(__dirname, "public", "secondpage.html"));
    console.log("Hit Page2");
});

//Routes for data and data files
//JSON API data route
app.get("/api/data", (req,res)=>{
    res.json({
        message:"Hello from the server",
        timestamp:new Date(),
        items:["Node.js", "Express", "npm"]
    });
});

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

//route for runner our server
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});