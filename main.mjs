import express from "express";
const app = express();
app.use(express.json());

import fs from "fs";
import pino from "pino";
const transport = pino.transport({
  targets: [
    {
      level: "debug",
      target: "pino/file",
      options: {
        destination: "./logs/" + new Date().toISOString().slice(0, 10) + ".log", 
      },
    },
    {
      level: "info",
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  ],
});
const logger = pino(
  {
    level: "trace",
  },
  transport
);


var db;
var status = {
  DB_ready: false,
  working: false,
};



function read_DB() {
  if (!fs.existsSync("./db.json")) {
    logger.warn("Not exist [db.json],Init&Reset DB");
    fs.writeFileSync(
      "./db.json",
      JSON.stringify({
        settings: {
          keyword: [],
          auto_update: false,
          new_product_notice: false,
        },
        products: [],
        timestamp: Date.now(),

        new_product_list: [],
      })
    );
    read_DB();
    return;
  }

  db = JSON.parse(fs.readFileSync("./db.json", "utf8"));

  if (db == undefined) {
    logger.warn("Empty [db.json],Init&Reset DB");
    db = {
      settings: {
        keyword: [],
        auto_update: false,
        new_product_notice: false,
      },
      products: [],
      timestamp: Date.now(),
      new_product_list: [],
    };
  }
  if (!db.settings) {
    logger.warn("Miss [db.settings],Init&Reset it");

    db.settings = {
      keyword: [],
      auto_update: false,
      polling: 600,
    };
  }
  if (!db.products) {
    logger.warn("Miss [db.products],Init&Reset it");
    db.products = [];
  }
  logger.info(`Read DB successfully,last update timestamp ${db.timestamp}`);
  status.DB_ready = true;
  if (!db.settings.auto_update) {
    logger.warn("Auto fetch has been turned off,attention");
  }
}

function write_DB() {
  db.timestamp = Date.now();
  fs.writeFileSync("./db.json", JSON.stringify(db));
  logger.info(`Write DB`);
}

function get_products(prdcts) {
  status.working = true;
  var myHeaders = new Headers();
  myHeaders.append("authority", prdcts.url.split("/")[2]);
  myHeaders.append(
    "accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
  );
  myHeaders.append("accept-language", "zh-CN,zh;q=0.9");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  console.log(prdcts.name);

  fetch(prdcts.url, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      // console.log(result)
      let srt =
        "{" +
        result
          .replace(/\\"/g, '"')
          .replace(/\\\\\"/g, "'")
          .split("listingItems")[1]
          .substring(3)
          .split("listingPagination")[0]
          .slice(0, -3) +
        "}";
      let timestamp = Date.now();
      let data = {
        raw: JSON.parse(srt).items,
        products: [],
        timestamp: timestamp,
      };
      // console.log(JSON.parse(srt).items);
      data.raw.forEach((element) => {
        data.products.push(element.id);
      });

      if (db.products.length == 0) {
        //empty products array
        logger.warn("Empty products array,push first one");
        let new_item = {
          keyword: prdcts.name,
          updateTime: timestamp,
          data: [],
        };
        new_item.data.push(data);
        db.products.push(new_item);

        logger.info(`new product fetch successfully ${prdcts.name}`);
      } else {
        let find = false;
        db.products.forEach((element) => {
          if (element.keyword == prdcts.name) {
            console.log("find same keyword", element.keyword);
            element.data.push(data);

            if (element.data.length > 10) {
              const diff = element.data.length - 10;
              element.data.splice(0, diff);
            }
            logger.info(`DB ${prdcts.name} length ${element.data.length}`);

            if (element.data.length > 1) {
              var inconsistentData = getDiff(
                element.data[element.data.length - 2].products,
                element.data[element.data.length - 1].products
              );
              if (inconsistentData.length > 0) {
                logger.info("Find inconsistent data");
                console.log(inconsistentData);
                notice_new_product(inconsistentData, data, prdcts.name);
              }
            }
            find = true;
          }
        });
        if (!find) {
          let new_item = {
            keyword: prdcts.name,
            updateTime: timestamp,
            data: [],
          };
          new_item.data.push(data);
          db.products.push(new_item);
          logger.info(`new product fetch successfully ${prdcts.name}`);
        }
      }
      prdcts.latestUpdate = Date.now();
      prdcts.nextUpdate =
        prdcts.latestUpdate +
        prdcts.polling * 1000 +
        Math.floor(Math.random() * 10000 + 5000);

      write_DB();

      setTimeout(() => {
        status.working = false;
      }, 2000);
    })
    .catch((error) => {
      logger.error(`fetch failed ${prdcts.name}`);
      console.log("error", error);
    });
}

function getDiff(arr1, arr2) {
  return arr2.filter((item) => !arr1.includes(item));
}

function first_fetch() {
  db.settings.keyword.forEach((element) => {
    get_products(element);
  });
}

function notice_new_product(arr, data, name) {
  const indexes = data.raw
    .map((obj, index) => (arr.includes(obj.id) ? index : -1))
    .filter((index) => index !== -1);
  console.log("index", indexes);
  if (db.new_product_list.length > 100) {
    const diff = db.new_product_list.length - 100;
    db.new_product_list.splice(100, diff);
  }
  indexes.forEach((element) => {
    let str = JSON.parse(JSON.stringify(data.raw[element]));
    str.timestamp = Date.now();
    sc_send(
      "发现新品",
      `名称：${str.shortDescription}\n\n价格:${str.priceInfo.formattedFinalPrice}`,
      db.settings.sckey
    );
    db.new_product_list.push(str);
  });
  console.log("new_product_list", db.new_product_list);
}
async function sc_send(text, desp = "", key) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("text", text);
  urlencoded.append("desp", desp);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  const response=await fetch(`https://sctapi.ftqq.com/${key}.send`, requestOptions);
  let data = await response.text();
  data = JSON.parse(data);

  if (data.code == 0) {
    logger.info("Send successfully");
  }else{
   logger.error("Send failed");

  }
}

function Loop() {
  if (!status.DB_ready) {
    logger.debug("DB not ready");
    return;
  }
  if (db.settings.auto_update && !status.working) {
    if (db.settings.keyword.length == 0) {
      logger.warn("Empty keyword,open website add keywords");
      return;
    }

    if (db.products.length == 0) {
      first_fetch();
      logger.warn("First fetch,fasaaaaaaast!");
      return;
    } else {
      db.settings.keyword.forEach((element) => {
        if (Date.now() - element.nextUpdate > 0) {
          logger.info(`start Fetch ${element.name}`);
          get_products(element);
        }
      });
    }
  }
}

function run_interval() {
  const now = new Date();
  const nextTick = new Date(now.getTime() + 1000);
  const delay = nextTick - now;
  setTimeout(() => {
    Loop();
    run_interval();
  }, delay);
}

app.post("/settings", (req, res) => {
  console.log(req.body);
  db.settings = req.body;
  res.send("Settings saved successfully");
  write_DB();
});
app.get("/setting", (req, res) => {
  res.send(db.settings);
});

app.get("/products", (req, res) => {
  res.send(db.products);
});
app.get("/new", (req, res) => {
  res.send(db.new_product_list);
});
app.get("/fetch_now", (req, res) => {
  if (req.query.keyword) {
    db.settings.keyword.forEach((element) => {
      if (element.name == req.query.keyword) {
        get_products(element);
      }
    });
  }
  res.send("fetching");
});

read_DB();
run_interval();

app.use(express.static("public"));
app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
