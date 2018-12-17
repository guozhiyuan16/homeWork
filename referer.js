let fs = require('fs');
let path = require('path');
let url = require('url');
let http = require('http');
let util = require('util');
let stat = util.promisify(fs.stat);


let whiteList = [
    'localhost:3000'
]
http.createServer(async (req,res)=>{
    let {pathname} = url.parse(req.url,true);
    if(pathname === '/'){
        return fs.createReadStream(path.join(__dirname,'index.html')).pipe(res);
    }

    let realPath = path.join(__dirname,pathname);
    let referer = req.headers['referer'];
    try {
        let statObj = await stat(realPath);
        //console.log('statObj',statObj)
        if(referer){ // 校验引用来源
            // 获取到当前图片的referer http://video.baidu.com
            let r = url.parse(referer).host;
            // 取得当前图片的主机
            let h = req.headers['host'];
            console.log(r,h);
            if(r===h ||whiteList.includes(r)){
                fs.createReadStream(path.join(__dirname, '1.jpg')).pipe(res);
            }else{
                fs.createReadStream(path.join(__dirname, '2.jpg')).pipe(res);
            }

        }else{
            fs.createReadStream(path.join(__dirname, '1.jpg')).pipe(res);
        }


    }catch (e) {
        res.statusCode = 404;
        res.end('Not found')
    }


}).listen(3000)