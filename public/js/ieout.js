function BrowserType() {
    var userAgent = navigator.userAgent;
    var isOpera = userAgent.indexOf("Opera") > -1; 
    var isIE = window.ActiveXObject || "ActiveXObject" in window
    var isEdge = userAgent.indexOf("Edge") > -1; 
    var isFF = userAgent.indexOf("Firefox") > -1; 
    var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; 
    var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1 && !isEdge; 

    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (userAgent.indexOf('MSIE 6.0') != -1) {
            return "IE6";
        } else if (fIEVersion == 7) { return "IE7"; }
        else if (fIEVersion == 8) { return "IE8"; }
        else if (fIEVersion == 9) { return "IE9"; }
        else if (fIEVersion == 10) { return "IE10"; }
        else if (userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)) {
            return "IE11";
        }
        else { return "0" }
    }

    if (isFF) { return "Firefox"; }
    if (isOpera) { return "Opera"; }
    if (isSafari) { return "Safari"; }
    if (isChrome) { return "Chrome"; }
    if (isEdge) { return "Edge"; }
}

if(BrowserType().indexOf('IE')>-1)alert('本系統不支援IE瀏覽器，請使用Google Chrome, Firefox, Edge進行瀏覽')