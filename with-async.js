var http = require('http');
var url = require('url');
var request = require('request');
var async = require('async');
var cheerio = require('cheerio');


http.createServer(function(req, res) {
    
    var pathName = url.parse(req.url,true).pathname;
    var query = url.parse(req.url,true).query;
    var template = `
        <html>
            <head></head>
            <body>

                <h1> Following are the titles of given websites: </h1>

                <ul>
                    {list}
                </ul>
            </body>
        </html> `;
    if(pathName === '/I/want/title/'){
        var q2=[]
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if(typeof query.address !== 'string') {
            query.address.forEach(function(element) {
                element = /^https?:\/\//.test(element) ? element : 'http://' + element;
                q2.push(element);
            }, this);
        } else{
            var formated = /^https?:\/\//.test(query.address) ? query.address : 'http://' + query.address;
                q2.push(formated);
        }
        list='';
        async.map(q2,
        function(item, callback){
            request(item, function(error, response, html){
                if(!error){
                    var html = cheerio.load(html);
                    callback(null, html('title').text());
                } else{ 
                    callback(null, null)
                }
            })
        },
        function(err, data){
            var list='';
            if(data.length>1){
                for (var index = 0; index < data.length; index++) {
                    var element = data[index];
                    list+= (element) ? `<li>${query.address[index]} - "${element}"</li>` : `<li>${query.address[index]} - "NO RESPONSE"</li>`;
                }
            }else{
                list+= (data[0]) ? `<li>${query.address} - "${data[0]}"</li>` : `<li>${query.address} - "NO RESPONSE"</li>`;                
            }
                res.end(template.replace("{list}", list))
        });      
    } else{
        res.writeHead(404);
        res.end();
    }
    
}).listen(1337, '127.0.0.1');