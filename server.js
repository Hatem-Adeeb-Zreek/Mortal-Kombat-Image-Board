// import modules
const express = require("express");
const app = express();
const { getImages } = require("./db");

// app.use
app.use(express.static("public"));

//Routes
app.get("/images", (req, res) => {
    getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in GET /images getImages()", err);
        });
});

// listening to port 8080
app.listen(8080, () => {
    console.log("listen to port 8080");
});
