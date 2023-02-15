const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const rt = require("./src/api/routes/Routes");
const cron = require("node-cron");

const { autoUpdateEpisodes } = require("./src/controllers/Controllers.Routes");

/// midelwars
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(rt);

//// fuction update

setInterval(() => {
  autoUpdateEpisodes();
}, 18000000);



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
