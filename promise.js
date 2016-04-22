var http = require('http');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var q = require('q');


function getData(query, formated, deferred) {
    request(formated, function(error, response, html){
        if(!error){
            var html = cheerio.load(html);
            deferred.resolve(`${query} - "${html('title').text()}"`);
        } else{ 
            deferred.resolve(`${query} - "NO RESPONSE"`);
        }
    })
}

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
        var promises=[]
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if(typeof query.address !== 'string') {
            query.address.forEach(function(element, i) {        
                var deferred = q.defer();
                var formated = /^https?:\/\//.test(element) ? element : 'http://' + element;
                getData(element, formated, deferred)
                promises.push(deferred.promise);
            }, this);
        } else{
            var deferred = q.defer();
             var formated = /^https?:\/\//.test(query.address) ? query.address : 'http://' + query.address;
                getData(query.address, formated, deferred);
                promises.push(deferred.promise);
        }
        
        list='';
        q.all(promises).then(function (result) {
            console.log(result)
            result.forEach(function(title) {
                list+=`<li>${title}</li>`;
            }, this);
            res.end(template.replace("{list}", list))
        }).fail(function (error) {
            res.writeHead(404);
            res.end("Some error occur");
        });
           
    } else{
        res.writeHead(404);
        res.end();
    }
    
}).listen(1337, '127.0.0.1');