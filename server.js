const PORT = process.env.PORT || 5000;
var express = require("express");
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var jwt = require('jsonwebtoken');
var http = require("http");
var path = require('path');
const fs = require('fs');
const { userModel } = require("./dbmodel/index");
const { SERVER_SECRET } = require("./core/index");
const authRoutes = require("./routes/auth");
var app = express();
var server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:3000', 'https://nextjsappdeploy.herokuapp.com'],
    credentials: true
}));

app.use(morgan('dev'));


app.use("/", express.static(path.resolve(path.join(__dirname, "my-app/.next"))))

app.use('/auth', authRoutes);

app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies);

    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate; // 84600,000

            if (diff > 3000000000) { // expire after 5 min (in milis)
                res.send({
                    message: "TOKEN EXPIRED",
                    status: 401
                });
            } else { // issue new Token
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                    phone: decodedData.phone
                }, SERVER_SECRET)

                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                req.headers.jToken = decodedData

                next();
            }
        } else {
            res.send({
                message: "Invalid Token",
                status: 401
            });
        }
    });
});


server.listen(PORT, () => {
    console.log("Server is Running:", PORT);
});