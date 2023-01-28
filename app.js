require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const request = require('request');
const { send } = require("process");
const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

console.log(process.env.EMAIL);
const transport = nodemailer.createTransport(
    {
        service: "gmail",
        auth : {
            user :process.env.EMAIL,
            pass:process.env.PASS
        }
    }
);

app.get("/",function(req,res){
    res.render("login");
});

app.post("/",function(req, res){
    const email = req.body.email;
    var category = 'inspirational';
    request.get({
        url: 'https://api.api-ninjas.com/v1/quotes?category=' + category,
        headers: {
            'X-Api-Key': process.env.API_KEY
        },
    }, function(error, response, body) {
        if(error) return console.error('Request failed:', error);
        else if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
        else {
            const sendQuote = JSON.parse(body);
            sendQuote.forEach(async function(data){
                const mailOptions = {
                    from : process.env.EMAIL,
                    to : email,
                    subject : "'" + category +"'" + " Quotes",
                    text : "'"+data.quote + "'\n- " + data.author
                };
                // transport.sendMail(mailOptions, function(err, info){
                //     if(err){
                //         console.log(err);
                //     }else {
                //         console.log("Email sent "+info.response);
                //     }
                // });
                await new Promise((resolve, reject) => {
                    transport.sendMail(mailOptions, (err, info) => {
                      if (err) {
                        console.error(err);
                        reject(err);
                      } else {
                        resolve(info);
                      }
                    });
                  });
            });
            
            res.redirect("/");    
        }
    });  
});

app.listen(3000 || process.env.PORT, function(){
    console.log("Server running");
});