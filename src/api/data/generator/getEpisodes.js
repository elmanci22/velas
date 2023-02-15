const fs = require("fs");
const fetch = require("node-fetch");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./src/api/data/db/novelas.sqlite");

const getEpisodes = async (url) => {
  const query = `
    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      episodes TEXT NOT NULL
    );
  `;
  db.run(query, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Table created successfully.");
  });

  let datos = [];
  const response = await fetch(url);
  const data = await response.json();
  datos.push(data.servers.episodes);

  datos = datos.flat();

  const allnovelas = JSON.stringify(data.servers.episodes);

  const querys = "INSERT INTO episodes (episodes) VALUES (?)";
  db.run(querys, [allnovelas], (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Array saved successfully.");
  });

/*   fs.writeFile(
    `./src/api/data/archives/${fileName}`,
    JSON.stringify(datos).trim(),
    (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Información guardada en ${fileName}`);
      }
    }
  ); */
};


module.exports ={
    getEpisodes
}
