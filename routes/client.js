var sys=    require('sys')
  , exec=   require('child_process').exec;
  
var pre_path = "/client";
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
            "url":  pre_path
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
                "url":  pre_path + this_folder
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
            info['ln'] = {
                "name":     ln,
                "target":   getDetailPath(rest, path)
            };
        }
    }
    return info;
}

exports.test = function(req, res){
    var path = req.url.substring(pre_path.length);
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
                
                rest = rest.substr(1);
                
                var url;
                if(name == '.')url = path;
                else if(name == '..'){
                    if(matches = path.match('[^/]+$')){
                        url = path.substr(0, path.length - matches[0].length -1 );
                    }
                    else url = path
                }
                else url = path + "/" + name;
                
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
                    "url":  pre_path + url,
                    "info": info
                };
            }
            
            res.render('client', {
                "total":        total,
                "path":         path,
                "path_detail":  path_detail,
                "items":        items,
            });
        });
    });
}
