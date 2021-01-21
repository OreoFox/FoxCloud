const screenshot = require('screenshot-desktop');
const fs = require('fs');
const bodyParser = require("body-parser");
const ngrok = require('ngrok');
const express = require('express');
const path = require('path');
const hbs = require("hbs");
const sleep = require('sleep');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*:*',
        methods: ["GET", "POST"]
    }
})
const urlencodedParser = bodyParser.urlencoded({extended: false});
const port = 3000;
let comments = [];
let names = [];
let nm = ['Alice', 'Kirito', 'Kisagama', 'Asegawa', 'Kurosao']
let themes = ['Чуи', 'Стринги', 'Дарт Вейдер', 'Декольте', 'Лиса', 'Волк', 'Выдра', 'Бегемот', 'Стриптиз', 'Кетчуп'];
let currentTheme = '';


app.set("view engine", "hbs");

app.get('/', (req, res) => {
    res.render('croc.hbs', {
        comments: comments
    })
});

app.post('/postcomment', urlencodedParser, (req, res) => {
    let message = {
        "name": req.body.nickname,
        "comment": req.body.comment
    };
    io.emit('comment', message);
    comments.push(message);
});

io.sockets.on('connection', socket => {
    socket.on('image', data => {
        setTimeout(() => {
            io.emit('draw', data);
        }, 1000)
    });
    socket.on('comment', data => {
        if (data == currentTheme) {
            changeDrawer();
            io.emit('win')
        }
    });
    socket.on('setname', data => {
        if (names.includes(data.name)) {
            let num = Math.floor(Math.random() * nm.length);
            let name = nm[num]
            names.push(name);
            let newdata = {
                "id": data.id,
                "name": name
            }
            io.emit('changeName', newdata);
        } else {
            names.push(data.name);
        }
        console.log(names);
    });

    setTimeout(() => {
        changeDrawer();
    }, 5000)
});

function changeDrawer() {
    let drawer = '';
    let theme = '';
    let num = Math.floor(Math.random() * names.length);
    let numt = Math.floor(Math.random() * themes.length);
    drawer = names[num];
    theme = themes[numt];
    currentTheme = theme;
    let data = {
        "drawer": drawer,
        "theme": theme
    }
    console.log(drawer);
    io.emit('changeDrawer', data);
    io.emit('amIDraw', drawer);
}

server.listen(port, async () => {
    console.log(`Started`);
    const url = await ngrok.connect(3000);
    console.log(url);
});
