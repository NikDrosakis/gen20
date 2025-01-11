/*
JS library of gaia systems gs.js
vanilla javascript
from gaia.js
embedded to the start of the body before PHP encode G OBJECT
in any gaia system
adapted from gaia.js $.ajax,$.post.$.get replaced with FETCH()
no jquery, no bookstrap
* * PROPERTIES
-  basic added coo, ses,loc
- workers
- soc
- api
- apy
- callapi
- loadCumbo
- loadfile
- ui
- form
- activity
-login
-register
-logout
* DEPENDENCIES from cdns
- Sweetalert2 > gs.success, gs.fail
- Sortable

* * */
var gs= {
    /*
    * BASIC
    * */
    greeklish : function (str) {
        var str = str.replace(/[\#\[\]\/\{\}\(\)\*\<\>\%\@\:\>\<\~\"\'\=\*\+\!\;\-\,\?\.\\\^\$\|]/g, "_");
        var greekLetters = [' ', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'A', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω', 'ά', 'έ', 'ή', 'ί', 'ό', 'ύ', 'ώ', 'ς'];
        var enLetters = ['_', 'a', 'v', 'g', 'd', 'e', 'z', 'i', 'th', 'i', 'k', 'l', 'm', 'n', 'x', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ps', 'o', 'A', 'B', 'G', 'D', 'E', 'Z', 'I', 'Th', 'I', 'K', 'L', 'M', 'N', 'X', 'O', 'P', 'R', 'S', 'T', 'Y', 'F', 'Ch', 'Ps', 'O', 'a', 'e', 'i', 'i', 'o', 'u', 'o', 's'];
        return gs.str_replace(greekLetters, enLetters, str);
    },
    iconic: function (n){if(!!n){return n.includes("icon_") ? n : (n.includes("uploads") ? n.replace("uploads/","uploads/thumbs/icon_"):G.UPLOADS+n)}else{return '/img/noimage.jpg';}},
    str_replace:function(search, replace, subject) {
        if (!Array.isArray(search) || !Array.isArray(replace) || search.length !== replace.length) {
            throw new Error("Search and replace arrays must be of the same length");
        }
        let result = subject;
        for (let i = 0; i < search.length; i++) {
            result = result.split(search[i]).join(replace[i]);
        }
        return result;
    },
    isjson: (str) => {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;  // Return false if it's not JSON
        }
    },
    getAllStyles: function(element) {
    const paginationElement = document.querySelector(element);
    if (!paginationElement) {
        console.error('Element #pagination not found');
        return {};
    }

    const stylesMap = {};

    // Recursive function to process elements
    function processElement(el) {
        // Get computed styles of the element
        const computedStyles = window.getComputedStyle(el);
        const styles = {};

        // Iterate over all computed style properties
        for (let property of computedStyles) {
            styles[property] = computedStyles.getPropertyValue(property);
        }

        // Create a unique identifier for the element
        const identifier = el.id
            ? `#${el.id}`
            : el.className
                ? `.${el.className.split(' ').join('.')}`
                : el.tagName;

        // Save the element's styles
        stylesMap[identifier] = {
            tagName: el.tagName,
            id: el.id || null,
            className: el.className || null,
            styles: styles,
        };

        // Process child elements recursively
        Array.from(el.children).forEach(child => processElement(child));
    }

    // Start processing from the root pagination element
    processElement(paginationElement);

    return stylesMap;
},
    date : function (format, timestamp) {
        var that = this;
        var jsdate, f;
        // Keep this here (works, but for code commented-out below for file size reasons)
        // var tal= [];
        var txt_words = [
            'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        // trailing backslash -> (dropped)
        // a backslash followed by any character (including backslash) -> the character
        // empty string -> empty string
        var formatChr = /\\?(.?)/gi;
        var formatChrCb = function (t, s) {
            return f[t] ? f[t]() : s;
        };
        var _pad = function (n, c) {
            n = String(n);
            while (n.length < c) {
                n = '0' + n;
            }
            return n;
        };
        f = {
            // Day
            d: function () { // Day of month w/leading 0; 01..31
                return _pad(f.j(), 2);
            },
            D: function () { // Shorthand day name; Mon...Sun
                return f.l()
                    .slice(0, 3);
            },
            j: function () { // Day of month; 1..31
                return jsdate.getDate();
            },
            l: function () { // Full day name; Monday...Sunday
                return txt_words[f.w()] + 'day';
            },
            N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
                return f.w() || 7;
            },
            S: function () { // Ordinal suffix for day of month; st, nd, rd, th
                var j = f.j();
                var i = j % 10;
                if (i <= 3 && parseInt((j % 100) / 10, 10) == 1) {
                    i = 0;
                }
                return ['st', 'nd', 'rd'][i - 1] || 'th';
            },
            w: function () { // Day of week; 0[Sun]..6[Sat]
                return jsdate.getDay();
            },
            z: function () { // Day of year; 0..365
                var a = new Date(f.Y(), f.n() - 1, f.j());
                var b = new Date(f.Y(), 0, 1);
                return Math.round((a - b) / 864e5);
            },

            // Week
            W: function () { // ISO-8601 week number
                var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
                var b = new Date(a.getFullYear(), 0, 4);
                return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
            },

            // Month
            F: function () { // Full month name; January...December
                return txt_words[6 + f.n()];
            },
            m: function () { // Month w/leading 0; 01...12
                return _pad(f.n(), 2);
            },
            M: function () { // Shorthand month name; Jan...Dec
                return f.F()
                    .slice(0, 3);
            },
            n: function () { // Month; 1...12
                return jsdate.getMonth() + 1;
            },
            t: function () { // Days in month; 28...31
                return (new Date(f.Y(), f.n(), 0))
                    .getDate();
            },

            // Year
            L: function () { // Is leap year?; 0 or 1
                var j = f.Y();
                return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
            },
            o: function () { // ISO-8601 year
                var n = f.n();
                var W = f.W();
                var Y = f.Y();
                return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
            },
            Y: function () { // Full year; e.g. 1980...2010
                return jsdate.getFullYear();
            },
            y: function () { // Last two digits of year; 00...99
                return f.Y()
                    .toString()
                    .slice(-2);
            },

            // Time
            a: function () { // am or pm
                return jsdate.getHours() > 11 ? 'pm' : 'am';
            },
            A: function () { // AM or PM
                return f.a()
                    .toUpperCase();
            },
            B: function () { // Swatch Internet time; 000..999
                var H = jsdate.getUTCHours() * 36e2;
                // Hours
                var i = jsdate.getUTCMinutes() * 60;
                // Minutes
                var s = jsdate.getUTCSeconds(); // Seconds
                return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
            },
            g: function () { // 12-Hours; 1..12
                return f.G() % 12 || 12;
            },
            G: function () { // 24-Hours; 0..23
                return jsdate.getHours();
            },
            h: function () { // 12-Hours w/leading 0; 01..12
                return _pad(f.g(), 2);
            },
            H: function () { // 24-Hours w/leading 0; 00..23
                return _pad(f.G(), 2);
            },
            i: function () { // Minutes w/leading 0; 00..59
                return _pad(jsdate.getMinutes(), 2);
            },
            s: function () { // Seconds w/leading 0; 00..59
                return _pad(jsdate.getSeconds(), 2);
            },
            u: function () { // Microseconds; 000000-999000
                return _pad(jsdate.getMilliseconds() * 1000, 6);
            },
            // Timezone
            e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
                // The following works, but requires inclusion of the very large
                // timezone_abbreviations_list() function.
                /*              return that.date_default_timezone_get();
                 */
                throw 'Not supported (see source code of date() for timezone on how to add support)';
            },
            I: function () { // DST observed?; 0 or 1
                // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
                // If they are not equal, then DST is observed.
                var a = new Date(f.Y(), 0);
                // Jan 1
                var c = Date.UTC(f.Y(), 0);
                // Jan 1 UTC
                var b = new Date(f.Y(), 6);
                // Jul 1
                var d = Date.UTC(f.Y(), 6); // Jul 1 UTC
                return ((a - c) !== (b - d)) ? 1 : 0;
            },
            O: function () { // Difference to GMT in hour format; e.g. +0200
                var tzo = jsdate.getTimezoneOffset();
                var a = Math.abs(tzo);
                return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
            },
            P: function () { // Difference to GMT w/colon; e.g. +02:00
                var O = f.O();
                return (O.substr(0, 3) + ':' + O.substr(3, 2));
            },
            T: function () {
                return 'UTC';
            },
            Z: function () { // Timezone offset in seconds (-43200...50400)
                return -jsdate.getTimezoneOffset() * 60;
            },

            // Full Date/Time
            c: function () { // ISO-8601 date.
                return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
            },
            r: function () { // RFC 2822
                return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
            },
            U: function () { // Seconds since UNIX epoch
                return jsdate / 1000 | 0;
            }
        };
        this.date = function (format, timestamp) {
            that = this;
            jsdate = (timestamp === undefined ? new Date() : // Not provided
                    (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
                        new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
            );
            return format.replace(formatChr, formatChrCb);
        };
        return this.date(format, timestamp);
    },
    time : function () {
        return Math.floor(Date.now() / 1e3)
    },
    ucfirst: function (string) {
        return typeof string != 'undefined' ? string.charAt(0).toUpperCase() + string.slice(1) : '';
    },
    explode : function (delimiter, string, limit) {
        if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined') return null;
        if (delimiter === '' || delimiter === false || delimiter === null) return false;
        if (typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string === 'function' || typeof string === 'object') {
            return {
                0: ''
            };
        }
        if (delimiter === true) delimiter = '1';
        delimiter += '';
        string += '';
        var s = string.split(delimiter);
        if (typeof limit === 'undefined') return s;
        // Support for limit
        if (limit === 0) limit = 1;
        // Positive limit
        if (limit > 0) {
            if (limit >= s.length) return s;
            return s.slice(0, limit - 1)
                .concat([s.slice(limit - 1)
                    .join(delimiter)
                ]);
        }
        // Negative limit
        if (-limit >= s.length) return [];
        s.splice(s.length + limit);
        return s;
    },
    implode : function (glue, pieces) {
        var i = '',
            retVal = '',
            tGlue = '';
        if (arguments.length === 1) {
            pieces = glue;
            glue = '';
        }
        if (typeof pieces === 'object') {
            if (Object.prototype.toString.call(pieces) === '[object Array]') {
                return pieces.join(glue);
            }
            for (i in pieces) {
                retVal += tGlue + pieces[i];
                tGlue = glue;
            }
            return retVal;
        }
        return pieces;
    },
    success : function (mes) {
        Swal.fire({
            title: "Success!",
            text: mes,
            icon: "success"
        });
    },
    fail : function (mes) {
        Swal.fire({
            title: "Fail!",
            text: mes,
            icon: "error"
        });
    },
    confirm : async function (mes) {
        const result = await Swal.fire({
            title: `Cormimation`,
            text:mes,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes!',
            cancelButtonText: 'No'
        });
        return result;
    },
    //modalize whole file
    modal: async function (file){
        const html = await gs.loadfile(file);
        Swal.fire({
            title: `Tab ${file} Content`,
            html: html.data,
            width:'80%',
            showCloseButton: true,
            focusConfirm: false
        });
   },
    serializeArray: function (form) {
        return Array.from(new FormData(form)).map(([name, value]) => ({name, value}));
    },
    scrollToBottom : function (id) {
        const element = document.getElementById(id);
        window.scrollTo({top: element.scrollHeight, behavior: 'smooth'});
    },
    login: async function () {
        var email = document.getElementById('email').value.trim();
        var pass = document.getElementById('pass').value.trim();
        var authArray = ['2', '3', '4', '5'];
        var params = {a: 'login', b: pass, c: email};

        console.log(params);

        const login = await gs.callapi.post("login",params);

                console.log(login.data);
                if (login.data == 'no_account') {
                    alert("Account does not exist");
                    return false;
                } else if (login.data === 'authentication_pending') {
                    alert("AUTHENTICATION is PENDING");
                } else if (authArray.includes(login.data['auth'])) {
                    gs.confirm(s.get.auth[login.data['auth']], function (result) {
                        if (result == true && data.auth == '4') {
                            gs.coo('GSID', data['id']);
                            gs.coo('GSLIBID', data['libid']);
                            gs.coo('GSGRP', data['grp']);
                        }
                    })
                } else {
                    var gcookies = {
                        GSID: 'id',
                        GSGRP: 'grp',
                        GSNAME: 'name',
                        GSIMG: 'img',
                        GSLIBID: 'libid',
                        LANG: 'lang',
                        sp: 'sp'
                    };

                    for (var c in gcookies) {
                        gs.coo(c, login.data[gcookies[c]]);
                    }

                    console.log(data);
                    if (gs.coo('GSID') !== 'undefined') {
                        location.href = "/";
                    }
                }
    },
    register: function () {
            var mail = document.getElementById('gs-mail').value.trim();
            var name = document.getElementById('gs-name').value.trim();

            s.db().func('validate', mail, function (mailres) {
                if (mailres == "ok") {
                    s.db().func('name_not_exist', name, function (nameres) {
                        if (nameres == "ok") {
                            var firstname = document.getElementById('gs-firstname').value.trim();
                            var lastname = document.getElementById('gs-lastname').value.trim();
                            var pass = document.getElementById('gs-pass').value.trim();
                            var pass2 = document.getElementById('gs-pass2').value.trim();

                            if (pass == pass2) {
                                s.api.maria.f(`SELECT id FROM user WHERE mail='${mail}' OR name='${name}'`, function (data) {
                                    if (!data.success) {
                                        gs.api.maria.q(`INSERT INTO user(name,firstname,lastname,mail,pass,grp,auth,registered) 
                                        VALUES('${name}','${firstname}','${lastname}','${mail}','${pass}',2,1,${s.time()})`,
                                            function (insert) {
                                                if (insert.success) {
                                                    s.ui.notify("success", "Registration successful");
                                                    document.querySelectorAll("input").forEach(input => input.value = '');
                                                }
                                            }
                                        );
                                    } else {
                                        s.ui.notify("danger", "Email or Name already exists");
                                    }
                                });
                            } else {
                                s.ui.notify("danger", 'Passwords do not match!');
                            }
                        } else {
                            s.ui.notify("danger", "Username validation problem");
                        }
                    });
                } else {
                    s.ui.notify("danger", "Email validation problem");
                }
            });
        },
    subscribe: function (mail) {
            var mail = mail.trim();

            s.db().func('validate', mail, function (mailres) {
                if (mailres == "ok") {
                    gs.api.maria.f(`SELECT id FROM user WHERE mail='${mail}'`, function (data) {
                        if (!data.success) {
                            gs.api.maria.q(`INSERT INTO user(mail,grp,registered) 
                        VALUES('${mail}',1,${s.time()})`, function (insert) {
                                    if (insert.success) {
                                        s.ui.notify("success", "Subscription successful");
                                    }
                                }
                            );
                        } else {
                            s.ui.notify("danger", "Email already exists");
                        }
                        document.getElementById('gs-subscribe-mail').value = '';
                    });
                } else {
                    s.ui.notify("danger", "Email validation problem");
                }
            });
        },
        logout: function () {
            gs.sesClear();
            gs.coo.delAll(['LANG']);
            location.href = '/';
        },


//web storage
    ses: function (key, value) {
        var s = sessionStorage;
        if (!key) {
            return Object(s);
        } else if (!value) {
            return s.getItem(key) || false;
        } else {
            s.setItem(key, value);
        }
    },

    // Delete session storage item(s)
    sesDel: function (key) {
        if (Array.isArray(key)) {
            for (var i in key) {
                sessionStorage.removeItem(key[i]);
            }
        } else {
            sessionStorage.removeItem(key);
        }
    },

    // Clear all session storage items
    sesClear: function () {
        sessionStorage.clear();
    },
    // Get, set, or return local storage item
    local: function (key, value) {
        var s = localStorage;
        if (!key) {
            return Object(s);
        } else if (!value) {
            return s.getItem(key) || false;
        } else {
            s.setItem(key, value);
        }
    },

    // Delete local storage item(s)
    localDel: function (key) {
        if (Array.isArray(key)) {
            for (var i in key) {
                localStorage.removeItem(key[i]);
            }
        } else {
            localStorage.removeItem(key);
        }
    },

    // Clear all local storage items
    localClear: function () {
        localStorage.clear();
    },
    // Set, get, or return cookies
    coo: function (name, value, time, domain) {
    var d = document.cookie;
    var h = window.location.host.split('.');
    var base = h.length == 3 ? (h[1] + "." + h[2]) : window.location.host;

    if (!name) {
        // Return all cookies
        var cookies = d.split(';');
        var result = {};
        for (var i in cookies) {
            var pair = cookies[i].split("=");
            result[pair[0].trim()] = pair[1];
        }
        return result;
    } else if (!value) {
        // Get a specific cookie
        var result = RegExp('(^|; )' + encodeURIComponent(name) + '=([^;]*)').exec(d);
        return result ? result[2] : false;
    } else {
        // Set a cookie
        var domainPart = !domain ? (base ? ";domain=" + base : "") : ";domain=" + domain;
        if (d.indexOf(name) >= 0) {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC" + domainPart + ";path=/;SameSite=None;Secure";
        }
        var now = new Date();
        var expireTime = !time ? now.getTime() + 1000 * 36000 * 1000 : now.getTime() + (time * 1000);
        now.setTime(expireTime);
        document.cookie = name + "=" + value + ";expires=" + now.toUTCString() + domainPart + ";path=/;SameSite=None;Secure";
    }
},

// Delete cookie(s)
cooDel: function (name, domain) {
    var h = window.location.host.split('.');
    var base = h.length == 3 ? (h[1] + "." + h[2]) : window.location.host;
    var domainPart = !domain ? (base ? ";domain=" + '.' + base : "") : ";domain=" + domain;

    if (Array.isArray(name)) {
        for (var i in name) {
            document.cookie = name[i] + "=;" + domainPart + ";path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;max-age=0";
        }
    } else {
        document.cookie = name + "=;" + domainPart + ";path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;max-age=0";
    }
},

// Delete all cookies except the specified ones
cooDelAll: function (except) {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (!except.includes(name)) {
            this.cookieDel(name);
        }
    }
},
/**
    WEB WORKERS
    USAGE:
    async function useWorker(params, method = 'GET', responseFormat = 'html') {
    try {
        const url =  your URL construction ...
    const result = await gs.worker(params, method, responseFormat, url);
    console.log("Worker Result:", result);
    // ... (process the result) ...
} catch (error) {
    console.error("Worker Error:", error);
    // ... (handle the error) ...
}
}
*/

    worker : function(params, method = 'GET', responseFormat = 'html') {
        return new Promise((resolve, reject) => {
            if (window.Worker) {
                const wid = "w" + hash();
                window[wid] = new Worker("/admin/js/worker4.js");
                // Handle errors
                window[wid].onerror = (e) => {
                    reject(new Error(e.message + " (" + e.filename + ":" + e.lineno + ")"));
                };
                params.method = method;
                params.responseFormat = responseFormat;
                params.wid = wid;
                params.isWorkerRequest = true;

                window[wid].postMessage(params);

                window[wid].onmessage = (event) => {
                    resolve(event.data); // Resolve the Promise with the worker's response
                }
            } else {
                reject(new Error("Web Workers are not supported in this browser."));
            }
        });
    },
/*
* ${G.TEMPLATE}.com:${port}/${user}
* */
    soc:{
        wsConnections: {},
        // Initialize WebSocket connection dynamically for each URI
        init: (connectionName, uri) => {
            const ws = new WebSocket(`wss://${uri}`);
            ws.onopen =  function(){
                const user = !!my.userid ? my.userid : '1';
                console.info(`${G.SYSTEM}:${G.page} Connection, ${connectionName} established with user:`, user);
                const mes = { system:G.SYSTEM,domaffect:"*",type: "open", verba: "PING", userid: user, to:user,cast: "one" };
                ws.send(JSON.stringify(mes));
            };
            ws.onmessage = gs.soc.get(connectionName);
            ws.onerror = gs.soc.error(connectionName);
            ws.onclose = gs.soc.close(connectionName, uri);
            // Store WebSocket instance in wsConnections object
            gs.soc.wsConnections[connectionName] = ws;
            return ws;
        },
        close: (connectionName, uri) => (e) => {
            if (e.wasClean) {
                console.log(`Connection ${connectionName} closed cleanly, code=${e.code}, reason=${e.reason}`);
            } else {
                console.error(`Connection ${connectionName} died unexpectedly`);
            }
            // Attempt reconnection after 10 seconds
            setTimeout(() => {
             console.log(`Reconnecting ${connectionName}...`);
              gs.soc.init(connectionName, uri);
            }, 10000);
        },
        error: (connectionName) => (e) => {
            console.error(`WebSocket ${connectionName} error occurred:`, e);
        },
        send: (connectionName, mes) => {
            const ws = gs.soc.wsConnections[connectionName];
            /* @userid:"sudo", @type:com[mand],notify,chat,html@cast:all,one @rule:js condition @fun: function | s object	 @text: message
                @to: client receiver @time: @img: */
                console.log(mes);
            // Send the message using the stored WebSocket instance
            // Check if WebSocket is open before sending the message
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            } else {
                console.error(`${message.system}:${message.page} WebSocket ${connectionName} is not open. Unable to send message:`, message);
            }
        },
        // Updated async get method for handling WebSocket messages
        get: (connectionName) => async (e) => {
            //const data = gs.isjson(e.data) || e.data;
            const message = JSON.parse(e.data);
            if (G.SYSTEM == message.system) {  //read only by the system
                    switch (message.type) {
                        case 'watch':
                        case 'events':
                        case 'N':
                            if(document.getElementById('activity-list')) {
                                gs.activity.add(message.verba);
                            }
                            if (message.execute) {
                                try {
                                    eval(message.execute);
                                } catch (error) {
                                    console.error('Error executing command:', error);
                                }
                            } else {
                                console.warn('No command to execute');
                            }
                            break;
                        case 'cubos':
                            console.log("received cubos",message)
                            await gs.cubos(message.area,message.html);
                         break;
                            let existingid = document.getElementById(message.id);
                            if (existingid) {
                                existingid.innerHTML += message.html;
                            }
                        break;
                        case "chat": venus.start(message); break;
                        default:console.log(`${message.system} Received at ${message.page} from ${connectionName}:`, message);
                        break;
                }
                // Implement your async logic here to process incoming data
                return new Promise((resolve, reject) => {
                    try {
                        resolve(message);
                        console.log("Promise", message)
                        return message;
                    } catch (error) {
                        reject(error);
                    }
                });
            }
        }
    },
    cubos: async function(area, html) {
        if (!!area && !!html) {
            // Create a new div for the cubo area
            let cuboAreaDiv = document.createElement("div");
            cuboAreaDiv.id = area;
            cuboAreaDiv.className = 'cubo';

            // Find the parenting area for the cubo
            let cuboAreaElement = document.getElementById(G.parenting_areas[area]);

            if (!!cuboAreaElement) {
                // Append the new div to the parent area
                cuboAreaElement.appendChild(cuboAreaDiv);

                // Check if the area exists and update its innerHTML with the content
                let cuboAreaSelector = document.querySelector(`#${area}`);
                if (cuboAreaSelector) {
                    cuboAreaSelector.innerHTML = html;
                } else {
                    console.error(`Element with id ${area} not found.`);
                }
            } else {
                console.error(`Parent element for area ${area} not found.`);
            }
        } else {
            console.error('Invalid area or html');
        }
    },

    /**
     APY
     executes GPY system (python fast api)
     @params:
         POST
     1- gemini/conversation
        request { user_input: userInput }
        response
     2- cohere/chat
        request { user_input: userInput }
        response
     3- transformers/generate/
        request {"prompt":"what the new GPT-5 release","max_length": 200}
        response  {"generated_text": str }
     - transformers/sentiment/
        request {text: str}
        response {"sentiment": results}
     4- gptneo/chat
        request {"message": "Hello, GPT-Neo!"}
         response {"response": "Poetry or maths"}
     -gptneo/conversation
      request {"message": "Hello, how are you?", "conversation_id": "1"}
      response {"response": "Poetry or maths"}
      }
      https://vivalibro.com/apy/v1/
SET SHORT DEFAULT
5. claude/conversations/{conversation_id}/messages
      (conversation_id: UUID, message: Message):
      {"id":"71e4d685-cde0-4246-9ece-13bf58f4c4e5","messages":[]}
     GET
     */
    apy: {
        post: async function(route, params) {
//1) gemini, 2) cohere, 3) transformers, 4) gptneo 5) claude
            let rt= '',pms= {};
            switch(route){
                case "gemini": rt= "gemini/conversation"; pms={ user_input: params }; break;
                case "cohere": rt= "cohere/chat"; pms={ user_input: params }; break;
                case "transformers": rt= "transformers/generate"; pms={ prompt: params }; break;
                case "gptneo": rt= "gptneo/chat"; pms={ message: params }; break;
                case "claude": rt= "claude/conversations/4395a9f5-0f9d-4a0f-9fd9-9085bc65924d/messages"; pms={ content: params }; break;
                default: rt= route; pms={ message: params }; break;
            }

            try {
                const response = await fetch(`${G.SITE_URL}apy/v1/${rt}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(pms)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const res = await response.json();
                console.log(res);
                return res;
            } catch (error) {
                console.error('Error fetching chat response:', error);
            }
        },
        get: async function(route, params) {
            try {
                // Build query string from params
                const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';

                const response = await fetch(`${G.SITE_URL}apy/v1/${route}${queryString}`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const res = await response.json();
                console.log(res);
                return res;
            } catch (error) {
                console.error('Error fetching GET response:', error);
            }
        }
    },

/**
 prepare the baby
 connect with services & mongodb
 */
ermis:{


    },
/**
prepare the baby
*/
    go : {},
/**
 prepare the baby
 */

    rus : {},
/*    const
actions = [
        { method: 'buildTable', params: { table: 'gen_vivalibro.tasks' } },
        { method: 'updateUI', params: { section: 'taskList' } },
        { method: 'showMessage', params: { message: 'Table built successfully!' } }

        USAGE INLINE PHP     $actions = json_encode([
        ['method' => 'buildTable', 'params' => ['table' => 'gen_vivalibro.tasks']],
        ['method' => 'updateUI', 'params' => ['section' => 'taskList']],
        ['method' => 'showMessage', 'params' => ['message' => 'Table built successfully!']]
    ]);
    onchange="handleActions(' . $actions . ')" SO SIMPLE!
    ];
 sequence of actions used to pass from one the result to other function
 UPDATE COMBINE PHP AND JS ACTIONS IN THE SEQUENCE IN A CHAINED WAY
 now
 usage $actions = json_encode([
    ['method' => 'buildTable', 'params' => ['table' => 'gen_vivalibro.tasks']],
    ['method' => 'js:updateUI', 'params' => ['section' => 'taskList']],
    ['method' => 'showMessage', 'params' => ['message' => 'Table built successfully!']],
    ['method' => 'js:highlightRow', 'params' => ['rowId' => 5]]
      onchange="seq(' . $actions . ')"
]);
 */
    seq : async function(actions) {
        let lastResult = null;

        for (const action of actions) {
            // Inject the result of the previous action into the parameters if needed
            if (lastResult) {
                action.params.previousResult = lastResult;
            }

            // Check if method exists before calling startsWith
            if (action.method) {
                // If it's a JavaScript function (starts with 'js:')
                if (action.method.startsWith('js:')) {
                    const jsFunctionName = action.method.slice(3); // Remove 'js:' prefix
                    if (typeof window[jsFunctionName] === 'function') {
                        lastResult = await window[jsFunctionName](action.params);
                    } else {
                        console.error(`JavaScript function "${jsFunctionName}" not defined.`);
                    }
                } else {
                    // Call the PHP method via the API
                    const result = await callapi.get(action.method, action.params);
                    console.log(`Result of ${action.method}:`, result);
                    lastResult = result; // Store result for next action
                }
            } else {
                console.error('Action method is undefined:', action);
            }
        }
    },
    /**
     callapi
     executes and gets data any core method
     */
    callapi : {
        get: async function(method, params) {
            try {
                const queryParams = new URLSearchParams(params).toString();
                const url = `${G.SITE_URL}api/v1/local/${method}?${queryParams}`;
                console.log(url);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json',}
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                // Determine if response is HTML or JSON
                const contentType = response.headers.get('Content-Type');
                console.log(contentType);
                let result;
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json(); // Handle JSON response
                    console.log("JSON result:", result);
                } else {
                    result = await response.text(); // Handle HTML response
                    console.log("HTML result:", result);
                }

                return result;
            } catch (error) {
                console.error("Error updating content:", error);
            }
        },

        post: async function(method, params) {
            try {
                const url = `${G.SITE_URL}api/v1/local/${method}`;
                console.log(url);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(params)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                console.log(result);
                return result;
            } catch (error) {
                console.error("Error updating content:", error);
            }
        }
    },
    /***
     loadfile
     get BUFFERS from core API api/bin
     USAGE:
     */
    loadfile : async function (path, id='',callback) {
        try {
            const response = await fetch(`${G.SITE_URL}api/v1/bin/getfile?file=${path}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const html = await response.json();
            console.log(html)
            if(!!id) {
                document.getElementById(id).innerHTML = html.data;
            }else{
                return html;
            }
            // Call the callback if it's provided, for handling script execution, etc.
            if (callback && typeof callback === 'function') {
                callback();
            }
        } catch (error) {
            console.error("Error updating content:", error);
        }
    },

    /*
    const newpage = form.generate(params,callback).attach(id);
    * */
    form :{
        /**
         * Core form update
         * go to  page 1 with search is clicked
         * */
        loadButton : async function(method, value) {
            const params={key:value}
            console.log(params);
            try {
                // Make the API request
                const getResult = await gs.callapi.get(method, params);

                // Retrieve the target element by id
                const nextMethodElement = document.getElementById(method);
                console.log(getResult.data);
                // Update the icon based on the response (assuming `getResult.data` contains a value to determine the icon)
                nextMethodElement.innerHTML = getResult.success
                    ? '<span style="color: green; font-size: 1.2em;">✔️</span>'
                    : '<span style="color: red; font-size: 1.2em;">❌</span>';
            } catch (error) {
                console.error("Error loading button data:", error);
            }
        },
        updateRow: async function (event, table) {
            const field = event.name;
            //if in subpage
            const db = table.split('.')[0].replace('gen_','');
            //if in 6channel
            const id = G.id!='' ? G.id : event.id.replace(field, '');
            const value = event.value;
            try {
                if(!!db) {
                    await gs.api[db].q(`UPDATE ${table}
                                SET ${field}=?
                                WHERE id = ?`, [value, id]);
                }
            } catch (error) {
                console.error(`Error updating ${field}:`, error);
            }
        },
        insertNewRow : async function (event) {
            // Extract the 'name' attribute from the event target (button)
            const field = event.target.name;  // Use event.target to access the button's name attribute

            console.log(field);

            // Split 'gen_admin.domain' into 'gen_admin' and 'domain'
            const db = field.split('.')[0].replace('gen_', '');  // Extract the database name, e.g., 'admin'
            const tableName = field.split('.')[1];  // Extract the table name, e.g., 'domain'

            console.log(db);
            console.log(tableName);

            // Get the name value from the input field dynamically (based on tableName)
            const nameValue = document.getElementById(tableName + '_name').value;  // Assuming your input has an ID like 'domain_name'
            console.log(nameValue);

            // Prepare the parameters to send to the API
            const params = {
                name: nameValue,
                created: gs.date('Y-m-d H:i:s')  // Use gs.date() to generate a timestamp
            };
            console.log(params);

            try {
                // Check if the db exists and is valid
                if (!!db) {
                    // Insert the new row into the database/table using gs.api
                    const dbcalled= G.TEMPLATE==db ? 'maria' : db;
                    const newRow = await gs.api[dbcalled].inse(tableName, params);  // Use tableName here
                    console.log(newRow);  // Log the result of the insert
                    // Find the table body and rows
                    if(newRow.success){
                        //location.reload();
                        const page= G.subparent[tableName];
                        location.href=`/admin/${page}/${tableName}?id=${newRow.data}`;
                    }
                }
            } catch (error) {
                // Catch any errors and log them
                console.error(`Error inserting new row into ${db}.${tableName}:`, error);
            }
        },
        handleNewRow : async function (event, tableName, list) {
            // Check for 'globs_tab' in cookies
            const table=tableName.split('.')[1];
            const db=tableName.split('.')[0];
            const new_box = document.getElementById(`new_${table}_box`);
            if (new_box.innerHTML === "") {
                try {
                    const params={adata: table, database:db,nature: "new", append: `#new_${table}_box`, list};
                    console.log(params);
                    const new_postgrp = await gs.form.generate(params)
                    if (new_postgrp.success) {
                        console.log("running reload")
                        // new_box.innerHTML = '';
                        //    window.location.reload();
                    }
                    ;
                } catch (error) {
                    console.warn('Error loading:', error);
                }
            } else {
                new_box.innerHTML = '';
            }
        },
        updateTable: async function(selectElement, method) {
            // Extract 'table' and other necessary data attributes dynamically
            const dataset = selectElement.dataset;  // This will contain all data-* attributes
            const tableName = dataset.table;  // Dynamically get table name
            const q = dataset.q || '';  // Use search query if available
            const pagenum = dataset.pagenum || 1;  // Use pagination number if available
            const orderby =dataset.orderby || '';


            // Create the params object dynamically with table name, search query, and page number
            const params = { table: tableName, q: q, pagenum: pagenum, orderby: orderby };
            console.log(method);
            console.log(params);
            // Make an API request using the method and parameters
            const getResult = await gs.callapi.get(method, params);

            // Get the table element by ID (based on table name)
            const id = tableName.split('.')[1] + '_table';  // Assuming table name format is "db.table"
            const nextMethodElement = document.getElementById(id);

            // Clear the previous content and insert new data
            nextMethodElement.innerHTML = getResult.data;
            // Call gotopage to update pagination styling

            if (dataset.q) {
                gs.form.gotopage(1);
            }else{
                gs.form.gotopage(pagenum);
            }
        },

        deleteRow : async function (event, tableName) {
            if (event.id.includes('del')) {
                const id = event.id.replace('del', '');
                const table=tableName.split('.')[1];
                const db = tableName.split('.')[0].replace('gen_', '');
                console.log(table)
                console.log(db)
                const suredelete = await gs.confirm(`You are going to delete id ${id}. Are you sure?`);
                if (suredelete.isConfirmed) {
                    try {
                        console.log(`DELETE from ${table} WHERE id = ?`);
                        const dbcalled= G.TEMPLATE==db ? 'maria' : db;
                        const deleted = await gs.api[dbcalled].q(`DELETE from ${table} WHERE id = ?`, [id]);
                        if (deleted.success) {
                            document.getElementById(`${tableName}_${id}`).remove();
                        }
                    } catch (error) {
                        console.error(`Error delete ${table}:`, error);
                    }
                }
            }
        },
        gotopage: function(page) {
            const buttons = document.querySelectorAll('#pagination .page-link');
            buttons.forEach(button => button.classList.remove('active'));
            console.log(page);
            const activeButton = document.querySelector(`#page_${page}`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        },
        go2page: function(buttonElement) {
            // Extract the page number from the data attribute
            const page = buttonElement.dataset.pagenum;

            // Remove 'active' class from all buttons
            const buttons = document.querySelectorAll('#pagination .page-link');
            buttons.forEach(button => button.classList.remove('active'));

            // Add 'active' class to the clicked button
            console.log(`Navigating to page: ${page}`); // Debugging log
            const activeButton = document.querySelector(`#page_${page}`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        },
            generate: async function (params) {
                // Bind the submit event to the form and handle async properly
                const html = await gs.form.get(params); // Assuming get() returns a Promise now
                const container= document.querySelector(params.append);
                container.innerHTML = html;
                // Bind the submit event to the form and handle async properly
                console.log(pms);
                return new Promise((resolve, reject) => {
                    const form = document.getElementById(params.adata);

                    if (!form) {
                        reject('Form not found');
                        return;
                    }

                    form.addEventListener('submit', async function (event) {
                        event.preventDefault();  // Prevent default form submission
                        try {
                            const response = await gs.form.newsubmit(event);  // Assuming this returns a response
                            resolve(response);  // Resolve the promise with the response
                        } catch (error) {
                            reject(error);  // Reject the promise if there's an error
                        }
                    });
                });
            },
            get: async function (params) {
                var ob = params;
                var inp = '', className, droplist, droptext = '';
                var board = '<form method="POST" class="gform" id="' + ob.adata + '">' +
                    '<input type="hidden" name="a" value="new">' +
                    '<input type="hidden" name="table" value="' + ob.adata + '">';
                var data = [];
                // Loop over the list of fields and build the form
                Object.keys(ob.list).forEach((key) => {
                    var item = ob.list[key];
                    ob.type = 'type' in item ? item.type : 'text';
                    ob.global = item.global;
                    ob.globalkey = 'globalkey' in item ? true : false; // Set the key of globals
                    ob.row = 'row' in item ? item.row : '';
                    data[ob.row] = data[ob.row] ?? '';
                    ob.alias = 'alias' in item ? item.alias : ob.row;
                    ob.placeholder = 'placeholder' in item ? item.placeholder : gs.ucfirst(ob.row);
                    ob.value = 'value' in item ? item.value : '';
                    ob.inputid = ob.row;
                    ob.divid = ob.row;
                    if(ob.type!='hidden') {
                        board += gs.form.input(ob, data);
                    }
                });
                board += '<button class="button" id="' + ob.adata + '_insert" ' +
                    'data-database="' + (ob.database || 'maria') + '" ' + // Default to 'maria'
                    'data-formid="' + ob.adata + '" ' +
                    '>DO</button></form>';
                return board;
            },

            newsubmit: async function (event) {
                event.preventDefault();
                const form = gs.serializeArray(event.target); // Get form data
                console.log(form);
                const formData = {};
                form.forEach(({name, value}) => {
                    formData[name] = value;
                });
                const database = event.target.dataset.database || 'maria'; // Get from data attribute (if needed)
                try {
                    // Make the API call
                    const response = await gs.api[database].form(formData);
                    console.log('Response:', response);
                    // Handle response (assuming success is a part of the response)
                    if (response && response.success) {
                        console.log('Form submitted successfully!');
                    } else {
                        alert('Error: ' + (response.message || 'An issue occurred.'));
                    }
                    return response; // Return the response for handling outside
                } catch (error) {
                    console.error('Submission Error:', error); // Log detailed error
                    alert('An error occurred during form submission.');
                    throw error; // Re-throw error to be caught
                }
            },

            input: function (f, data) {
                var part = '', result;
               // console.log(f.type);
                // Handle different input types
                if (f.type === 'drop') {
                    var key;
                    var ievent = f.nature !== 'new' ? 'onchange="g.ui.form.drop(this)"' : '';
                    part = Object.keys(f.global)[0]!=0 ? `<option value=0>Select ${f.inputid}</option>` : '';
                    for (var i in f.global) {
                        key = f.globalkey ? f.global[i] : parseInt(i) + 1;
                        part += '<option value="' + i + '" ' + (i == data[f.row] ? 'selected="selected"' : '') + '>' + f.global[i] + '</option>';
                    }
                    result = `<div class="gs-span" id="${f.divid}"><label for="${f.alias}">${f.alias}</label>` +
                        (f.format === 'read'
                            ? data[f.row]
                            : `<select name="${f.row}" ${ievent} ${f.attributes} class="gs-input" id="${f.inputid}">${part}</select>`) +
                        `</div>`;
                } else if (f.type === 'text' || f.type === 'number' || f.type === 'date') {
                    var string = f.type === 'date' ? date('Y-m-d', data[f.row]) : data[f.row];
                    result = `<div class="gs-span" id="${f.divid}"><label for="${f.alias}">${f.alias}</label>` +
                        (f.format === 'read'
                            ? string
                            : `<input class="gs-input" name="${f.row}" placeholder="${f.placeholder}" id="${f.inputid}" type="${f.type}" value="${string}">`) +
                        `</div>`;
                } else if (f.type === 'textarea') {
                    result = `<div class="gs-span" id="${f.divid}"><label for="${f.alias}">${f.alias}</label>` +
                        (f.format === 'read'
                            ? data[f.row]
                            : `<div class="wysiwyg${f.inputid}" name="${f.row}" placeholder="${f.placeholder}" id="${f.inputid}">${g.htmlentities.decode(data[f.row])}</div>` +
                            (f.nature !== 'new' ? `<button onclick="gs.ui.form.textarea(this,this.previousSibling)" class="btn btn-default" id="submit_${f.inputid}">Save</button>` : '')) +
                        `</div>`;
                }
                // Add more input types as needed
                return result;
            },

            reset_inputs: function (array) {
                for (let i = 0; i < array.length; i++) {
                    document.querySelector(array[i]).value = '';
                }
            },

            template: async function (loopi, table, type, database) {
                let html = '';
                // Append the form submit button only for new entries
                if (type === 'new') {
                    html += `<form method="POST" data-database="${database}" id="new_${table}form">
              <input type="hidden" name="table" value="${table}">`;
                    var templated = loopi;
                } else {
                    var templated = loopi;
                }
                // If loopi is 'new', replace placeholders with default values for a new form
                const templateLines = templated.split('\n');
                templateLines.forEach(line => {
                    if (type === 'new') {
                        // Remove placeholders for new entries
                        html += line.replace(/\${loopi\..*?}/g, '')
                                .replace('undefined', '0')
                            + '\n';
                    } else {
                        // Replace placeholders with data from 'loopi' for existing entries
                        for (const key in loopi) { // Iterate through the loopi object
                            const placeholder = `\${loopi.${key}}`;
                            const value = loopi[key];
                            line = line.replace(new RegExp(placeholder, 'g'), value);
                        }
                        html += line + '\n';
                    }
                });
                if (type == 'new') {
                    html += `<button class="button" id="new_${table}_submit">Submit</button>
             </form>`;
                }
                //return inside the container
                return `<div id="new${table}box" class="${table}-box">${html}</div>`;
            }
    },
    ui: {
        opener:function(n, t) {
            var e = document.getElementById(n);
            if (typeof t !== 'undefined' && t === 'close') {
            e.style.display = 'none';
            } else {
            e.style.display = e.style.display === 'none' || e.style.display === '' ? 'block' : 'none';
            }
        },
        sort: function(query, table,orderel='nodorder') {
            // Get list elements with id="[table]"
            var listElements = document.querySelectorAll("[id^='"+table+"']");
            console.log(listElements);
            listElements.forEach(function(listElement) {
                // Initialize Sortable for each list element
                Sortable.create(listElement, {
                    onEnd: async function(evt) {
                        var id = evt.from.id.replace(table, '');
console.log(id)
                        var orderElements = document.querySelectorAll(".menuBox" + id);
                        var allIds = Array.from(orderElements).map(function(el) {
                            return el.id.replace(orderel + id + '_', '');
                        });
                        console.log(allIds);
                        // Call update function to handle reordering logic
                        try {
                            // Prepare an array to batch API calls
                            const queries = [];

                            allIds.forEach((itemId, index) => {
                                queries.push([index, itemId]);
                            });

                            // Send batched API update to avoid multiple small calls
                            const result = await gs.api.maria.sort(query, queries);

                            if (result.success) {
                                // Update the UI to reflect the new order
                                allIds.forEach((itemId, index) => {
                                    document.querySelector('#menusrt' + id + itemId).textContent = index;
                                });
                            }
                        } catch (error) {
                            console.error('Error during sortable update:', error);
                        }
                    }
                });
            });
        },
        editor:function(textareaId) {
            const textarea = document.getElementById(textareaId);
            const editorId = `gseditor-${textareaId}`;

            // Create the contenteditable div
            const editor = document.createElement('div');
            editor.id = editorId;
            editor.contentEditable = true;
            editor.style.minHeight = '150px';
            textarea.parentNode.insertBefore(editor, textarea);

            // Create the toolbar
            const toolbar = document.createElement('div');
            toolbar.classList.add('toolbar');
            toolbar.id = `gseditor-${textareaId}`;
            editor.appendChild(toolbar);
            // Create and append buttons to the toolbar
            const buttons = [
                { tag: 'strong', html: '<b>B</b>' },
                { tag: 'em',     html: '<em>I</em>' },
                { tag: 'h2',     html: '<h2>H2</h2>', id: 'h2Button' },
                { tag: 'h3',     html: '<h3>H3</h3>', id: 'h3Button' },
                { tag: 'p',      html: '<p>P</p>', id: 'pButton' },
            ];
            buttons.forEach(buttonData => {
                const button = document.createElement('button');
                button.innerHTML = buttonData.html;
                if (buttonData.id) {
                    button.id = buttonData.id;
                }
                button.addEventListener('click', () => wrapSelection(textarea, `<${buttonData.tag}>`, `</${buttonData.tag}>`));
                toolbar.appendChild(button);
            });
            // Initialize the editor's content
            editor.textContent = textarea.value;
            // Update the textarea on input
            editor.addEventListener('input', () => {
                textarea.value = editor.innerHTML;
            });
            // Wrap selected text with tags
            function wrapSelection(textarea, startTag, endTag) {
                const selectionStart = textarea.selectionStart;
                const selectionEnd = textarea.selectionEnd;
                const selectedText = textarea.value.substring(selectionStart, selectionEnd);

                textarea.value =
                    textarea.value.substring(0, selectionStart) +
                    startTag + selectedText + endTag +
                    textarea.value.substring(selectionEnd);

                // Restore the cursor position (optional)
                textarea.selectionStart = selectionStart + startTag.length;
                textarea.selectionEnd = selectionEnd + startTag.length;
                textarea.focus();
            }
        },
table: {
            execute: function (divid, query, data, row, node) {
                if (row == "delete") {
                    var id = divid.replace('delete', '');
                    var q = gs.vareplace(query, data);
                    gs.db().func('query', q, function (res) {
                        if (res == 'yes') {
                            const element = document.getElementById(node + id);
                            if (element) {
                                element.remove();
                            }
                        }
                    });
                }
            },
            get: function (f) {
                var topbar = '';
                /*
                 TOP BAR
                 1) from date to date selection all tables have creation and modified date
                 2) search table
                 3) counter
                 4) order by label
                 5) pagination
                 */
                topbar += '<div class="board_id_container">' +
                    '<button style="float:left;margin: 0.5%;display:flex;justify-content: center;" onclick="gs.ui.table.reset()" class="btn btn-default btn-sm">Reset</button>' +
                    '<input type="text" id="search" style="width: 78%; margin: 0.5% 0 10px 0;display:flex;justify-content: center;float: left;" onkeyup=" gs.ui.table.search(this)" placeholder="search" value="' + (!coo('search') ? '' : gs.coo('search')) + '" class="form-control input-sm">' +
                    '<div class="toFromTitle">' +
                    '<span>Registered from:</span><input style="display:inline-block;width:62%" style="margin: 6px;" type="date" onchange="gs.ui.table.dateselection(this)" value="' + (!coo('date' + f.adata + 'from') ? '' : gs.coo('date' + f.adata + 'from')) + '" id="date' + f.adata + 'from" class="form-control input-sm"></div>' +
                    '<div class="toFromTitle">' +
                    '<span>Until:</span><input style="display:inline-block;width:74%" type="date" style="margin: 6px;"  class="form-control input-sm" onchange="gs.ui.table.dateselection(this)" value="' + (!coo('date' + f.adata + 'to') ? '' : gs.coo('date' + f.adata + 'to')) + '" id="date' + f.adata + 'to"></div>' +
                    '<div class="label1"><span id="counter"></span> ' + G.sub + ' <span id="order_label"></span></div>' +
                    '<div id="pagination" class="paginikCon"></div>' +
                    '</div>';

                //HEAD OF TABLE
                var board = '';
                var append = 'append' in f ? f.append : (G.dsh ? '.gs-sidepanel' : '#main_window');

                for (var h in f.list) {
                    if (f.list[h].type != "img") {
                        board += '<th><button data-orderby="' + f.list[h].row + '" onclick="gs.ui.table.orderby(this);" class="orderby" id="order_' + f.list[h].row + '">' + f.list[h].row + '</button></th>';
                    } else {
                        board += '<th>' + f.list[h].row + '</th>';
                    }
                }
                // Create the HTML string
                const htmlString = topbar +
                    '<table class="TFtable">' +
                    '<tr class="board_titles">' + board + '</tr>' +
                    '<tbody id="' + f.adata + '"></tbody>' +
                    '</table>';

// Create a temporary container to hold the HTML string
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = htmlString;

// Append the created elements to the target container
                const targetContainer = document.querySelector(append);
                if (targetContainer) {
                    while (tempContainer.firstChild) {
                        targetContainer.appendChild(tempContainer.firstChild);
                    }
                }
                //read the loop
                this.loop(f);
            },
//reset button table
            reset: function () {
                //delete inputs
                gs.coo.del('date' + gs.f.adata + 'from');
                gs.coo.del('date' + gs.f.adata + 'to');
                gs.coo.del('search');

                //clean inputs
                document.getElementById('search').value = '';
                document.getElementById('date' + gs.f.adata + 'from').value = '';
                document.getElementById('date' + gs.f.adata + 'to').value = '';
                //reset
                gs.ui.reset('#' + gs.f.adata);
                this.loop(s.f);
            },
            updateProgressBar(percentage) {
                // Update the progress bar width and aria-valuenow attribute
                const progressBar = document.getElementById('progressBar');
                if (progressBar) {
                    progressBar.style.width = percentage + '%';
                    progressBar.setAttribute('aria-valuenow', percentage);
                }
// Update the progress text
                const progressText = document.getElementById('progressText');
                if (progressText) {
                    progressText.textContent = percentage + '%';
                }
                // Log progress
                console.log('Progress: ' + percentage + '%');
                // Check if progress is 100%
                if (percentage === 100) {
                    // Set a timeout to reset the progress bar after 2 seconds (2000 milliseconds)
                    setTimeout(function () {
                        // Reset the progress bar width and aria-valuenow attribute
                        const progressBar = document.getElementById('progressBar');
                        if (progressBar) {
                            progressBar.style.width = '0%';
                            progressBar.setAttribute('aria-valuenow', '0');
                        }

// Reset the progress text
                        const progressText = document.getElementById('progressText');
                        if (progressText) {
                            progressText.textContent = '0%';
                        }
                    }, 2000);
                }
            },//ORDER BY
            orderby: function (obj) {
                var name = obj.id.replace('order:', '')
                var cookiename = gs.explode(':', obj.id)[0];
                gs.ui.reset('#' + gs.f.adata);
                gs.f.order[1] = gs.f.order[0] == name ? (s.f.order[1] == "DESC" ? "ASC" : "DESC") : "ASC";
                gs.f.order[0] = name;
                gs.coo(G.mode + '_' + cookiename, gs.f.order[0] + " " + gs.f.order[1]);
                this.loop(s.f);
            },
//DATE SELECTION
            dateselection: function (obj) {
                gs.coo(obj.id, obj.value)
                gs.f.datauserfrom = obj.value;
                gs.ui.reset('#' + gs.f.adata);
                this.loop(s.f);
            },
//list search
            search: function (obj) {
                gs.coo('search', obj.value);
                // cookieSet('userlist_page',1)
                gs.ui.reset('#' + gs.f.adata);
                this.loop(s.f)
            },
//set photos
            get_imgs: function (obj) {
                $.ajax({
                    type: 'GET',
                    url: gs.ajaxfile,
                    data: {a: 'get_imgs', b: obj.ids, c: obj.mediagrpid},
                    dataType: 'json',
                    success: function (imgs) {
                        // console.log(imgs)
                        for (var i in imgs) {
                            // console.log(i + ':' + imgs[i])
                            const imageElement = document.getElementById('fimage' + i);
                            if (imageElement) {
                                imageElement.src = G.UPLOADS + imgs[i];
                            }
                        }
                    }
                });
            },
//TABLE LOOP
            loop: function (f) {
                var row, nature, divid, event, label, type, query, h, href, datarow, images = 0, board = '', ids = [],
                    mediagrpid;
                var order = "ORDER BY " + (coo(G.mode + '_order') != false ? gs.coo(G.mode + '_order') : f.order.join(" "));
                f.page = 'page' in f ? f.page : 1;
                f.dateuserfrom = 'datefrom' in f ? f.page : "";
                // console.log(f.dateuserfrom)
                f.dateuserto = 'dateto' in f ? f.page : "";
                $.ajax({
                    type: 'GET',
                    url: gs.ajaxfile,
                    data: {a: f.fetch[0], b: f.fetch[1], order: order, page: f.page, table: f.adata},
                    dataType: 'json',
                    success: function (data) {
                        // console.log(data[0].query)
                        // console.log(data)
                        if (data != 'No') {

                            for (var i in data) {
                                board += '<tr id="line' + data[i].id + '">';
                                for (var j in f.list) {
                                    row = 'row' in f.list[j] ? f.list[j].row : '';
                                    datarow = 'global' in f.list[j] ? f.list[j].global[data[i][row]] : data[i][row];
                                    type = 'type' in f.list[j] ? f.list[j].type : '';
                                    nature = 'nature' in f.list[j] ? f.list[j].nature : '';
                                    label = 'label' in f.list[j] ? f.list[j].label : row;
                                    query = 'query' in f.list[j] ? f.list[j].query : '';
                                    href = 'href' in f.list[j] ? (f.list[j].href) : '';
                                    event = 'event' in f.list[j] ? (f.list[j].event) : '';
                                    divid = row + data[i].id;
                                    //TYPES
                                    if (type == 'a') {
                                        if (nature != 'edit') {
                                            board += '<td><a href="' + gs.vareplace(href, data[i]) + '">' + data[i][row] + '</a></td>';
                                        } else {
                                            board += '<td><a href="' + gs.vareplace(href, data[i]) + '"><input id="' + divid + '" type="text" value="' + data[i][row] + '"></a></td>';
                                        }
                                    } else if (type == 'img') {
                                        // ids.push(data[i].id);
                                        // images=1;
                                        // mediagrpid = f.list[j].mediagrpid;
                                        board += '<td><img id="' + divid + '" src="' + (typeof data[i][row] != 'undefined' && data[i][row] != null ? G.UPLOADS + data[i][row] : gs.siteurl + 'gaia/img/post.jpg') + '" width="30" height="30"></td>';
                                    } else if (type == 'button') {
                                        board += '<td><button id="' + divid + '" value="' + data[i].id + '" name="' + query + '" title="' + row + '" class="btn btn-default btn-xs" onclick="s.ui.table.execute(this.id,this.name,this.value,this.title)">' + label + '</button></td>';
                                    } else if (type == 'date') {
                                        board += '<td id="' + divid + '">' + gs.date('Y-m-d, H:i', datarow) + '</td>';
                                    } else {
                                        if (nature != 'edit') {
                                            board += '<td id="' + divid + '"><span id="' + divid + '">' + datarow + '</span></td>';
                                        } else {
                                            board += '<td><input ' + divid + '" type="text" value="' + datarow + '"></td>';
                                        }
                                    }
                                }
                                board += '</tr>';
                            }
                            const boardElement = document.querySelector(board);
                            const container = document.getElementById(f.adata);

                            if (boardElement && container) {
                                container.appendChild(boardElement);
                            }
                        } else {
                            gs.ui.reset('#pagination');
                            // Create a new <tr> element
                            const newRow = document.createElement('tr');
                            newRow.textContent = 'No results!';
// Select the target container
                            const container = document.getElementById(f.adata);

                            if (container) {
                                container.appendChild(newRow);
                            }
                        }

                        //APPEND SORT, COUNTER, PAGINATION
                        // Update the counter text
                        const counter = document.getElementById('counter');
                        if (counter) {
                            counter.textContent = data[0].count;
                        }

// Update the order label text
                        const orderLabel = document.getElementById('order_label');
                        if (orderLabel) {
                            orderLabel.textContent = order + " - page: " + f.page;
                        }

                        if (typeof (data[0].count) != 'undefined') {
                            gs.ui.pagination.get(f.pagenum, data[0].count, G.is.pagin);
                        }

                        //if img exist
                        // if(images==1) {
                        //     gs.ui.table.get_imgs({ids: ids.join(","), mediagrpid: mediagrpid});
                        // }

                    },
                    error: function (xhr, status, error) {
                        console.log(error);
                        console.log(xhr.textStatus)
                        console.log('error ' + status);
                    }
                });

            },
            editable: function (id) {
                // console.log(id)
                // Find the <td> element with the specified ID
                const cell = document.querySelector('td[id="' + id + '"]');
                if (cell) {
                    // Create the new input element
                    const input = document.createElement('input');
                    input.id = id;
                    input.value = 'drosakis111';

                    // Clear the existing content and append the new input element
                    cell.innerHTML = '';
                    cell.appendChild(input);
                }

            }
        },
        checkedAll: function (form) {
            var checked = false;
            var aa = document.getElementById('form');
            if (checked == false) {
                checked = true
            } else {
                checked = false
            }
            for (var i = 0; i < aa.elements.length; i++) {
                aa.elements[i].checked = checked;
            }
        },
        /*
         data[0] : direction : previous || next
         data[1] : db table to check for direction
         data[2] : get parameter
         data[3] : current get value
         data[4] : redirect body
         */
        goto: function (data) {
            var index, direct, value = parseInt(data[3]);

            gs.db().func('fetchList1', data[2] + ',' + data[1] + ',' + 'ORDER BY id', function (list) {
                //  console.log(list)
                if (typeof (data[0]) != 'number') {
                    for (var i = 0; i < list.length; i++) list[i] = parseInt(list[i], 10);
                }
                index = list.indexOf(value);
                if (index >= 0 && index < list.length) {
                    if (data[0] == 'previous') {
                        direct = typeof list[index - 1] != 'undefined' ? list[index - 1] : list[list.length - 1];
                    } else if (data[0] == 'next') {
                        direct = typeof list[index + 1] != 'undefined' ? list[index + 1] : list[0];
                    }
                }
                location.href = data[4] + direct;
            });
        },
        //type :  info |  danger | success | warning
        notify: function (type, title, message, url) {
            $.notify({
                // options
                icon: 'glyphicon glyphicon-' + type + '-sign',
                title: title,
                message: message,
                url: url,
                target: '_blank'
            }, {
                // settings
                element: 'body',
                position: null,
                type: type,
                allow_dismiss: true,
                newest_on_top: false,
                showProgressbar: false,
                placement: {
                    from: "bottom",
                    align: "left"
                },
                offset: 20,
                spacing: 10,
                z_index: 1031,
                delay: 5000,
                timer: 1000,
                url_target: '_blank',
                mouse_over: null,
                animate: {
                    enter: 'animated fadeInDown',
                    exit: 'animated fadeOutUp'
                },
                onShow: null,
                onShown: null,
                onClose: null,
                onClosed: null,
                icon_type: 'class',
                template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                    '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
                    '<span data-notify="icon"></span> ' +
                    '<span data-notify="title">{1}</span> ' +
                    // '<span data-notify="message">{2}</span>' +
                    '<div class="progress" data-notify="progressbar">' +
                    '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                    '</div>' +
                    (!url ? '' : '<a href="{3}" target="{4}" data-notify="url"></a>') +
                    '</div>'
            });
        },
        notification: {
            permission: function () {
                // Let's check if the browser supports notifications
                if (!("Notification" in window)) {
                    console.log("This browser does not support desktop notification");
                }

                // Let's check whether notification permissions have already been granted
                else if (Notification.permission === "granted") {
                    // If it's okay let's create a notification
                    console.log('notication granted');
                }

                // Otherwise, we need to ask the user for permission
                else if (Notification.permission !== "denied") {
                    Notification.requestPermission(function (permission) {
                        // If the user accepts, let's create a notification
                        if (permission === "granted") {
                            console.log('notication granted');
                            // var notification = new Notification("Hi there!");
                        }
                    });
                }

                // At last, if the user has denied notifications, and you
                // want to be respectful there is no need to bother them any more.
                Notification.requestPermission().then(function (result) {
                    console.log(result);
                });
            },
            set: function (activity, body, icon, title, link) {
                var n;
                var link = link;
                if (activity == 1) {
                    var options = {
                        body: body,
                        icon: icon
                    };
                    n = new Notification(title, options);
                    n.onclick = function () {
                        window.open(link);
                    };
                } else if (activity == 0) {
                    if (typeof (n) != 'undefined') n.close();
                }
            },
            unset: function () {

            }
        },
        pagination2: function (current, total_results, results_per_page) {
            var currentPage = parseInt(current);
            var lastPage = Math.ceil(total_results / results_per_page);
            var previous = currentPage !== 1 ? '<button id="page_' + (currentPage - 1) + '" class="glyphicon glyphicon-chevron-left"></button>' : '';
            var firstb = '<button id="page_1">1</button>';
            var list = '';

            var starting = currentPage <= 5 ? 2 : currentPage - 4;
            var ending = lastPage < 10 ? lastPage : (currentPage <= 5 ? 10
                    : (
                        currentPage === lastPage
                            ? lastPage
                            : (
                                lastPage - currentPage >= 4
                                    ? currentPage + 4
                                    : currentPage + (lastPage - currentPage)
                            )
                    )
            );

            for (var i = starting; i <= ending; i++) {
                list += '<button id="page_' + i + '">' + i + '</button>';
            }

            var lastb = currentPage !== lastPage ? '<button id="page_' + lastPage + '">Last</button>' : '';
            var next = currentPage !== lastPage ? '<button id="page_' + (currentPage + 1) + '" class="glyphicon glyphicon-chevron-right"></button>' : '';

            var pagination = '<div class="pagin">' + previous + firstb + list + lastb + next + '</div>';

            const paginationElement = document.getElementById('pagination');
            if (paginationElement) {
                paginationElement.innerHTML = pagination; // Update the inner HTML
            }

            // Set selected page
            const selectedButton = document.getElementById('page_' + currentPage);
            if (selectedButton) {
                selectedButton.classList.add('pageSelected'); // Mark selected
            }
        },
        pagination: {
            get: function (current, total_results, results_per_page, loopname) {
                var loopname = loopname || '';
                gs.ui.reset('pagination'); // Reset the pagination container

                var last = Math.ceil(total_results / results_per_page);
                var previous = current !== 1 ? this.createButton(current - 1, loopname, 'glyphicon glyphicon-chevron-left', 'Previous') : '';
                var firstb = current > 1 ? this.createButton(1, loopname, '', 'First') : '';
                var list = '';

                // Only show Current - 1, Current, Current + 1
                var start = current > 1 ? current - 1 : current;
                var end = current < last ? current + 1 : current;

                // Ensure we don’t go beyond the bounds
                if (start < 1) {
                    start = 1;
                }
                if (end > last) {
                    end = last;
                }

                // Create buttons for Current - 1, Current, and Current + 1
                for (var i = start; i <= end; i++) {
                    if (Math.abs(current - i) <= 1) {
                    list += this.createButton(i, loopname, '', i);
                }}

                var lastb = current !== last ? this.createButton(last, loopname, '', 'Last') : '';
                var next = current !== last ? this.createButton(current + 1, loopname, 'glyphicon glyphicon-chevron-right', 'Next') : '';

                document.getElementById('pagination').innerHTML = '<div class="pagin">' + previous + firstb + list + lastb + next + '</div>';

                // Set selected page
                var selectedButton = document.getElementById('page_' + current);
                if (selectedButton) {
                    selectedButton.classList.add('pageSelected'); // Mark selected
                }
            },

            createButton: function (page, loopname, iconClass, label) {
                return '<button value="' + loopname + '" onclick="gs.ui.pagination.page(this)" id="page_' + page + '" class="' + iconClass + '">' + label + '</button>';
            },

            page: function (obj) {
                // Get the page number from the button's ID
                var page = obj.id.split('_')[1];

                // Save the current page state using the gs object
                gs.coo(obj.value + '_page', page);

                // Reset the relevant container for the new page data
                gs.ui.reset(obj.value);

                // Call the function associated with the list name
                var listName = obj.value + 'list';
                if (typeof window[listName] === 'function') {
                    window[listName](); // Ensure the function exists before calling it
                }
            },
        },

        reset: function (div) {
            // Clear the specified div
            var element = document.getElementById(div);
            if (element) {
                element.innerHTML = ''; // Clear content
            }
        },        /*
         * Switcher hides/shows one/more divs
         * @div Array OR String ie toggles visibility of one/more divs with another
         * @display block, inline-block etc
         * @effect no effect just open-close, fade, slide
         * */
        switcher: function (div, effect, display = 'block') {
            if (Array.isArray(div)) {
                const [readid, editid] = div;
                const editElement = document.querySelector(editid);
                const readElement = document.querySelector(readid);

                if (getComputedStyle(readElement).display === 'none') {
                    if (effect) {
                        if (effect === 'fade') {
                            // Fade effect
                            editElement.style.transition = 'opacity 0.5s';
                            readElement.style.transition = 'opacity 0.5s';
                            editElement.style.opacity = '0';
                            readElement.style.opacity = '1';
                            setTimeout(() => {
                                editElement.style.display = 'none';
                                readElement.style.display = display;
                                readElement.style.opacity = ''; // Reset opacity for future transitions
                            }, 500); // Match the transition duration
                        } else {
                            // Other effects, assume not predefined
                            editElement.style.display = 'none';
                            readElement.style.display = display;
                        }
                    } else {
                        editElement.style.display = 'none';
                        readElement.style.display = display;
                    }
                } else {
                    if (effect) {
                        if (effect === 'fade') {
                            // Fade out/in effect
                            readElement.style.transition = 'opacity 0.5s';
                            editElement.style.transition = 'opacity 0.5s';
                            readElement.style.opacity = '0';
                            editElement.style.opacity = '1';
                            setTimeout(() => {
                                readElement.style.display = 'none';
                                editElement.style.display = display;
                                editElement.style.opacity = ''; // Reset opacity for future transitions
                            }, 500); // Match the transition duration
                        } else {
                            // Other effects, assume not predefined
                            readElement.style.display = 'none';
                            editElement.style.display = display;
                        }
                    } else {
                        readElement.style.display = 'none';
                        editElement.style.display = display;
                    }
                }
            } else {
                const editElement = document.querySelector(div);
                if (getComputedStyle(editElement).display === 'none') {
                    if (!effect) {
                        editElement.style.display = display;
                    } else if (effect === 'fade') {
                        // Fade in effect
                        editElement.style.transition = 'opacity 0.5s';
                        editElement.style.opacity = '1';
                        editElement.style.display = display;
                        setTimeout(() => {
                            editElement.style.opacity = ''; // Reset opacity for future transitions
                        }, 500); // Match the transition duration
                    } else if (effect === 'slide') {
                        // Slide effect (simplified example)
                        editElement.style.transition = 'max-height 0.5s ease-out';
                        editElement.style.maxHeight = editElement.scrollHeight + 'px';
                        editElement.style.overflow = 'hidden';
                        setTimeout(() => {
                            editElement.style.display = display;
                            editElement.style.maxHeight = '';
                        }, 500); // Match the transition duration
                    }
                } else {
                    if (!effect) {
                        editElement.style.display = 'none';
                    } else if (effect === 'fade') {
                        // Fade out effect
                        editElement.style.transition = 'opacity 0.5s';
                        editElement.style.opacity = '0';
                        setTimeout(() => {
                            editElement.style.display = 'none';
                            editElement.style.opacity = ''; // Reset opacity for future transitions
                        }, 500); // Match the transition duration
                    } else if (effect === 'slide') {
                        // Slide effect (simplified example)
                        editElement.style.transition = 'max-height 0.5s ease-in';
                        editElement.style.maxHeight = editElement.scrollHeight + 'px';
                        setTimeout(() => {
                            editElement.style.display = 'none';
                            editElement.style.maxHeight = '';
                        }, 500); // Match the transition duration
                    }
                }
            }
        },
//table produces TABLES- * type:  a | img | button | date * update if img gs.db().func, add hidden mediagrp
        tree: function () {
            // Hide all subfolders at startup
            document.querySelectorAll(".filedir UL").forEach(ul => ul.style.display = 'none');
            // Expand/collapse on click
            document.querySelectorAll(".tree-dir A").forEach(anchor => {
                anchor.addEventListener('click', function (event) {
                    const ul = this.parentNode.querySelector("UL:first-of-type");
                    if (ul) {
                        ul.style.transition = 'max-height 0.3s ease'; // Add transition for slide effect
                        if (ul.style.display === 'none') {
                            ul.style.display = 'block';
                            ul.style.maxHeight = ul.scrollHeight + 'px'; // Set maxHeight for slide down
                        } else {
                            ul.style.maxHeight = '0'; // Set maxHeight to 0 for slide up
                            setTimeout(() => {
                                ul.style.display = 'none'; // Hide element after sliding up
                            }, 300); // Match transition duration
                        }
                    }
                    if (this.parentNode.classList.contains('tree-dir')) {
                        event.preventDefault();
                    }
                });
            });
        },
        viewer: {
            img: function () {
                // Collect all image URLs
                const hrefs = [];
                const pattern = /^(http|https|ftp)/;  // Exclude https
                document.querySelectorAll('.viewImage').forEach(function (el) {
                    const href = el.getAttribute('href');
                    if (href !== '/admin/img/myface.jpg' && href !== '') {
                        hrefs.push(href);
                    }
                });
                // Remove duplicates
                const uniqueHrefs = [...new Set(hrefs)];

                // Open modal image viewer
                document.addEventListener('click', function (e) {
                    if (e.target.matches('.viewImage, .viewVideo')) {
                        e.preventDefault();
                        const imgHref = e.target.getAttribute('href');
                        const imgid = e.target.parentElement.getAttribute('id');

                        // Get index of current image
                        const index = uniqueHrefs.indexOf(imgHref);

                        // Create modal HTML
                        const modalHtml = `
                    <div class="myPhotosGallery" id="modal${imgid}">
                        <div id="prev_${imgid}" class="arrowGalleryL"></div>
                        <img id="img_${imgid}" src="${imgHref}" width="100%">
                        <div id="next_${imgid}" class="arrowGalleryR"></div>
                        <div class="viewTitle"></div>
                    </div>`;

                        // Create and display the modal
                        const modal = document.createElement('div');
                        modal.innerHTML = modalHtml;
                        modal.classList.add('modal');
                        document.body.appendChild(modal);

                        // Set title with image counter
                        const viewCounter = document.getElementById('viewCounter');
                        viewCounter.textContent = `${index + 1} / ${uniqueHrefs.length}`;
                    }
                });

                // Handle image navigation (left/right)
                document.addEventListener('click', function (e) {
                    if (e.target.matches('.arrowGalleryR, .arrowGalleryL')) {
                        const imgid = e.target.parentElement.getAttribute('id').replace('modal', '');
                        const img = document.getElementById(`img_${imgid}`);
                        const href = img.getAttribute('src');

                        // Get current index and direction
                        const index = uniqueHrefs.indexOf(href);
                        const direction = e.target.classList.contains('arrowGalleryR') ? 'R' : 'L';

                        // Calculate new index
                        const newIndex = direction === 'R'
                            ? (index === uniqueHrefs.length - 1 ? 0 : index + 1)
                            : (index === 0 ? uniqueHrefs.length - 1 : index - 1);

                        // Update image and counter
                        document.getElementById('viewCounter').textContent = `${newIndex + 1} / ${uniqueHrefs.length}`;
                        img.style.opacity = 0;
                        setTimeout(function () {
                            img.setAttribute('src', uniqueHrefs[newIndex]);
                            img.style.opacity = 1;
                        }, 300); // Match transition duration
                    }
                });
            }
        },        /*
         * PDF VIEWER - DOWNLOADER
         * just add the class view-pdf and follow this time of format
         * <a class="printGrey  btn-primary view-pdf" href="https://"+document.domain+"/print/post.php?uname=upvolume&amp;pname=art18" id="print_12183" title="art18"></a>
         *
         * */
        pdf: function () {
            document.addEventListener('click', function (e) {
                if (e.target.matches('.view-pdf')) {
                    e.preventDefault();

                    var pdfLink = e.target.getAttribute('href');
                    var iframe = `<div class="iframe-container"><iframe src="${pdfLink}" width="100%" height="600px"></iframe></div>`;

                    // Create modal
                    var modal = document.createElement('div');
                    modal.classList.add('modal');
                    modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${e.target.getAttribute('title')}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${iframe}
                    </div>
                    <div class="modal-footer">
                        <button class="print-button">Print</button>
                    </div>
                </div>`;

                    document.body.appendChild(modal);

                    // Print button functionality
                    modal.querySelector('.print-button').addEventListener('click', function () {
                        var iframe = modal.querySelector('iframe');
                        iframe.contentWindow.print();
                    });

                    // Close button functionality
                    modal.querySelector('.modal-close').addEventListener('click', function () {
                        document.body.removeChild(modal);
                    });

                    return false;
                }
            });
        }
    },

    /**
     ActivityManager
     notification manager from ermis system
     USAGE: gs.activity.init();
     */
    activity :{
        maxVisibleActivities: 5,
        totalActivitiesToShow: 10,
        activities: [],
        activitySet: new Set(),
        currentIndex: 0,

        init() {
            document.getElementById('show-more-btn').addEventListener('click', () => {
                this.toggleActivityVisibility();
            });
        },

        add(text) {
            if (this.activitySet.has(text)) {
                console.log('Activity already exists, skipping:', text);
                return;
            }

            const activityList = document.getElementById('activity-list');
            const newActivity = document.createElement('div');
            newActivity.classList.add('activity');
            newActivity.textContent = text;

            // Prepend new activity to the start of the list
            activityList.insertBefore(newActivity, activityList.firstChild);

            this.activities.unshift(newActivity); // Add to the start of the array
            this.activitySet.add(text);

            // Remove the oldest activity if the total number exceeds the limit
            if (this.activities.length > this.totalActivitiesToShow) {
                const removed = this.activities.pop(); // Remove from the end of the array
                this.activitySet.delete(removed.textContent);
                removed.remove();
            }

            this.updateVisibility();
        },

        updateVisibility() {
            const visibleActivities = this.activities.slice(this.currentIndex, this.currentIndex + this.maxVisibleActivities);
            const hiddenActivities = this.activities.slice(this.currentIndex + this.maxVisibleActivities);

            visibleActivities.forEach(activity => activity.style.display = 'block');
            hiddenActivities.forEach(activity => activity.style.display = 'none');

            // Adjust button text based on visibility
            const showMoreBtn = document.getElementById('show-more-btn');
            if (hiddenActivities.length === 0) {
                showMoreBtn.textContent = '▲ Show Less';
            } else {
                showMoreBtn.textContent = '▼ Show More';
            }
        },

        toggleActivityVisibility() {
            this.currentIndex += this.maxVisibleActivities;
            if (this.currentIndex >= this.activities.length) {
                this.currentIndex = 0; // Reset to show from the beginning if reached end
            }
            this.updateVisibility();
        }
    },

    /**
SOLR SELECT & FETCH
 */
solr : {
        select: async function(query, pagenum = 1, rowsperpage = 10) {
            const solrUrl = 'https://vivalibro.com/solr/solr_vivalibro/select';

            const params = new URLSearchParams({
                'q': query,
                'start': (pagenum - 1) * rowsperpage,// Calculate the start based on the current page
                'rows': rowsperpage,
                'indent': 'true',
                'q.op': 'OR',
            });

            try {
                const response = await fetch(`${solrUrl}?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data); // Log the entire response for debugging

                // Check the status of the response
                if (data.responseHeader.status === 0) {
                    // Return the documents found
                    return data.response;
                } else {
                    console.error("Error in response:", data.responseHeader.status);
                    return [];
                }
            } catch (error) {
                console.error("Fetch error:", error);
                return [];
            }
        },
    },
};

    /**
API
access executes core.maria method
update
gs.maria = async function(db,method, query,params){
const pms = { query, params: params || [] };
const url= `${G.SITE_URL}api/v1/${database}/${method}`;
console.log(pms);
console.log(url);
try {
const response = await fetch(url, {
method: 'POST',
body: JSON.stringify(pms),
headers: { 'Content-Type': 'application/json' }
});
if (!response.ok) {
throw new Error('HTTP error ' + response.status);
}
const jsonData = await response.json();
return jsonData;
} catch (error) {
console.error('Error:', error);
throw error; // Re-throw error to be caught by caller
}
}
};
*/
const baseApi = {
    _request: async (fun, query, params, database) => {
        const pms = { query, params: params || [] };
        const url= `${G.SITE_URL}api/v1/${database}/${fun}`;
        console.log(pms);
        console.log(url);
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(pms),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }
            const jsonData = await response.json();
            return jsonData;
        } catch (error) {
            console.error('Error:', error);
            throw error; // Re-throw error to be caught by caller
        }
    }
};

gs.api = gs.api || {};
const databases = ['maria','admin'];
// Methods to assign
const methods = ['fa', 'f', 'fl','inse', 'q','columns','form','sort'];
// Dynamically assign to each database
databases.forEach((db) => {
    gs.api[db] = Object.assign({}, baseApi);
    methods.forEach((method) => {
        gs.api[db][method] = async (query, params) => { // Add `async` here
            return await gs.api[db]._request(method, query, params, db);
        };
    });
});