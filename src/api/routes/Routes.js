const { Router } = require("express");
const AppAddsId = require("../../Constants/appAds.ID");
const rt = Router();
const {
  getInfoNovelasDb,
  postEmicion,
  getEmincion,
  putEmicion,
  deleteEmicion,
  getEpisodes,
  postEpisodes,
  searchNovelas,
  allNovelasdb,
  postError,
  getError,
  deleteError,
  saveTokents,
  getTokens,
  autoUpdateEpisodes,
  getGeneros,
  getRecomend,
} = require("../../controllers/Controllers.Routes");
const api = require("../api");
const configure = require("../util/configApp.json");

rt.get("/", (req, res) => {
  res.send("Hello word");
});

//// get all novelas
rt.get("/novelas/:page", (req, res) => {
  let page = req.params.page;
  api
    .getNovelas(page)
    .then((servers) => {
      res.status(200).json({
        servers,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

///  get info novelas

rt.get("/info/:title/:page", (req, res) => {
  let title = req.params.title;
  let page = req.params.page;
  api
    .getInfo(title, page)
    .then((data) => {
      res.send(data[0]);
    })
    .catch((err) => {
      res.send({
        error: true,
        massage: err.massage,
      });
    });
});

////// =+++================++++++==============++++++  ========++= =======+++++ ==////////

/// get  info novelas
rt.get("/infodb/:id", getInfoNovelasDb);

/// route en emicion
rt.post("/emicion", postEmicion);
rt.get("/emicion", getEmincion);
rt.put("/emicion/:id", putEmicion);
rt.delete("/emicion/:id", deleteEmicion);

/// routes of episodes
rt.post("/episodesdb", postEpisodes);
rt.get("/episodesdb", getEpisodes);

///// routes  search
rt.get("/search/:name", searchNovelas);

/// novelas
rt.get("/novelas", allNovelasdb);

////  repor erroro  routes
rt.post("/error", postError);

rt.get("/error", getError);

rt.delete("/error/:id", deleteError);

///   token
rt.post("/token", saveTokents);
rt.get("/token", getTokens);

///  genersos
rt.get("/generos", getGeneros);

///  get  recomd tv show

rt.get("/recomed", getRecomend);

/// app config

rt.get("/config", (rqe, res) => {
  res.send(configure);
});

/// episodes update
rt.get("/update", (req, res) => {
  try {
    autoUpdateEpisodes();
    res.send({
      massage: "episodeos atualisados",
      status: true,
    });
  } catch (error) {
    res.send({
      error: error,
      status: false,
    });
  }
});

///  route ads

rt.get("/ads", (req , res  ) => {
  try {
    res.send(AppAddsId);
  } catch (error) {
    res.send({
      error: error,
      status: false,
    });
  }
});

///  get script number  

rt.get("/scriptNumber", (req , res  ) => {
  try {
    res.send({
      number: 7 , 
      selector : `#container > script:nth-child(7)`
    });
  } catch (error) {
    res.send({
      error: error,
      status: false,
    });
  }
});

module.exports = rt;
