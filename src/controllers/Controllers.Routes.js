const sqlite3 = require("sqlite3");
const { getLastEpisodes } = require("../api/api");
const { setEmail } = require("../api/util/setEmail");

/// data bases
const db = new sqlite3.Database("./src/api/data/db/error.sqlite");
const ds = new sqlite3.Database("./src/api/data/db/novelas.sqlite");
const dq = new sqlite3.Database("./src/api/data/db/episodes.sqlite");
const dl = new sqlite3.Database("./src/api/data/db/infonovela.sqlite");

//////////==================   Fuctiones   ===================///////////////

db.run(
  `CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY, token TEXT)`
);

//// filter fuuction
function filterByTitle(searchString, items) {
  const searchRegex = new RegExp(searchString.split("").join(".*"), "i");
  const filteredItems = items.filter(function (item) {
    return searchRegex.test(item.title);
  });
  if (filteredItems.length === 0) {
    items.reverse();
    items.sort((a, b) => {
      const aCount = (a.title.match(new RegExp(searchString, "gi")) || [])
        .length;
      const bCount = (b.title.match(new RegExp(searchString, "gi")) || [])
        .length;
      return bCount - aCount;
    });
    return [items[0]];
  }
  return filteredItems;
}

function randomArrayOfObjects(array) {
  const result = [];
  for (let i = 1; i <= 8; i++) {
    const randomElements = array.sort(() => Math.random() - 0.5).slice(0, 50);
    result.push({ [`generos${i}`]: randomElements });
  }
  return result;
}

//// generar novelas al azar   
const recomendeNovelaFuction = (array) => {
  let randomElements = [];
  while (randomElements.length !== 50) {
    const randomIndex = Math.floor(Math.random() * array.slice(0, 500).length);
    if (!randomElements.includes(array[randomIndex])) {
      randomElements.push(array[randomIndex]);
    }
  }
  return randomElements;
};

//// may  middelwors

