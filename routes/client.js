var sys=    require('sys')
  , exec=   require('child_process').exec;
  
var prepath_explorer=   "/explorer";
var prepath_view=       "/view";
var prepath_download=   "/download";

var Regex = {
    "FileName": "((\\d|\\w|-|_|\\.|:)+(\\d|\\w|-|_|\\.| |:)*)*(\\d|\\w|-|_|\\.|:)"
}

function deletePreSpace(str){
    matches = str.match('[ ]+');
    return str.substr(matches[0].length);
}

function getDetailPath(path, this_folder){
    var urls = [];
    var rest = path;
    
    if(rest.substr(0, 1) == "\/" || typeof this_folder === "undefined"){
        rest = rest.substr(1,rest.length-1);
        this_folder = "";
        urls.push({
            "name": "root",
            "url":  ""
        });
        if(rest != ""){
            urls.push({
                "name": "/"
            });
        }
    }
    
    while(matches = rest.match('[^\/]+|\/')){
        rest = rest.substr(matches[0].length);
        name = matches[0].substr(0, matches[0].length);
        var str = matches[0];
        if(str == "\/"){
            urls.push({
                "name": str
            });
        }
        else{
            if(str == ".."){
                if(matches = this_folder.match('[^\/]+$')){
                    this_folder = this_folder.substr(0, this_folder.length - matches[0].length - '/'.length);
                }
            }
            else if(str != ".")
                this_folder += "/" + str;
            urls.push({
                "name": str,
                "url":  this_folder
            });
        }
    }
    
    return urls;
}

function getInfo(mod, name, path){
    var info = {};
    info["type"] = mod.substr(0,1);
    if(info.type == "l"){
        if(matches = name.match('^' + Regex.FileName + ' -> ')){
            var rest = name.substr(matches[0].length);
            var ln = matches[0].substr(0, matches[0].length - " -> ".length);
            var detail_path = getDetailPath(rest, path);
            info['ln'] = {
                "name":     ln,
                "path":     detail_path,
                "target":   detail_path[detail_path.length-1].url
            };
        }
    } else if (info.type == "d" || info.type == "-"){
        var url;
        if(name == '.')url = path;
        else if(name == '..'){
            if(matches = path.match('[^/]+$')){
                url = path.substr(0, path.length - matches[0].length -1 );
            }
            else url = path
        }
        else if(info.type == "-" && name.substr(0, 2) == "//"){
            url = name.substr(1, name.length-1);
        }
        else url = path + "/" + name;
        if(info.type == "d"){
            info['dir'] = {
                "url":  url
            };
        }
        else if (info.type == "-"){
            info['file'] = {
                "url":  url
            };
        }
    }
    return info;
}

exports.explorer = function(req, res){
    var path = req.url.substring(prepath_explorer.length);
    if(path.substr(path.length -1) == "/")
        path = path.substr(0, path.length-1);
    var child=  exec("pwd /" + path, function (pwd_error, pwd_stdout, pwd_stderr) {
        var child=  exec("dir /" + path + " -al", function (ll_error, ll_stdout, ll_stderr) {
            rest = ll_stdout;
            
            //  PATH
            var path_detail = getDetailPath(path);
            
            //  TOTAL
            if(matches = rest.match('total \\d+\n')){
                rest = rest.substr(matches[0].length);
                matches = matches[0].match('\\d+');
                var total = matches[0];
            }
            
            //  ITEMS
            var items = {};
            while(matches = rest.match('(c|d|r|w|x|-|l|T){10}')){
                rest = rest.substr(matches[0].length);
                var mod = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('\\d+');
                rest = rest.substr(matches[0].length);
                var tmp = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('(\\d|\\w|-|_)+');
                rest = rest.substr(matches[0].length);
                var user = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('(\\d|\\w|-|_)+');
                rest = rest.substr(matches[0].length);
                var group = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('(\\d+, *)*\\d+');
                rest = rest.substr(matches[0].length);
                var size = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('\\w+');
                rest = rest.substr(matches[0].length);
                var month = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('\\d+');
                rest = rest.substr(matches[0].length);
                var date = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('(\\d+:\\d+)|\\d+');
                rest = rest.substr(matches[0].length);
                var time = matches[0];
                
                rest = deletePreSpace(rest);
                
                matches = rest.match('[^\n]+');
                rest = rest.substr(matches[0].length);
                var name = matches[0];
                
                rest = rest.substr(1);  //  DELETE '\n'
                
                info = getInfo(mod, name, path);
                
                items[name] = {
                    "mod":  mod,
                    "tmp":  tmp,
                    "user": user,
                    "group":group,
                    "size": size,
                    "month":month,
                    "date": date,
                    "time": time,
                    "info": info
                };
            }
            
            res.render('client', {
            
                //  PREPATH
                "prepath_explorer":   prepath_explorer,
                "prepath_view":       prepath_view,
                "prepath_download":   prepath_download,
            
                //  THIS PAGE
                "total":        total,
                "path":         path,
                "path_detail":  path_detail,
                
                //  ITEMS
                "items":        items
            });
        });
    });
}

exports.view = function(req, res){
    var path = req.url.substring(prepath_view.length);
    var detail_path = getDetailPath(path);
    var str = "<html>";
    str +=  "<head>"
        +   "<title>"
        +   path
        +   "</title>"
        +   "</head>"
        +   "<body>"
        +   "<pre>"
        +   "<code>";
    for( var i in detail_path){
        if(typeof detail_path[i].url !== "undefined")
            str += "<a href = '" + prepath_explorer + detail_path[i].url + "'>";
        str += detail_path[i].name;
        if(typeof detail_path[i].url !== "undefined")
            str += "</a>";
    }
    str += "<br />"
        +   "<a href = '"
        +   prepath_download + path
        +   "'/>"
        +   "Download"
        +   "</a>"
        +   "<br />";
    var fs = require('fs');
    fs.readFile('/home/v/project/ruby/ri20min.rb', function (err, data) {
        if (err)
            throw err;
        str +=  data
            +   "</code>"
            +   "</pre>"
            +   "</body>"
            +   "</html>";
        res.end(str);
    });
}

exports.download = function(req, res){
    var path = req.url.substring(prepath_download.length);
    var fs = require('fs');
    var fileStream = fs.createReadStream(path);
    fileStream.pipe(res);
}