const cheerio = require("cheerio");
const cloudscraper = require("cloudscraper");

const urls = {
  baseUrl: "https://www.ennovelas.com/?op=categories_all&per_page=60&page=",
};

//// all  novelas
const getNovelas = async (page) => {
  const res = await cloudscraper(`${urls.baseUrl}${page}`, { method: "GET" });
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];
  $("#container > section > div > div.row > div:nth-child(1) > div").each(
    (index, element) => {
      const $element = $(element);
      const id = $element
        .find(" >div > a")
        .attr("href")
        .replace("https://www.ennovelas.com/category/", "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const title = $element.find("> div > a > p").text();
      const poster = $element
        .find("> div > a > div")
        .attr("style")
        .replace("background-image:url(", "")
        .replace(")", "")
        .trim();

      const route = id.split("+").join("%20");

      promises.push({
        id: id || null,
        title: title || null,
        poster: poster || null,
      });
    }
  );

  return Promise.all(promises);
};

function extractText(inputString) {
  const lines = inputString.split("\n");
  const filteredLines = lines.filter(
    (line) => line.trim() !== "" && line.indexOf("\t\t\t\t\t") !== 0
  );
  return filteredLines
    .slice(1)
    .map((line) => line.trim().replace(/\s{2,}/g, " "))
    .join("\n");
}

//// get info novelas
const getInfo = async (name, page) => {
  const res = await cloudscraper(
    `https://www.ennovelas.com/?cat_name=${name}&op=search&per_page=44&page=${page}`,
    {
      method: "GET",
    }
  );
  const body = await res;
  const $ = cheerio.load(body);
  const informacion = [];
  const episodes = [];

  const title = $("#inwg > h3 > span").text().trim();
  const sinopsis = $("#inwg ").text();

  $("#col3 > div").each((idex, element) => {
    const $element = $(element);

    const id = $element
      .find(" >a.video200")
      .attr("href")
      .replace("https://www.ennovelas.com/", "");
    const poster = $element
      .find("> a.video200 > div ")
      .attr("style")
      .replace("background-image: url('", "")
      .replace("')", "")
      .trim();

    const name = $element.find("> a").text().replace("\n\t\t\t\t\t,", "");
    episodes.push({
      id: id || null,
      title: name.trimStart().trimEnd() || null,
      poster: poster || null,
    });
  });

  informacion.push({
    sinopsis: extractText(sinopsis) || null,
    title: title || null,
    episodes: episodes,
  });

  return Promise.all(informacion);
};

////  get video source
const getVideo = async (id) => {
  const res = await cloudscraper(`https://www.ennovelas.com/${id}`, {
    method: "GET",
  });
  const body = await res;
  const $ = cheerio.load(body);

  const script = $(" #container > script:nth-child(8)").html();
  const datas = script
    .split("preload: 'auto',")[0]
    .toString()
    .replace("var holaplayer;", "")
    .replace("window.hola_player({ player: '#hola',")
    .replace("undefined", "");
  const url = datas.split();
  const link = url[0]
    .split("tshare:")[0]
    .split("tsources:")[0]
    .split("  ")
    .filter((x) => x.includes("sources: [{src:"))[0]
    .replace("sources: [{src:", "")
    .split("  ")[0]
    .replace("}],", "")
    .toString()
    .split(" ")
    .filter((x) => x.includes("https://"))[0]
    .replace(" ", "")
    .replace(",", "")
    .replace('"', "")
    .replace('"', "");

  return { link: btoa(link) || null };
};

/// get serch query paramas
const serch = async (query) => {
  const res = await cloudscraper(
    `https://www.ennovelas.com/?op=categories_all&name=${query}`,
    { method: "GET" }
  );
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $("#container > section > div > div.row > div:nth-child(1) > div").each(
    (index, element) => {
      const $element = $(element);
      const id = $element
        .find(" >div > a")
        .attr("href")
        .replace("https://www.ennovelas.com/category/", "");
      const title = $element.find("> div > a > p").text();
      const poster = $element
        .find("> div > a > div")
        .attr("style")
        .replace("background-image:url(", "")
        .replace(")", "")
        .trim();

      promises.push({
        id: id || null,
        title: title || null,
        poster: poster || null,
      });
    }
  );

  return Promise.all(promises);
};

////  get   los ultimos ca pitulos

const getLastEpisodes = async () => {
  const res = await cloudscraper(`https://www.ennovelas.com/just_added.html`, {
    method: "GET",
  });
  const body = await res;
  const $ = cheerio.load(body);

  const episodes = [];

  $("#col3 > div").each((idex, element) => {
    const $element = $(element);

    const id = $element
      .find(" >a.video200")
      .attr("href")
      .replace("https://www.ennovelas.com/", "");
    const poster = $element
      .find("> a.video200 > div ")
      .attr("style")
      .replace("background-image: url('", "")
      .replace("')", "")
      .trim();


    const name = $element.find("> a").text().replace(/[\n\t]+/g, '')
    episodes.push({
      id: id || null,
      title:name|| null,
      poster: poster || null,
    });
  });

  return {
    episodes: episodes || null,
  };
};

module.exports = {
  getNovelas,
  getInfo,
  getVideo,
  serch,
  getLastEpisodes,
};
