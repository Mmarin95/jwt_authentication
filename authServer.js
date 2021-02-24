if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let refreshTokens = [];

// Generate a new accessToken if the user has a valid refreshToken
app.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) res.sendStatus(403);
  
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    if (error) res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

// Delete the user refreshToken, so the user have no long access.
app.delete("/logout", (req, res) => {
  const refreshToken = req.body.refreshToken;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.sendStatus(204);
});

app.post("/login", (req, res) => {
  // We should authenticate the user first before use JWT

  const username = req.body.username;
  const user = { username: username };

  // Generate token that will expire.
  const accessToken = generateAccessToken(user);

  // Generate token that we save in DB
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "45s" });
}

app.listen(4000);
