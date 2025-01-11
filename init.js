const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main()
.then(() => {
    console.log("connection successful");
})
.catch((e) => {
    console.log(e);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/fakewhatsapp");
}

let allChats = [
    {
        from: "neha",
        to: "priya",
        msg: "send me your exam sheets",
        created_at: new Date(),
    },
    {
        from: "rohit",
        to: "mohit",
        msg: "teach me JS callbacks",
        created_at: new Date(),
    },
    {
        from: "sahil",
        to: "saurabh",
        msg: "Valo la on ye",
        created_at: new Date(),
    },
    {
        from: "saurabh",
        to: "sahil",
        msg: "BGMI la on ye",
        created_at: new Date(),
    },
];

Chat.insertMany(allChats);