const fs = require("fs");
const fetch = require("node-fetch");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("./src/api/data/db/novelas.sqlite");
async function scrapeAPI(url, numPages, fileName) {
  let data = [];

  const query = `
  CREATE TABLE IF NOT EXISTS novelas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    array_field TEXT NOT NULL
  );
`;
  db.run(query, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Table created successfully.");
  });

  const promises = [];
  for (let i = 1; i <= numPages; i++) {
    const apiUrl = `${url}/${i}`;

    promises.push(fetch(apiUrl).then((response) => response.json()));
  }

  try {
    const responses = await Promise.all(promises);
    for (const apiResponse of responses) {
      const servers = apiResponse.servers;
      data.push(servers);
    }
  } catch (error) {
    console.error(error);
  }

  data = data.flat();

  const allnovelas = JSON.stringify(data);

  const querys = "INSERT INTO novelas (array_field) VALUES (?)";
  db.run(querys, [allnovelas], (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Array saved successfully.");
  });

  /*   fs.writeFile(
    `./src/api/data/archives/${fileName}`,
    JSON.stringify(data),
    (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Información guardada en ${fileName}`);
      }
    }
  ); */

  console.log(data.length);

  return;
}


/// get episodes  
const getEpisodes = async (url, fileName) => {
  let datos = [];
  const response = await fetch(url);
  const data = await response.json();
  datos.push(data.servers.episodes);

  datos = datos.flat();

  fs.writeFile(
    `./src/api/data/archives/${fileName}`,
    JSON.stringify(datos).trim(),
    (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Información guardada en ${fileName}`);
      }
    }
  );
};

const axios = require("axios");

async function obtenerYCrearArchivoJSON(array ,  info ) {
  async function obtenerDatos(id) {
    let resultados = {};
    for (let pagina = 1; pagina <= 12; pagina++) {
      try {
        const respuesta = await axios
          .get(`https://pepe.fly.dev/info/${id}/${pagina}`)
          .catch((error) => {
            console.error(error);
          });
        if (pagina === 1) {
          resultados.id = id;
          resultados.sinopsis = respuesta.data.servers[0].sinopsis;
          resultados.title = respuesta.data.servers[0].title;
          resultados.episodes = respuesta.data.servers[0].episodes;
        } else {
          resultados.episodes.push(...respuesta.data.servers[0].episodes);
        }
      } catch (error) {
        console.error(error);
      }
    }
    return resultados;
  }

  const resultados = await Promise.all(
    array.map((elemento) => obtenerDatos(elemento.id))
  );
  const datosJSON = JSON.stringify([info , ...resultados]);
  fs.promises
    .writeFile("datos.json", datosJSON)
    .then(() => {
      console.log("El archivo se ha escrito correctamente.");
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = {
  scrapeAPI,
  getEpisodes,
  obtenerYCrearArchivoJSON,
};
