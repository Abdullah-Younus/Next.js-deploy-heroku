var express = require("express");
var bcrypt = require("bcrypt-inzi")
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken
var { userModel } = require("../dbmodel/index"); // problem was here, notice two dots instead of one
var { SERVER_SECRET } = require("../core/index");
var api = express.Router();


api.post("/signup", (req, res, next) => {

    if (!req.body.name
        || !req.body.email
        || !req.body.password
        || !req.body.phone) {

        res.status(403).send(`
            please send name, email, passwod, phone and  in json body.
            e.g:
            {
                "name": "Sameer",
                "email": "kb337137@gmail.com",
                "password": "abc",
                "phone": "03121278181",
                
            }`)
        return;
    }
    userModel.findOne({ email: req.body.email }, function (err, doc) {
        if (!err && !doc) {
            bcrypt.stringToHash(req.body.password).then(function (hash) {

                var newUser = new userModel({
                    "name": req.body.name,
                    "email": req.body.email,
                    "password": hash,
                    "phone": req.body.phone
                })
                newUser.save((err, data) => {
                    if (!err) {
                        res.send({
                            message: "SignUp Successfully goto Login Page",
                            status: 200
                        });
                    }
                    else {
                        console.log(err);
                        res.send({
                            message: "User Create Error " + JSON.stringify(err),
                            status: 500
                        });
                    }
                });
            });
        } else if (err) {
            res.send({
                message: "DB ERROR",
                status: 500
            });
        } else {
            res.send({
                message: "User Already Exist",
                status: 409
            });
        }
    });
});
api.post("/login", (req, res, next) => {

    if (!req.body.email || !req.body.password) {
        res.send({
            message: `please send email and passwod in json body.
            e.g:
            {
                "email": "kb337137@gmail.com",
                "password": "abc",
            }`,
            status: 403
        });
        return
    }
    userModel.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.send({
                message: "An Error Occure :" + JSON.stringify(err),
                status: 500
            });
        }
        else if (user) {
            bcrypt.varifyHash(req.body.password, user.password).then(isMatched => {
                if (isMatched) {
                    console.log("Matched");

                    var token = jwt.sign({
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    }, SERVER_SECRET);

                    res.cookie('jToken', token, {
                        maxAge: 86_400_000,
                        httpOnly: true
                    });

                    // when making request from frontend:
                    // var xhr = new XMLHttpRequest();
                    // xhr.open('GET', 'http://example.com/', true);
                    // xhr.withCredentials = true;
                    // xhr.send(null);


                    res.send({
                        status: 200,
                        token: token,
                        message: "Login Success",
                        user: {
                            name: user.name,
                            email: user.email,
                            phone: user.phone
                        }
                    });

                } else {
                    console.log("not matched");
                    res.send({
                        message: "inncorrect Password",
                        status: 401
                    })
                }
            }).catch(e => {
                console.log("error: ", e)
            });
        } else {
            res.send({
                message: "User NOT Found",
                status: 403
            });
        }
    });
});

api.post("/logout", (req, res, next) => {
    res.cookie("jToken", "", {
        maxAge: 86_400_000,
        httpOnly: true
    });
    res.send({
        status: 200,
        message: "Logout"
    });
});
module.exports = api;