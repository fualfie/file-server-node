const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path')
const Buffer = require('buffer').Buffer;
const file = require('./server/file');
const api = require('./server/api');
const log = require('./server/log');

let address = '0.0.0.0';
let port = 3000;

function parseFile(req, res) {
    req.setEncoding('binary');
    var body = '';
    req.on('data', function (chunk) {
        body += chunk;
    });

    req.on('end', function () {
        let arr = body.split('\r\n')
        let fileName = arr[1].substring(arr[1].indexOf("filename=")).split('"')[1]
        let binaryData = arr.slice(4, arr.length - 2).join('\r\n')
        let contentType = file.mime(fileName)

        let fileDir = ''
        if (/image/.test(contentType)) {
            fileDir = './files/images/'
        } else if (/video/.test(contentType)) {
            fileDir = './files/videos/'
        } else {
            fileDir = './files/document/'
        }

        let time = new Date().getTime()
        fs.writeFile(fileDir + time + '-' + fileName, binaryData, 'binary', function (err) {
            let book = {
                link: file.randomName(8),
                file: fileName,
                time: time,
                from: req.ip,
                contentType: contentType
            }
            res.json({ stat: 'success', link: book.link })
            let library = file.getJSON(__dirname + '/files/dist.json')
            library[book.link] = book
            file.setJSON(__dirname + '/files/dist.json', library)
        });
    });
}

let route = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "'POST, GET, PUT, DELETE, OPTIONS'");
    res.setHeader("Access-Control-Allow-Credentials", true);

    req.ip = (req.headers['x-forwarded-for'] || '').split(',').pop() || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    let redirect = ['/', '/server.js'];
    let pathname = url.parse(decodeURI(req.url), true).pathname;
    req.pathname = redirect.includes(pathname) ? '/index.html' : pathname;
    req.query = url.parse(decodeURI(req.url), true).query;

    res.json = (obj) => {
        let ans = '';
        try {
            ans = JSON.stringify(obj || {});
        } catch (error) {
            ans = '{}';
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(ans);
        res.end();
    }

    res.html = (data, filePath, contentType) => {
        filePath = filePath || `${__dirname}/public${req.pathname}`
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404);
                    res.end('Sorry, not found');
                } else {
                    res.writeHead(500);
                    res.end('Sorry, system error');
                }
            } else {
                contentType = contentType || file.mime(req.pathname)
                if (contentType == 'text/html') {
                    let values = []
                    data = Object.assign({
                        query: req.query,
                    }, data || {})
                    for (let key in data) {
                        let json = JSON.stringify(data[key]);
                        while (json && json.match(/<\/?script[^>]*>/i)) {
                            json = json.replace(/<\/?script[^>]*>/ig, '')
                        }
                        values.push(`data.${key} = ${json};`);
                    }
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(Buffer.from(content.toString('utf-8').replace('//data//', values.join('\n\t'))), 'utf-8');
                } else if (contentType == 'image/jpeg' && req.query.preview) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0;"><img src="data:image/jpeg;base64,')
                    res.write(Buffer.from(content).toString('base64'));
                    res.end('" width="100%"/></body></html>');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            }
        });
    }

    //upload api
    if (req.pathname.includes('_upload')) return parseFile(req, res)

    let body = [];

    req.on('data', function (data) {
        body.push(data);
    });

    req.on('end', function () {
        console.log(new Date().toLocaleString('zh', { hour12: false }) + ' ' + req.pathname + ' ' + req.ip)
        req.raw = Buffer.concat(body);
        try {
            req.body = JSON.parse(req.raw.toString() || '{}');
        } catch (error) {
            req.body = {}
        }
        let call = api[req.pathname];
        if (call) {
            call(req, res, (obj) => res.json(obj || {}));
        } else {
            let contentType = ''
            let filePath = ''
            let library = file.getJSON(__dirname + '/files/dist.json')
            let book = library[req.pathname.substring(1)]
            if (book) {
                contentType = file.mime(book.file)
                if (contentType.includes('image')) {
                    filePath = `${__dirname}/files/images/${book.time}-${book.file}`
                } else if (contentType.includes('video')) {
                    filePath = `${__dirname}/files/videos/${book.time}-${book.file}`
                } else {
                    filePath = `${__dirname}/files/document/${book.time}-${book.file}`
                }
            }
            res.html({}, filePath, contentType)
        }
    });
}

let server = http.createServer((req, res) => route(req, res)).listen(port, address, () => console.log(`Http server start on ${server.address().address}:${server.address().port}`))
