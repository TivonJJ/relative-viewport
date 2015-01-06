(function (window) {
    var option = {
        host:null,
        port:8081,
        client:"anonymous",
        debugModel:true
    };
    var scriptPath = "/target/target-script-min.js";
    var debugXMLPath = "../xdebug.xml";
    function Debugger(host, port, client) {
        this.run = function(host, port, client){
            _applyOption(host, port, client);
            this.host = option.host;
            this.port = option.port;
            this.client = option.client;
            _importDebugTag(this.host,this.port,this.client);
        };
        this.reload = function(){
            location.reload();
        };
        this.log = function(msg){
            if(!option.debugModel)return;
            if(console.debug){
                console.debug(msg);
            }else{
                console.log(msg);
            }
        };
        if(host && typeof host == "string"){
            this.run(host,port,client);
        }
        function _importDebugTag(host, port, client){
            if(!host || !option.debugModel)return;
            var url = host + ":" + port + scriptPath + "#" + client;
            var head = document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            head.appendChild(script);
        }
        function _applyOption(host, port, client) {
            if (host) {
                if (/^http:\/\/|^https:\/\//.test(host)) {
                    option.host = host;
                } else {
                    option.host = "http://" + host;
                }
            }
            if (!isNaN(port)) {
                option.port = port;
            }
            if (client && typeof  client == "string") {
                option.client = client;
            }
        }
    }

    function loadOption(complete,error){
        var options = {};
        var scripts = document.getElementsByTagName("script");
        var s = scripts[scripts.length-1];
        var host = s.getAttribute("host");
        if(host){
            var port = s.getAttribute("port");
            var client = s.getAttribute("client");
            if (/^http:\/\/|^https:\/\//.test(host)) {
                options.host = host;
            } else {
                options.host = "http://" + host;
            }
            if(typeof port == "number"){
                options.port = port;
            }
            if(client){
                options.client = client;
            }
            options.debugModel = s.getAttribute("debug");
            complete(options);
            return;
        }
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET",debugXMLPath,true);
        xmlHttp.onreadystatechange=function(){
            if(xmlHttp.readyState == 4){
                try{
                    var xml = xmlHttp.responseXML;
                    var root = xml.documentElement;
                    for(var i=0;i<root.childNodes.length;i++){
                        var node = root.childNodes[i];
                        if(node.nodeType == 1){
                            options[node.nodeName] = trimStr(node.textContent);
                        }
                    }
                    complete(options);
                }catch (e){
                    error(e);
                }
            }
        };
        xmlHttp.send(null);

        function trimStr(str){
            return str.trim?str.trim():str.replace(/(^\s*)|(\s*$)/g, "");
        }
    }
    window.xDebug = new Debugger();
    loadOption(function(options){
        option.debugModel = options.debugModel != "false";
        window.xDebug.run(options.host,options.port,options.client);
    },function(e){
        console.error("load "+debugXMLPath+" fail. stack:"+ e.message);
    });
})(this);