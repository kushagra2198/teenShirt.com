//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path')
const mongoose = require('mongoose');

const app = express();
//to use ejs as a view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

const PUBLISH_KEY = "pk_test_51IU8imH0Gj5opU0EvaevwjznxE4R9HP5ntDY5r6WKEFAPXB8YvdhfiQuhp7zEb70YBNPk66X5BmPriy82ROCyoT500tkbACFid"

const SECRET_KEY = "sk_test_51IU8imH0Gj5opU0EHI5MKUilmxU4s9uavoWflTTRwEpaqmWT7NT34F8tAFZSMuxGjSGN71pPDWtPfrYj2h0e7Zm700Wc5lrImR"

const stripe = require('stripe')(SECRET_KEY);



mongoose.connect('mongodb://localhost:27017/productsDB', { useNewUrlParser: true }, { useUnifiedTopology: true });

// create a schema/blueprint

const PageSchema=new mongoose.Schema({

        name:{
            type:String,
            trim: true
        },

        price:{
            type:Number,
            trim: true,
        }
});

// create a model

const Page = mongoose.model("Page",PageSchema);

// get the individual page for every product
// app.get("/about",function(req,res) {
//   res.render("about");
// });
// get the home-main page
app.get("/",function(req,res) {
  res.render("main");
});


app.get("/pages/payment",function(req,res) {
  res.render("payment", {
    key: PUBLISH_KEY
  });
});

app.post("/pages/payment",function(req,res) {
  stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Kushagra Sinha',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '110092',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
        }
    })
    .then((customer) => {

        return stripe.charges.create({
            amount: 7000,    // Charing Rs 25
            description: 'Teeshirt',
            currency: 'INR',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("<h1>Thankyou for shopping with us</h1>") // If no error occurs
    })
    .catch((err) => {
        res.send(err)    // If some error occurs
    });
})
// get the main page
app.get("/pages",function(req,res) {
  Page.find({},function(err,foundItems){
        res.render("home",{newItems:foundItems});
      });
});

// get the name and id and price from database to use it in about.ejs file
app.get("/pages/:postname",function(req,res) {
    const requestedId = req.params.postname;
    Page.findOne({name: requestedId}, function(err, page){

        res.render("about", {

             name: page.name,
             id:page._id,
             price: page.price

   });
      });


});

//listening to port 3000
app.listen(2000, function() {
  console.log("Server started on port 3000");
});
