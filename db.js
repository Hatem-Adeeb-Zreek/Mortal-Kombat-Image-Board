// DB config
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:123456789@localhost:5432/imageboard");

// get all the Images from the imageboard database
exports.getImages = () => {
    return db.query(`SELECT * FROM images`);
};
