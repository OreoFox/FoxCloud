const screenshot = require('screenshot-desktop');
const fs = require('fs');
const bodyParser = require("body-parser");
const ngrok = require('ngrok');
const express = require('express');
const path = require('path');
const hbs = require("hbs");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*:*',
        methods: ["GET", "POST"]
    }
})
const urlencodedParser = bodyParser.urlencoded({extended: false});
const robot = require('robotjs')
const port = 3000;
let FPS = 1;
const STEP = 500;

let screenSize = robot.getScreenSize();
let height = screenSize.height;
let width = screenSize.width;

app.set("view engine", "hbs");

console.log(height, width);

app.get('/', (req, res) => {
    res.render('croc.hbs', {
    })
});

app.post('/leftClick', urlencodedParser, (req, res) => {
    robot.mouseClick('left');
});

app.post('/rightClick', urlencodedParser, (req, res) => {
    robot.mouseClick('right');
});

app.post('/leftDown', urlencodedParser, (req, res) => {
    robot.mouseToggle('down', 'left')
});

app.post('/leftUp', urlencodedParser, (req, res) => {
    robot.mouseToggle('up', 'left')
});

app.post('/look', urlencodedParser, (req, res) => {
    let dir = req.body.direction;
    let mouse = robot.getMousePos();
    if (dir == '^') {
        robot.moveMouse(mouse.x, mouse.y - STEP);
    } else if (dir == '<') {
        robot.moveMouse(mouse.x - STEP, mouse.y);
    } else if (dir == '>') {
        robot.moveMouse(mouse.x + STEP, mouse.y);
    } else if (dir == 's') {
        robot.moveMouse(mouse.x, mouse.y + STEP);
    }
    
});

// setInterval(() => {
//     screenshot().then(img => {
//         let buff = new Buffer(img);
//         let base64data = buff.toString('base64');
//         io.emit('image', base64data);
//     })
// }, 1000 / FPS);

io.sockets.on('connection', socket => {
    socket.on('position', data => {
        robot.moveMouse(data.x * 2, data.y * 4);
    });
    socket.on('click', data => {
        robot.mouseClick('left');
    });
    socket.on('rightclick', data => {
        robot.mouseClick('right');
    });
    socket.on('leftdown', data => {
        robot.mouseToggle('down', 'right');
    });
    socket.on('leftup', data => {
        robot.mouseToggle('up', 'right');
    });
    socket.on('keyDown', data => {
        console.log(data);
        try {
            robot.keyToggle(data.toLowerCase(), 'down');
        } catch (error) {
            return;
        }
    });
    socket.on('keyUp', data => {
        console.log(data);
        try {
            robot.keyToggle(data.toLowerCase(), 'up');
        } catch (error) {
            return;
        }
        
	});
});


server.listen(port, async () => {
    console.log(`Started`);
    const url = await ngrok.connect(3000);
    console.log(url);
});
