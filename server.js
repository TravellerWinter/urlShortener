require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require("dns")
const fs = require("fs")

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", async (req, res) => {
  let toVer
  try{
    toVer = new URL(req.body.url)

  }catch{
    res.json({ error: 'invalid url' })
    return
  }
  
  const url = req.body.url
  if (url.slice(0, 4) !== "http"){
    
    res.json({ error: 'invalid url' })
    return
  }
  dns.lookup(toVer.hostname, (err, address, family) => {
  
    if (err){
      console.log(err)
      res.json({ error: 'invalid url' })
      return
    }
    let file = JSON.parse(fs.readFileSync("url.json", { encoding: "utf8" }))
    let n = 0
    for (i in file){
      if (file[i] === url){
        res.json({ original_url: url, short_url: +1 })
        return
      }
      n = +i
    }
    n += 1
    file[`${n}`] = url
    console.log(n)
    fs.writeFileSync("url.json", JSON.stringify(file))
    res.json({ original_url: url, short_url: n })
  })
  
})

app.get("/api/shorturl/:n", (req, res) => {
  const n = req.params.n
  const json = JSON.parse(fs.readFileSync("url.json", { encoding: "utf8" }))
  for (i in json){
    if (i === n){
      res.redirect(json[n])
      return
    }
  }
  res.json({ error: 'invalid url' })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
