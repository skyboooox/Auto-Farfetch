import express from "express";
const app = express();
app.use(express.json());

import fs, { stat } from "fs";

var db = JSON.parse(fs.readFileSync("./db.json", "utf8"));

var settings = {};
var status = {
  fetching: false,
  update_cool_down: null,
  last_fetch: null,
};

fs.readFile("./settings.json", "utf8", (err, data) => {
  if (err) {
    console.error(err);

    return;
  }
  settings = JSON.parse(data);
  getProducts();
});

const new_key_word = () => {
  console.log("Array updated:", settings.keyword);
  getProducts();
};

const handler = {
  set(target, prop, value) {
    target[prop] = value;
    if (prop === "keyword") {
      new_key_word();
    }
    return true;
  },
};

settings = new Proxy(settings, handler);

async function getProducts() {
  db = [];
  for (let i = 0; i < settings.keyword.length; i++) {
    var myHeaders = new Headers();
    myHeaders.append("authority", "www.farfetch.cn");
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

    try {
      const response = await fetch(settings.keyword[i].url, requestOptions);
      const result = await response.text();
      //  fs.writeFileSync("./db3.json", result);
       let srt ="{"+
       result
       .replace(/\\"/g, '"')
       .replace(/\\\\\"/g, "'")
       .split("listingItems")[1]
       .substring(3)
       .split("listingPagination")[0]
       .slice(0, -3)
       +"}";
      
      
      let _db = {
        keyword: settings.keyword[i].name,
        data: [],
        timestamp: 0,
      };
      _db.data = JSON.parse(srt).items;
      _db.timestamp = Date.now();

      db.push(_db);

      fs.writeFileSync("./db.json", JSON.stringify(db));
      console.log(
        new Date(Date.now())
          .toLocaleString("zh-cn", { hour12: false })
          .replace(/\//g, "-")
          .replace(/ /g, "T"),
        JSON.parse(srt).items.length,
        settings.keyword[i].name
      );
      await new Promise((resolve) =>
        setTimeout(resolve, (Math.floor(Math.random() * 100) + 100) * 10)
      );
    } catch (error) {
      console.log("error", error);
      await new Promise((resolve) =>
        setTimeout(resolve, (Math.floor(Math.random() * 100) + 100) * 10)
      );
      // getProducts()
    }
  }
  status.last_fetch = Date.now();
}

app.post("/settings", (req, res) => {
  settings = req.body;
  fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error Writing settings.json");
      return;
    }
    res.send("Settings saved successfully");
  });
});
app.get("/setting", (req, res) => {
  res.send(settings);
});

app.get("/products", (req, res) => {
  res.send(db);
});

function myFunction() {
  if (settings.auto_update) {
    if (!status.update_cool_down) {
      status.update_cool_down = settings.polling;
    }

    if (status.update_cool_down > 1) {
      status.update_cool_down--;
      // console.log("Cool down:", status.update_cool_down);
    } else {
      getProducts();
      status.update_cool_down =
        settings.polling + Math.floor(Math.random() * 60) + 60;
    }
  }
}

function runInterval() {
  const now = new Date();
  const nextTick = new Date(now.getTime() + 1000);
  const delay = nextTick - now;
  setTimeout(() => {
    myFunction();
    runInterval();
  }, delay);
}

runInterval();

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
