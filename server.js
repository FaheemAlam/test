var http = require('http');
var url = require('url');
var noodle = require('noodlejs');


http.createServer(function(req, res) {
    
    var pathName = url.parse(req.url,true).pathname;
    var query = url.parse(req.url,true).query;
    var html = `
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
                q2.push({url:element,selector:'title',cache:false});
            }, this);
        } else{
            var formated = /^https?:\/\//.test(query.address) ? query.address : 'http://' + query.address;
                q2.push({url:formated,selector:'title',cache:false});
        }
        
        
        noodle.query(q2).then(function (data) {
            var list='';
            console.log(data);
            if(data.results.length>1){
                for (var index = 0; index < data.results.length; index++) {
                    var element = data.results[index];
                    list+= (element.results.length) ? `<li>${query.address[index]} - "${element.results[0]}"</li>` : `<li>${query.address[index]} - "NO RESPONSE"</li>`;
                }
            }else{
                list+= (data.results[0].results.length) ? `<li>${query.address} - "${data.results[0].results[0]}"</li>` : `<li>${query.address} - "NO RESPONSE"</li>`;                
            }
                res.end(html.replace("{list}", list))
                
                
                
        });        
    } else{
        res.writeHead(404);
        res.end();
    }
    
}).listen(1337, '127.0.0.1');