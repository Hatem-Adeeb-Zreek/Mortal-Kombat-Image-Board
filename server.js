// import modules
const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config.json");

// Multer Section
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

// Routes

// GET /images Route
app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json({ rows });
        })
        .catch((err) => {
            console.log("error in GET /images getImages()", err);
        });
});

// GET /getall/:imageid Route
app.get("/getall/:imageid", (req, res) => {
    const { imageid } = req.params;
    db.getAllDetails(imageid)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in GET /getall/:imageid getAllDetails()", err);
        });
});

// POST /upload Route
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    if (req.file) {
        const { username, title, description } = req.body;
        if (title !== "" && username !== "") {
            const url = `${s3Url}${req.file.filename}`;
            db.addImage(url, username, title, description).then(({ rows }) => {
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

// POST /addcomment Route
app.post("/addcomment", (req, res) => {
    const { comment, username, imageid } = req.body;
    if (comment !== "" && username !== "") {
        db.addComment(comment, username, imageid).then(({ rows }) => {
            res.json({
                success: true,
                rows,
            });
        });
    } else {
        res.json({
            success: false,
        });
        console.log("empty fields in comment form!");
    }
});

// GET /moreimages/:lastid Route
app.get("/moreimages/:lastid", (req, res) => {
    const { lastid } = req.params;
    db.getMoreImages(lastid)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in GET /moreimages getMoreImages()", err);
        });
});

// PORT Listening
app.listen(process.env.PORT || 8080, () =>
    console.log("Mortal Kombat ImageBoard running")
);
