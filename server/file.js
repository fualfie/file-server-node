const fs = require('fs');
const crypto = require('crypto');
module.exports = {
    list: (dirname, extname) => {
        if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, 0777);
        let tmp = []
        fs.readdirSync(dirname).forEach(file => {
            if (extname) {
                if (file.slice(file.lastIndexOf('.') + 1) == extname) {
                    tmp.push({
                        name: file,
                        filename: file.slice(0, file.lastIndexOf('.')),
                        extname: file.slice(file.lastIndexOf('.') + 1),
                        mtime: fs.statSync(dirname + '/' + file).mtime
                    })
                }
            } else {
                tmp.push({
                    name: file,
                    filename: file.slice(0, file.lastIndexOf('.')),
                    extname: file.slice(file.lastIndexOf('.') + 1),
                    mtime: fs.statSync(dirname + '/' + file).mtime
                })
            }
        });
        if (Array.isArray(tmp)) tmp = tmp.sort((a, b) => (new Date(a.mtime) > new Date(b.mtime)) ? -1 : ((new Date(b.mtime) > new Date(a.mtime)) ? 1 : 0));
        return tmp
    },
    read: (dirname, filename) => {
        let file = null
        try {
            file = fs.readFileSync(dirname + '/' + filename, 'utf-8')
        } catch (error) {
            file = null
        }
        return file
    },
    write: (dirname, filename, file) => {
        if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, 0777);
        fs.writeFileSync(dirname + '/' + filename, file)
    },
    delete: (dirname, filename) => {
        try {
            fs.unlinkSync(dirname + '/' + filename)
        } catch (error) {

        }
    },
    getJSON: (pathname) => {
        let file = {}
        try {
            file = JSON.parse(fs.readFileSync(pathname, 'utf-8') || '{}')
        } catch (error) {
            file = {}
        }
        return file
    },
    setJSON: (pathname, obj) => {
        try {
            let dirname = pathname.slice(0, pathname.lastIndexOf('/'))
            if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, 0777);
            fs.writeFileSync(pathname, JSON.stringify(obj))
            return true
        } catch (error) {
            return false
        }
    },
    filename: (fullname) => fullname.slice(0, fullname.lastIndexOf('.')),
    extname: (fullname) => fullname.slice(fullname.lastIndexOf('.')),
    mime: (fullname) => {
        let extname = fullname.slice(fullname.lastIndexOf('.'))
        let contentType = '';
        switch (extname) {
            case '.html':
                contentType = 'text/html';
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.ico':
                contentType = 'image/x-icon';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.txt':
                contentType = 'text/plain';
                break;
            case '.csv':
                contentType = 'text/csv';
                break;
            case '.xlsx':
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case '.xls':
                contentType = 'application/vnd.ms-excel';
                break;
            case '.zip':
                contentType = 'application/zip';
                break;
            case '.xml':
                contentType = 'application/xml';
                break;
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.mp4':
                contentType = 'video/mp4';
                break;
            case '.json':
            default:
                contentType = 'application/json';
                break;
        }
        return contentType
    },
    cryptoName: (length = 16) =>  crypto.randomBytes(length).toString('hex'),
    randomName: (length = 8) => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < (length); i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },
}