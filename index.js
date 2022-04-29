const { MongoClient, ServerApiVersion } = require("mongodb");
var express = require("express");
var cors = require("cors");
var app = express();
const port = process.env.PORT || 5000;
// const jwt = require("dotenv");
require("dotenv").config();

// username - shafiss
// password - u84UBoH2urAMT55G

app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");

const uri =
  "mongodb+srv://shafiss:u84UBoH2urAMT55G@cluster0.ppgea.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
      await client.connect();
    console.log("database connected");
    const productCollection = client.db('practis-con').collection('product');
    const orderCollection = client.db('practis-con').collection('orders');
    app.post('/login', (req, res) => {
      const email = req.body;
      // const jwt = require("jsonwebtoken");
      const token = jwt.sign(email, process.env.API_KEY);
      res.send({token})
    })
    app.post('/uploadpd', async (req, res) => {
      // const jwt = require("jsonwebtoken");
      const product = req.body; 
      const tokeninfo = req.headers.authoraization;
      const [email, accestoken] = await tokeninfo.split(" ")
      const decoded = varifytoken(accestoken);
      
      if (email === decoded.email) {
        const result = await productCollection.insertOne(product);
        res.send({ success: "successfully uploaded" });
      }
      else {
        res.send({ success: "who are you??" });
      }
      
      
    })
    app.get("/products", async (req, res) => {
      const products =await productCollection.find({}).toArray();
      res.send(products);
    });
    app.post("/addorder", async(req, res)=> {
      const orderinfo = req.body;
      const result = await orderCollection.insertOne(orderinfo);
      res.send({ success: "order complete" });

    })
    app.get('/orderlist', async(req, res) => {
      const tokeninfo = req.headers.authoraization;
      console.log(tokeninfo);
      const [email, accestoken] = await tokeninfo.split(" ")
      const decoded = varifytoken(accestoken);
      if (email === decoded.email) {
        const result = await orderCollection.find({email:email}).toArray();
        res.send(result);
      }
      else {
        res.send({ err: "who are you??" });
      }
    })
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, function () {
  console.log("CORS-enabled web server listening on port");
});

const varifytoken = (token) => {
  let email;
  jwt.verify(token, process.env.API_KEY, function (err, decoded) {
    if (err) {
      email = "invalid email";
    }
    else {
      email = decoded;
    }
  });
  return email;
}
