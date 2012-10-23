var sys=    require('sys')
  , exec=   require('child_process').exec

function deletePreSpace(str){
    matches = str.match('[ ]+');
    return str.substr(matches[0].length);
}

function getInfoByMod(mod){
    var info = {};
    info["type"] = mod.substr(0,1);
    return info;
}

exports.test = function(req, res){
    var path = req.url.substring(7);
    console.log(path);
    var child=  exec("cd /" + path, function (cd_error, cd_stdout, cd_stderr) {
        console.log('stdout: ' + cd_stdout);
        console.log('stderr: ' + cd_stderr);
        var child=  exec("pwd /" + path, function (pwd_error, pwd_stdout, pwd_stderr) {
            var child=  exec("dir /" + path + " -al", function (ll_error, ll_stdout, ll_stderr) {                    
                    rest = ll_stdout;
                    
                    matches = rest.match('total \\d+\n');
                    rest = rest.substr(matches[0].length);
                    matches = matches[0].match('\\d+');
                    var total = matches[0];
                    
                    var items = {};
                    
                    while(matches = rest.match('(d|r|w|x|-|l){10}')){
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
                        if(name == '.')url = "";
                        else if(name == '..'){
                            if(matches = path.match('\/(\\w|\\d)+$')){
                                console.log(matches[0]);
                                console.log(matches[0].length);
                                url = "/client" + path.substr(0, path.length - matches[0].length);
                                console.log(url);
                            }
                        }
                        else url = "/client" + path + "/" + name;
                        
                        info = getInfoByMod(mod);
                        
                        items[name] = {
                            "mod":  mod,
                            "tmp":  tmp,
                            "user": user,
                            "group":group,
                            "size": size,
                            "month":month,
                            "date": date,
                            "time": time,
                            "url":  url,
                            "info": info
                        };
                    }
                    
                    out = ll_stdout.replace(/\n/g, '<br />');
                    if(ll_error !== null) {
                        console.log('exec error: ' + ll_error);
                    }
                    res.render('client', {
                        total:  total,
                        path:   path,
                        items:  items,
                        out:    out
                    });
            });
        });
    });
}
