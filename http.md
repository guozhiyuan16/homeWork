### 问题
- Node中除了try catch 还能怎么捕获错误？

## http 请求头常用方法总结

### Accept-Language 实现多语言切换功能
- 服务端配置多语言（根据路径不同返回不同的语言）
    - 获取到请求头中的Accept-Language => zh-CN,zh;q=0.9
    - 'zh-CN,zh;q=0.9' => [{name:'zh-CN',q:1},{name:'zh',q:0.9}]
    - 循环每一项 如果在对象中找到那一项就返回 结束循环，否则走默认
    
### 缓存    

Last-Modified(第一次请求后台设置) --->(浏览器转换)--->  if-modified-since（后面请求拿此参数对比）

Etag(第一次请求后台设置) --->(浏览器转换)---> if-none-match （后面请求拿此参数对比）

#### 强制缓存
```
res.setHeader('Cache-Control','max-age=10');  // Chrome
res.setHeader('Exipres',new Date(Date.now()+10*1000).toLocaleString()); // IE 绝对时间
```

#### 对比缓存

- Last-Modified:ctime  if-modified-since

```
  // 第一次访问的时候 要给浏览器加一个头 last-modified
  // 第二请求的时候 会自动带一个头 if-modified-since 
  // 如果当前带过来的头和文件当前的状态有出入 说明文件被更改了（时间变了但是内容没更改 会出现再次访问文件的问题）

```

- Etag  if-none-match

```
  // 第一次访问 给你一个文件的签名 Etag:各种
  // 下次你再来访问 会带上这个标签 if-none-match
  // 我在去拿文件当前的内容 在生成一个标签 如果相等 返回304即可(读文件)

```
##### 为什么用这个？
 一些文件也许会周期性的更改，但是他的内容并不改变(仅仅改变的修改时间)，这个时候我们并不希望客户端认为这个文件被修改了，而重新GET;
 
 某些文件修改非常频繁，比如在秒以下的时间内进行修改，(比方说1s内修改了N次)，If-Modified-Since能检查到的粒度是s级的，这种修改无法判断(或者说UNIX记录MTIME只能精确到秒)
 
 某些服务器不能精确的得到文件的最后修改时间；
    
##### 缺点
 每次创建签名都需要把文件读取出来，如果遇到大点的文件会浪费性能 --->根据文件大小 30字节+ 文件的修改时间 = etag    
    
    
### 206 断点续传 Range    