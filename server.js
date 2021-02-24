if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let posts = [
  { username: "miquel", title: "Title 1" },
  { username: "alex", title: "Title 2" },
];

app.get("/posts", authenticateToken, (req, res) => {
  const user = req.user;
  res.json(posts.filter((post) => post.username === user.username));
});

// Middleware. Checks the access token.
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // It comes in format: Bearer TOKEN
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) res.sendStatus(401);

  // Verify the token with the ACCESS_TOKEN_SECRET. Will return an error or the signed object.
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) res.sendStatus(403);

    // Append the user to the request.
    req.user = user;
    next();
  });
}

app.listen(3000);
