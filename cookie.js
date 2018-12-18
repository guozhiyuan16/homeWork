let http = require('http');
let querystring = require('querystring');
let crypto = require('crypto');
http.createServer((req,res)=>{
    //req.cookies = req.headers['cookie']; // {name:123,age:9}
    let cookies = req.headers['cookie']; // 字符串
    req.cookies = querystring.parse(cookies,'; ','='); // 转成对象

    // 签名后的结果
    req.signedCookie = function(key){
        let [k,sign] = req.cookies[key].split('.'); // 分别拿到key sign
        let newSign = crypto.createHmac('sha256','zfpx').update(k).digest('base64').replace(/\+/g,'') // 根据key再签一次名
        if(sign === newSign){ // 相等说明可靠
            return k
        }else{
            return ''
        }
    };

    let arr = [];
    res.setCookie = function(key,val,opts = {}){ // 设置多个需要用数组否则会覆盖
        if(opts.signed){
            val = val+'.'+crypto.createHmac('sha256','zfpx').update(val).digest('base64').replace(/\+/g,'')
        }
        let str = `${key}=${val}`;
        if(opts.maxAge){
            str+=`;max-age=${opts.maxAge}`
        }
        arr.push(str);

        res.setHeader('Set-Cookie',arr)
    }

    console.log(req.cookies)

    if(req.url === '/read'){
        //res.end(req.headers['cookie'])
        res.end(req.signedCookie('name'))
    }
    if(req.url === '/write'){
       // res.setHeader('Set-Cookie','name=zfpx')  //设置单个
       // res.setHeader('Set-Cookie',['name=zfpx;max-age=10;domain=','age=9']);
       // res.setHeader('Set-Cookie',['name=zfpx;httpOnly=true','age=9']);

        res.setCookie('name','zfpx',{signed:true})

        res.end('write ok')
    }
}).listen(3000);