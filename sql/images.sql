-- create images table
DROP TABLE IF EXISTS images CASCADE;
CREATE TABLE images(
    id          SERIAL PRIMARY KEY,
    url         VARCHAR NOT NULL,
    username    VARCHAR NOT NULL,
    title       VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create comments table
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id          SERIAL PRIMARY KEY,
    comment     TEXT NOT NULL,
    username    VARCHAR NOT NULL,
    image_id    INT NOT NULL REFERENCES images(id),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

