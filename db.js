// DATABASE Config
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:123456789@localhost:5432/imageboard");

// GET Functions

// getImages Function
exports.getImages = () => {
    return db.query(`
    SELECT *, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1
    ) AS "lowestid" 
    FROM images
    ORDER BY id DESC
    LIMIT 5;
    `);
};

// getAllDetails Function
exports.getAllDetails = (imageid) => {
    return db.query(
        `
        SELECT 
        images.id, images.username, images.title, images.description, images.url, images.created_at,
        comments.comment, comments.image_id,
        comments.created_at AS cmnt_time, comments.id AS cmnt_id, comments.username AS cmnt_writer
        FROM images
        LEFT JOIN comments
        ON images.id = comments.image_id
        WHERE images.id = $1
        ORDER BY comments.id DESC;
        `,
        [imageid]
    );
};

// getLowestId Function
exports.getLowestId = () => {
    return db.query(
        `
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1;
        `
    );
};

// getMoreImages Function
exports.getMoreImages = (lastid) => {
    return db.query(
        `
        SELECT url, title, id, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        ) AS "lowestid" 
        FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 5;
        `,
        [lastid]
    );
};

// INSERT Functions

// addImage Function
exports.addImage = (url, username, title, description) => {
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        ) AS "lowestid";
        `,
        [url, username, title, description]
    );
};

// addComment Function
exports.addComment = (comment, username, imageid) => {
    return db.query(
        `
        INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3)
        RETURNING
        id AS cmnt_id, comment, created_at AS cmnt_time, username AS cmnt_writer;
        `,
        [comment, username, imageid]
    );
};
