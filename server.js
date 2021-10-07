const mongoUri = process.env['MONGO_URI']
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const autoIncrement = require('mongoose-auto-increment');
const urlParser=require('url');
const bodyParser = require('body-parser');
var mongoose=require('mongoose');
var mongo = require("mongodb");

mongoose.connect(mongoUri, { useNewUrlParser: true });
var connection = mongoose.createConnection(mongoUri);
autoIncrement.initialize(connection);
const Schema  = mongoose.Schema;
const WebsiteUrls = new Schema({
    url:  { type: String, required: true }
  });
WebsiteUrls.plugin(autoIncrement.plugin, 'WebsiteUrls');
const WebsiteUrl = mongoose.model('WebsiteUrls', WebsiteUrls);


console.log(mongoose.connection.readyState);
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:urlId', async function(req, res) {
  const urlId=req.params.urlId;
   await WebsiteUrl.findById(urlId, function (err, data) {
     if(data==null) {res.json({ error: 'invalid url' });}else{
     if(!isValidHttpUrl(data.url)){
     res.redirect(data.url);
     }else{
       res.json({ error: 'invalid url' })
     }
     }
   });
});

function isValidHttpUrl(string) {
  const hostname=urlParser.parse(string).hostname;
  if(hostname==null){
     return true;
  }
  dns.lookup(hostname, (error,address) => {
    console.log(address)
    if(error) return false;
  if (address!==undefined) {
    return true;
  }else{
    return false;
  }
});
}

app.post('/api/shorturl',async function(req, res) {
  const url=req.body.url;
  if(isValidHttpUrl(url)){
   res.json({ error: 'invalid url' });
  }else{
  await WebsiteUrl.create({url: url},async function(err, data) {
   if (err) return console.error(err);
   res.json({original_url :data.url,short_url:data._id});
   
});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
