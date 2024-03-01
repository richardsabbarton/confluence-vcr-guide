const express = require('express')
const app = express()

const { Auth } = require('@vonage/auth');
const { Vonage } = require('@vonage/server-sdk');

const credentials = new Auth({
  apiKey: process.env.MYAPIKEY,
  apiSecret: process.env.MYSECRET
});

const options = {};
const vonage = new Vonage(credentials, options);

vonage.numberInsights.basicLookup('447379123456')
  .then(resp => console.log(resp))
  .catch(err => console.error(err));


const  OpenTok = require('opentok')

var opentok = new OpenTok(process.env.MYVIDEOAPIKEY, process.env.MYVIDEOSECRET);
var sessionId = process.env.MYVIDEOSESSIONID;


console.log('Neru Instance')
const neru = require('neru-alpha').neru
console.log('getting neru state')
const state = neru.getInstanceState()

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/app.html')
})

app.get('/verify/:number', (req, res)=>{
  console.log(req.params.number)
  vonage.verify.start({
    number: req.params.number,
    brand: 'Nexmo'
  })
  .then(resp=>{
    console.log(resp)
    res.contentType('application/json')
    res.send(resp)
  })
  .catch((err)=>{
    console.log(err)
    res.send(err)
  })
})

app.get('/confirm/:id/:code', (req, res)=>{
  console.log(req.params.id)
  console.log(req.params.code)
  vonage.verify.check(req.params.id, req.params.code)
  .then((result)=>{
    console.log(result)
    if(result.status == 0){
      // VERIFY success...
      let token = opentok.generateToken(sessionId)
      let videoCreds = {
        apiKey: process.env.MYVIDEOAPIKEY,
        sessionId: sessionId,
        token: token
      }
      res.contentType('application/json')
      res.send(videoCreds)
    } else {
      res.send(result)
    }
  })
})

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

const port = process.env.NERU_APP_PORT || process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Application Listing ON Port: ${port}`)
})
