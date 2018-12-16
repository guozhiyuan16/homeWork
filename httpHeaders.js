let http = require('http');
let url = require('url');
let fs = require('fs');
let path = require('path');
let mime = require('mime');
let {promisify} = require('util');
let stat = promisify(fs.stat);
let access = promisify(fs.access);
let crypto = require('crypto');
let readFile = promisify(fs.readFile);

let port = 3000;

// let obj = {
//     'zh-CN': {
//         data: '你好,世界'
//     },
//     'en': {
//         data: 'hello,world'
//     },
//     ja: {
//         data: 'こんにちは、世界'
//     }
// }
// let defaultLanguage = 'en';

let server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Exipres', new Date(Date.now() + 30 * 1000).toLocaleString());
    //let lan = req.headers['accept-language'];  //zh-CN,zh;q=0.9
    // if(lan){
    //     let lans = lan.split(',') // [ zh-CN, zh;q=0.9]
    //         lans = lans.map(l=>{
    //         let [name,q=1] = l.split(';'); //name:zh-Cn,q=q?1
    //             console.log(name,q);
    //         return {
    //             name,
    //             q:q===1?1:Number(q.split('=')[1])
    //         }
    //     }).sort((a,b)=>b.q- a.q); // 根据权重排序  [ { name: 'zh-CN', q: 1 }, { name: 'zh', q: 0.9 } ]
    //
    //     lans.forEach(lan=>{
    //         let lanName = lan.name;
    //         if(obj[lanName]){
    //             res.end(obj[lanName].data);
    //         }
    //     });
    //     res.end(obj[defaultLanguage].data); // 找不到默认语言
    // }else{
    //     res.end(obj[defaultLanguage].data);
    //}

    let {pathname} = url.parse(req.url);

    let realPath = path.join(__dirname, pathname);

    if(pathname ==='/favicon.ico'){
        return res.end()
    }

    // 静态服务
    try {
        let statObj = await stat(realPath);
        if (statObj.isFile()) {
            // let prev = req.headers['if-modified-since'];
            // let current = statObj.ctime.toLocaleString();
            //
            // if (prev === current) {
            //     res.statusCode = 304;
            //     res.end();
            // } else {
            //     res.setHeader('Last-Modified', statObj.ctime.toLocaleString());
            //     res.setHeader('Content-Type', mime.getType(realPath) + ';charset=utf-8');
            //     fs.createReadStream(realPath).pipe(res);
            // }

            // let content = await readFile(realPath);
            // let sign = crypto.createHash('md5').update(content).digest('base64');

            let sign = statObj.ctime.toLocaleString().split(',').join('')+'_'+statObj.size;

            console.log(sign);
            let ifNoneMatch = req.headers['if-none-match'];
            if(ifNoneMatch === sign){
                res.statusCode = 304;
                res.end()
            }else{
                res.setHeader('Etag',sign);
                res.setHeader('Content-Type', mime.getType(realPath) + ';charset=utf-8');
                fs.createReadStream(realPath).pipe(res);
            }

        } else {
            let p = path.join(realPath, 'index.html');
            res.setHeader('Content-Type', 'text/html;charset=utf-8');
            fs.createReadStream(p).pipe(res);
        }
    } catch (e) {
        res.statusCode = 404;
        res.end(`Not found`)
    }

});


server.listen(port, () =>
    console.log(`服务已经启动在${port}`)
);

// 服务端口被占用后端口加1启动服务
server.on('error', (err) => {
    if (err && err.errno === 'EADDRINUSE') {
        port++;
        server.listen(port);
    }
});