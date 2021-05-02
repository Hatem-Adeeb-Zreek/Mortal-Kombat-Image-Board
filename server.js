// import modules
const express = require("express");
const app = express();
const { getImages, addImage } = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config.json");

/////// MULTER ////////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

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

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    if (req.file) {
        const { username, title, description } = req.body;
        const url = `${s3Url}${req.file.filename}`;
        addImage(url, username, title, description).then(({ rows }) => {
            res.json({
                success: true,
                rows,
            });
        });
    } else {
        res.json({
            success: false,
        });
    }
});

// listening to port 8080
app.listen(8080, () => {
    console.log("listen to port 8080");
});
