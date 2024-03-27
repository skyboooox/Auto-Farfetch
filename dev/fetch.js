const fs = require("fs");

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

fetch(
  "https://www.farfetch.com/hk/shopping/men/adidas/items.aspx",
  requestOptions
)
  .then((response) => response.text())
  .then((result) => {
    let srt = [];
    srt ="{"+
        result
        .replace(/\\"/g, '"')
        .replace(/\\\\\"/g, "'")
        .split("listingItems")[1]
        .substring(3)
        .split("listingPagination")[0]
        .slice(0, -3)
        +"}";
    // console.log(srt)
    fs.writeFileSync("./db4.json", srt);
    console.log(JSON.parse(srt));

    // let json = JSON.parse(srt);
    // json.listingItems.items;

    // let items = json.listingItems.items;
    // fs.writeFileSync("./db.json", JSON.stringify(items));

    // console.log(items.length);
  })

  .catch((error) => console.log("error", error));
