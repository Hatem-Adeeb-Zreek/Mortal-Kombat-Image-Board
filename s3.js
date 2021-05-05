// AWS
const aws = require("aws-sdk");
const fs = require("fs");
let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}

// S3
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

//  UPLOAD middleware
exports.upload = (req, res, next) => {
    if (!req.file) {
        console.log("no files to upload...");
        return res.sendStatus(500);
    }

    const { filename, mimetype, size, path } = req.file;

    const promise = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    promise
        .then(() => {
            console.log("amazon upload complete!!!");
            next();
            fs.unlink(path, () => {});
        })
        .catch((err) => {
            console.log("err in s3", err);
            res.sendStatus(404);
        });
};
