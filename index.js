// Imports
const pg = require("pg");
const express = require("express");
const app = express();
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_icecream"
);

// Middleware
app.use(express.json());

app.use(require("morgan")("dev"));

// Routes
// GET all flavors
app.get("/api/icecream", async (req, res, next) => {
  try {
    const SQL = `
    SELECT * FROM icecream;
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});
// GET single flavor
app.get("/api/icecream/:id", async (req, res, next) => {
  try {
    const SQL = `
    SELECT * FROM icecream
    WHERE id=$1;
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
// CREATE a flavor
app.post("/api/icecream", async (req, res, next) => {
  try {
    const SQL = `
    INSERT INTO icecream(flavor)
    VALUES($1)
    RETURNING *;
    `;
    const response = await client.query(SQL, [req.body.flavor]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
// UPDATE a flavor
app.put("/api/icecream/:id", async (req, res, next) => {
  try {
    const SQL = `
    UPDATE icecream
    SET flavor=$1, is_favorite=$2, updated_at=now()
    WHERE id=$3 RETURNING *;
    `;
    const response = await client.query(SQL, [
      req.body.flavor,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
// DELETE a flavor
app.delete("/api/icecream/:id", async (req, res, next) => {
  try {
    const SQL = `
    DELETE FROM icecream
    WHERE id=$1;
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// Initialization
const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = `
  DROP TABLE IF EXISTS icecream;
  CREATE TABLE icecream(
  id SERIAL PRIMARY KEY,
  flavor VARCHAR(255) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
  );
  `;
  await client.query(SQL);
  console.log("tables created");
  SQL = `
  INSERT INTO icecream(flavor, is_favorite) VALUES('Vanilla', false);
  INSERT INTO icecream(flavor, is_favorite) VALUES('Chocolate', false);
  INSERT INTO icecream(flavor, is_favorite) VALUES('Strawberry', false);
  INSERT INTO icecream(flavor, is_favorite) VALUES('Pistachio', true);
  INSERT INTO icecream(flavor, is_favorite) VALUES('Rocky Road', false);
  `;
  await client.query(SQL);
  console.log("data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

init();
