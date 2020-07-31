const file = require('./file');

let router = {}

let api = (path, action) => router[path] = action

api('/test', (req, res, callback) => {
    console.log('req.query', req.query)
    console.log('req.body', req.body)
    callback({ ip: req.ip })
})

api('/index.html', (req, res, callback) => {
    let dist = file.getJSON('./files/dist.json')
    res.html({obj: dist})
})

module.exports = router