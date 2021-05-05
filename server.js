// import modules
const express = require("express");
const app = express();
const {
    getImages,
    addImage,
    getAllDetails,
    addComment,
    getLowestId,
    getMoreImages,
} = require("./db");
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
    let lowestId;
    getLowestId()
        .then(({ rows }) => {
            lowestId = rows[0].id;
        })
        .catch((err) => {
            console.log("error in GET /images getLowestId()", err);
        });
    getImages()
        .then(({ rows }) => {
            res.json({ rows, lowestId });
        })
        .catch((err) => {
            console.log("error in GET /images getImages()", err);
        });
});

// GET details about specific image
app.get("/getall/:imageid", (req, res) => {
    const { imageid } = req.params;
    getAllDetails(imageid)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in GET /getall/:imageid getAllDetails()", err);
        });
});

// upload an image
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    if (req.file) {
        const { username, title, description } = req.body;
        if (title !== "" && username !== "") {
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
            console.log("empty fields in image form!");
        }
    } else {
        res.json({
            success: false,
        });
        console.log("no image selected in image form!");
    }
});

// add a comment to the specific image
app.post("/addcomment", (req, res) => {
    const { comment, username, imageid } = req.body;
    if (comment !== "" && username !== "") {
        addComment(comment, username, imageid).then(({ rows }) => {
            res.json({
                success: true,
                rows,
            });
            console.log("comment added!");
        });
    } else {
        res.json({
            success: false,
        });
        console.log("empty fields in comment form!");
    }
});

// get more images
app.get("/moreimages/:lastid", (req, res) => {
    const { lastid } = req.params;
    getMoreImages(lastid)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in GET /moreimages getMoreImages()", err);
        });
});

// listening to port 8080
app.listen(8080, () => {
    console.log("listen to port 8080");
});