//// getinfo novelas
const getInfoNovelasDb = (req, res) => {
  const id = req.params.id;
  try {
    const query = "SELECT array_field FROM novelas";
    dl.get(query, [], (err, row) => {
      if (err) {
        res.send({
          error: true,
          mensaje: err.message,
        });
      }
      const array = JSON.parse(row.array_field);
      const filter = array.find((e) => e.id === id);
      const not = {
        element: false,
      };

      res.send(filter === undefined ? not : filter);
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

/// en emicion

const postEmicion = (req, res) => {
  const show = req.body;
  try {
    const sql = `INSERT INTO shows (title, id, poster, banner) VALUES (?, ?, ?, ?)`;
    const params = [show.title, show.id, show.poster, show.banner];
    dq.run(sql, params, (err) => {
      if (err) {
        res.send({
          error: true,
          mensaje: err.message,
        });
      } else {
        res.send({
          save: true,
        });
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

const getEmincion = (req, res) => {
  try {
    const sql = `SELECT * FROM shows`;
    dq.all(sql, [], (err, rows) => {
      if (err) {
        res.send({
          error: true,
          mensaje: err.message,
        });
      }
      res.json(rows);
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

const putEmicion = (req, res) => {
  const id = req.params.id;
  const show = req.body;
  try {
    const sql = `UPDATE shows SET title = ?, id = ?, poster = ?, banner = ? WHERE id = ?`;
    const params = [show.title, show.id, show.poster, show.banner, id];
    dq.run(sql, params, (err) => {
      if (err) {
        res.send({
          error: true,
          mensaje: err.message,
        });
      } else {
        res.send({
          save: true,
        });
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

const deleteEmicion = (req, res) => {
  try {
    const sql = `DELETE FROM shows WHERE id = ?`;
    const params = [req.params.id];
    dq.run(sql, params, (err) => {
      if (err) {
        res.send({
          error: true,
          mensaje: err.message,
        });
      } else {
        res.json({ message: "successfully deleted", changes: this.changes });
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

//// episodes

const getEpisodes = (req, res) => {
  try {
    const query = "SELECT array_field FROM novelas";
    dq.get(query, [], (err, row) => {
      if (err) {
        res.send({
          error: true,
          mensaje: err.message,
        });
      } else {
        const array = JSON.parse(row.array_field);
        res.send(array);
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

const postEpisodes = (req, res) => {
  const datos = req.body;
  try {
    const allnovelas = JSON.stringify(datos);

    const sql = `UPDATE novelas SET array_field = ? WHERE id = 1`;
    const params = [allnovelas];
    dq.run(sql, params, (err) => {
      if (err) {
        res.status({
          status: false,
        });
      } else {
        res.send({
          save: true,
        });
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }

  dq.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Conexión cerrada correctamente.");
    }
  });
};

////  search
const searchNovelas = (req, res) => {
  try {
    const query = "SELECT array_field FROM novelas";
    ds.get(query, [], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
      const array = JSON.parse(row.array_field);
      const searchString = req.params.name;
      const filteredItems = filterByTitle(searchString, array);
      res.send(filteredItems);
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

////  get all novelas

const allNovelasdb = (req, res) => {
  try {
    const query = "SELECT array_field FROM novelas";
    ds.get(query, [], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
      const array = JSON.parse(row.array_field);
      res.send(array);
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

///   report errores

const postError = (req, res) => {
  const datosErrors = req.body;

  const errorEmail = JSON.stringify(datosErrors);
  try {
    const sql = "INSERT INTO error (id, error) VALUES (?, ?)";
    const params = [datosErrors.id, datosErrors.error];
    db.run(sql, params, (error) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.send({
          save: true,
        });

        setEmail(errorEmail);
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

const getError = (req, res) => {
  try {
    db.all("SELECT * FROM error", (error, filas) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.send(filas.reverse());
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

const deleteError = (req, res) => {
  const id = req.params.id;
  try {
    const query = `DELETE FROM error WHERE id IN (?, ?)`;
    db.run(query, [id, "hola"], (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      } else {
        res.send({
          save: true,
        });
      }
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

///// auto update apisodes

const autoUpdateEpisodes = async () => {
  const now = new Date();

  await getLastEpisodes().then((data) => {
    try {
      const allnovelas = JSON.stringify(data.episodes);
      const sql = `UPDATE novelas SET array_field = ? WHERE id = 1`;
      dq.run(sql, [allnovelas], (err) => {
        if (err) {
          setEmail(`ubo un error al actualisr los capitulos:  ${err.message}`);
        } else {
          setEmail(
            `se actualiso los capitulos:  ${now}`,
            "actualizando los  capitulos de la app "
          );
        }
      });
    } catch (error) {
      console.log(error.massage);
    }
  });
};

//// get token

const saveTokents = async (req, res) => {
  try {
    const token = req.body.token;
    const checkTokenExists = (token) => {
      return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM tokens WHERE token = ?`, [token], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    };

    const tokenFromDB = await checkTokenExists(token);

    // Si el token no existe, agregarlo a la tabla
    if (!tokenFromDB) {
      const insertToken = (token) => {
        return new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO tokens (token) VALUES (?)`,
            [token],
            function (err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID);
              }
            }
          );
        });
      };

      const id = await insertToken(token);
      res.json({ message: "Token agregado exitosamente", id });
    } else {
      res.status(409).json({ message: "Token ya existente" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getTokens = async (req, res) => {
  try {
    // Obtener todos los tokens de la tabla
    const getAllTokens = () => {
      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM tokens`, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    };

    const tokens = await getAllTokens();
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// / generos

const getGeneros = (req, res) => {
  try {
    const query = "SELECT array_field FROM novelas";
    ds.get(query, [], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
      const array = JSON.parse(row.array_field);
      const generos = randomArrayOfObjects(array);
      console.log(generos);
      res.send(generos);
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

////  recomed  tv show

const getRecomend = (req, res) => {
  try {
    const query = "SELECT array_field FROM novelas";
    ds.get(query, [], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
      const array = JSON.parse(row.array_field);
      const recomed = recomendeNovelaFuction(array);
      console.log(recomed);
      res.send(recomed);
    });
  } catch (error) {
    res.send({
      error: true,
      massage: error.massage,
    });
  }
};

/// export
module.exports = {
  getInfoNovelasDb,
  /// emicion
  postEmicion,
  getEmincion,
  putEmicion,
  deleteEmicion,

  /// episodes
  getEpisodes,
  postEpisodes,

  /// search
  searchNovelas,
  //// alll novelas
  allNovelasdb,

  /// error
  postError,
  getError,
  deleteError,

  /// update episodes
  autoUpdateEpisodes,

  /// token
  saveTokents,
  getTokens,

  ///  generos
  getGeneros,

  // recomed tv show
  getRecomend,
};
