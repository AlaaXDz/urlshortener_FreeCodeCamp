require('dotenv').config();
const express = require('express');
const bodyp=require('body-parser')
const cors = require('cors');
const dns=require('dns')
const app = express();
const mongoose=require('mongoose')
const {Schema}=mongoose

// parsing external post prequest
app.use(bodyp.urlencoded({ extended: true }))
app.use(bodyp.json())

// Basic Configuration
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.use(cors());
//DB configuration
const url = process.env.MONGO_URI
console.log(url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

// create schema 
shortnerSchema= new mongoose.Schema({
     original_url:{type:String,required:true},
     short_url:{type: Number, required:true}
 })
//create modal and collection
const Shorturl=mongoose.model('shorturl',shortnerSchema)

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  let host = new URL(req.body.url).hostname
  // verifying the submitted URL.
  dns.lookup(host, async (err, address, family) => {
    if (err || host.length == 0) {
      return res.json({ error: 'invalid url' })
    } else {
      let exist = await Shorturl.findOne({ original_url: req.body.url })
      if (exist) {
        res.json({
          original_url: exist.original_url,
          short_url: exist.short_url
        })
      }
      else {
        let url = { original_url: req.body.url, short_url: randomNum() }
        createUrl(url)
        res.json(url)
      }
    }
  })
});
// generate random unique value 
function randomNum(){
  let value=[0,1,2,3,4,5,6,7,8,9]
  let randomNum=''
  for(let i=0;i<6;i++){
    randomNum+=value[Math.floor(Math.random()*6)]
  }
  return new Number(randomNum)
}


// redirect to orginal  url when the client hit to the //api 
app.get('/api/shorturl/:shorturl', (req,res)=>{
  const shorturl=new Number( req.params.shorturl|| req.query.v) ; Shorturl.findOne({short_url:shorturl},function(err,data){
      let url =data.original_url
    console.log(url)
      res.redirect(url)
    })  
})

// create mongo document 
 function createUrl(url){
  Shorturl.create(url,(err)=>{
    if(err)console.log(err)
  })
 }