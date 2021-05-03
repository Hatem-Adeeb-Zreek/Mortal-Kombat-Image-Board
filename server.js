// import modules
const express = require("express");
const app = express();
const { getImages, addImage, getAllDetails } = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config.json");

// MULTER
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

// Middlewares
app.use(express.static("public"));
app.use(express.json());

//Routes
// GET images
app.get("/images", (req, res) => {
    getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in GET /images getImages()", err);
        });
});

// GET details about specific image
app.get("/getall/:imageId", (req, res) => {
    const { imageId } = req.params;
    getAllDetails(imageId)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in GET /getall/:imageId getAllDetails()", err);
        });
});

// upload an image
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

//add a comment to the specific image
// app.post("/addcomment", (req, res) => {
//     const { comment, username, imageId } = req.body;
//     addComment(comment, username, imageId).then(({ rows }) => {
//         res.json({
//             success: true,
//             rows,
//         });
//     });
// });

// listening to port 8080
app.listen(8080, () => {
    console.log("listen to port 8080");
});
