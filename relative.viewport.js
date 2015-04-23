/**
 * 屏幕自动适配 1.3
 */
(function () {
    if (window.Viewport && window.Viewport.isReady)return;
    window.Viewport = {isReady: false};
    var defaultWidth = 480;
    var ORIENTATION_CHANGE_DELAY = 230;
    var meta, metaContent = {
        width: defaultWidth, height: "device-height", targetDensitydpi: "device-dpi", userScalable: "no", maximumScale: 1, minimumScale: 1,
        toString: function () {
            var arr = [];
            for (var k in this) {
                var v = this[k];
                if (typeof v != "function") {
                    if (k.replace)k = k.replace(/([A-Z])/g, "-$1").toLowerCase();
                    arr.push(k + "=" + v);
                }
            }
            return arr.join(",");
        }, clone: function () {
            var clone = {};
            for (var k in this) {
                clone[k] = this[k];
            }
            return clone;
        }};

    var orientationchange = ("onorientationchange" in window) ? "orientationchange" : "resize";

    function getParameters() {
        var map = metaContent.clone();
        try {
            var scripts = document.getElementsByTagName("script");
            var content = scripts[scripts.length - 1].getAttribute("content");
            if (!content || content === "")return map;
            var kvs = content.split(",");
            for (var i = 0; i < kvs.length; i++) {
                var kv = kvs[i].split("=");
                var k = kv[0] || "", v = kv[1] || "";
                k = k.replace(/\-(\w)/g, function (all, letter) {
                    return letter.toUpperCase()
                });
                if (!isNaN(v))v = Number(v);
                map[k] = v;
            }
            return map;
        } catch (e) {
            console.error(e.message);
        }
        return map;
    }

    var platform = {
        isAndroid:/android/gi.test(navigator.appVersion),
        isIOS:/iphone|ipad|ipod|itouch/gi.test(navigator.appVersion),
        isIE:/MSIE/gi.test(navigator.appVersion)
    };

    function getAndroidVersion() {
        var ua = navigator.userAgent;
        var match = ua.match(/Android\s([0-9\.]*)/);
        return match ? match[1] : "";
    }

    function doAdapt() {
        metaContent = getParameters();
        if (platform.isAndroid) {
            AndroidAdapter();
        } else if (platform.isIOS) {
            IOSAdapter();
        } else if (platform.isIE) {
            WindowPhoneAdapter();
        } else {
            AndroidAdapter();
            console.warn("Can not identification device information in user agent,default use android adapter!");
        }
    }

    function IOSAdapter() {
        delete(metaContent.maximumScale);
        delete(metaContent.minimumScale);
        delete(metaContent.targetDensitydpi);
        delete(metaContent.height);
        metaContent.userScalable = "no";
        meta = getMetaTag();
        refreshMetaTag();
        function onFinish(){
            emitFinishEvent();
            window.removeEventListener("load",onFinish,false);
        }
        window.addEventListener("load",onFinish,false);
    }

    function AndroidAdapter() {
        var scale = getScale();
        metaContent.userScalable = "yes";
        metaContent.maximumScale = scale;
        metaContent.minimumScale = scale;
        var androidVersion = getAndroidVersion(),
            firstV = parseInt(androidVersion);
        if(androidVersion.match(/^(4\.4)/) || firstV>4){
            metaContent.height = undefined;
            delete (metaContent.height);
        }
        meta = getMetaTag();
        refreshMetaTag();
        function refreshViewPort(deviation) {
            var scale = getScale(deviation);
            metaContent.maximumScale = scale;
            metaContent.minimumScale = scale;
            refreshMetaTag();
        }

        function onOrientationChange() {
            setTimeout(function () {
                var orientation = getOrientation();
                if (orientation == currentOrientation) return;
                refreshViewPort();
                currentOrientation = orientation;
            }, ORIENTATION_CHANGE_DELAY);
        }

        window.addEventListener("load", function () {
            setTimeout(function(){
                refreshViewPort();
                emitFinishEvent();
            },0)
//          window.addEventListener(orientationchange, onOrientationChange, false);
        }, false);
    }

    function WindowPhoneAdapter() {
        metaContent.userScalable = "yes";
        metaContent.maximumScale = 1;
        metaContent.minimumScale = 1;
        metaContent.height = window.outerHeight;
        delete (metaContent.targetDensitydpi);
        meta = getMetaTag();
        refreshMetaTag();
        function onFinish(){
            emitFinishEvent();
            window.removeEventListener("load",onFinish,false);
        }
        window.addEventListener("load",onFinish,false);
    }

    function refreshMetaTag() {
        meta.setAttribute("content", metaContent.toString());
    }
    function getMetaTag() {
        var metaTags = document.getElementsByTagName("meta");
        var viewportTag;
        for (var i = 0; i < metaTags.length; i++) {
            if (metaTags[i].name === "viewport") {
                viewportTag = metaTags[i];
            }
        }
        if (!viewportTag) {
            document.write("<meta name='viewport' content='" + metaContent.toString() + "'>");
            return getMetaTag();
        }
        return viewportTag;
    }

    function getScale(deviation) {
        var WINDOW_WIDTH = platform.isIE ? window.screen.width : window.outerWidth
            , DEVICE_WIDTH = metaContent.width;
        var scale = WINDOW_WIDTH / DEVICE_WIDTH;
        if (!isNaN(deviation)) {
            scale = (WINDOW_WIDTH + deviation) / DEVICE_WIDTH;
        }
        return isNaN(scale) ? 1 : scale;
    }

    window.Viewport.setScale = function (max, min) {
        metaContent.maximumScale = parseFloat(max);
        metaContent.minimumScale = parseFloat(min);
        refreshMetaTag();
    };
    window.Viewport.setWidth = function (width) {
        metaContent.width = parseFloat(width);
        var scale = getScale();
        metaContent.maximumScale = parseFloat(scale);
        metaContent.minimumScale = parseFloat(scale);
        refreshMetaTag();
    };
    window.Viewport.setUserScalable = function (scalable) {
        metaContent.userScalable = scalable ? "yes" : "no";
        refreshMetaTag();
    };

    function emitFinishEvent() {
        window.Viewport.isReady = true;
        window.Viewport.content = metaContent;
        window.Viewport.target = meta;
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("viewportready", false, false);
        evt.data = window.Viewport;
        window.dispatchEvent(evt);
    }

    // 获取设备方向 0：未知，1：竖屏，2：横屏
    function getOrientation() {
        // 判断横竖屏
        if (platform.ios || platform.iPad || platform.iPhone) {
            if (Math.abs(window.orientation) == 90) {
                return 2;
            } else {
                return 1;
            }
        } else if (platform.android) {
            if (Math.abs(window.orientation) != 90) {
                return 2;
            } else {
                return 1;
            }
        }else if(platform.trident){
            return window.screen.height > window.screen.width ? 1 : 2;
        }
        return 0;
    }

    var currentOrientation = getOrientation();
    doAdapt();
})();