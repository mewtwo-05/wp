const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./expressError.js");
const { log } = require("console");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

main()
.then((res) => {
    console.log("Connection successfull");
})
.catch((e) => {
    console.log(e);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/fakewhatsapp');
}

//index route
app.get("/chats", async (req,res) => {
    try{
        let chats = await Chat.find();
        console.log(chats)
        res.render("index.ejs", {chats});
    }
    catch(err) {
        next(err);
    }
});

//New route
app.get("/chats/new", (req,res) => {
    // throw new ExpressError(404, "Page not found"); 
    res.render("new.ejs");
});

//Create route
app.post("/chats", asyncWrap(async(req,res,next) => {
    let {from, to, msg} = req.body;
    let newChat = new Chat({
        from: from,
        to: to,
        msg: msg,
        created_at: new Date(),
    });
    await newChat.save();
    res.redirect("/chats");
}));

function asyncWrap(fn) {
    return function(req,res,next) {
        fn(req,res,next).catch((err) => {
            next(err);
        });
    }
}

//New - Show route
app.get("/chats/:id", asyncWrap(async (req,res,next) => {
    let {id} = req.params;
    let chat =  await Chat.findById(id);        
    if(!chat) {
        next(new ExpressError(404, "Chat not found"));
    }
    res.render("edit.ejs", {chat});  
}));

//Edit route 
app.get("/chats/:id/edit", async (req,res) => {
    try{
        let {id} = req.params;
        let chat = await Chat.findById(id);
        res.render("edit.ejs", {chat});
    }
    catch(err) {
        next();
    }
});

//Update route 
app.put("/chats/:id", asyncWrap(async (req,res) => {
    let {id} = req.params;
    let {msg: newMsg} = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(id, {msg: newMsg}, {runValidators: true, new: true});
    console.log(updatedChat);
    res.redirect("/chats");
}));

//Delete route
app.delete("/chats/:id", asyncWrap(async (req,res) => {
    let {id} = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log(deletedChat);
    res.redirect("/chats");
}));

// let chat1 = new Chat({
//     from: "neha",
//     to: "priya",
//     msg: "send me your exam sheets",
//     created_at: new Date(),
// });
// chat1.save()
// .then((res) => {
//     console.log(res);
// })
// .catch((e) => {
//     console.log(e);
// });

app.get("/", (req,res) => {
    res.send("This route is working! Thank you");
});

const handleValidationErr = (err) => {
    console.log("This was a validation error. Please follow rules");
    console.dir(err.message);
    return err;
}

app.use((err,req,res,next) => {
    console.log(err.name);
    if(err.name === "ValidationError"){
        err = handleValidationErr(err);
    }
    next(err);
});

//Error Handling Middleware
app.use((err,req,res,next) => {
    let {status=500, message="Some Error Occured"} = err;
    res.status(status).send(message);
})

app.listen(8080, ()=> {
    console.log("server is listening on port 8080");
});