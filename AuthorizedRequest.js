module.exports = { get, post };

const fs = require("fs");
const path = require("path");
const request = require("request");

if (!fs.existsSync(path.join(__dirname, "config.json")))
    fs.writeFileSync(path.join(__dirname, "config.json"), `{\n\t"${["BAHAENUR", "BAHARUNE"].join(`": "",\n\t"`)}"\n}`);

const config = require(path.join(__dirname, "config.json"));

var cookies = [];
for (let key in config)
    cookies.push(`${key}=${config[key]}`);

/**
 * Set cookie storage file to server responsed headers/set-cookie
 * @param {Array} responsedCookie Cookies which responsed by server in headers/set-cookie.
 */
function setCookie(responsedCookie) {
    if (responsedCookie.length > 0) {
        responsedCookie.forEach(value => {
            value = value.split("; ")[0].match(/([\s\S]*)\=([\s\S]*)/);
            config[value[1]] = value[2];

            if (value[2] == "deleted")
                delete config[value[1]];
        });

        cookies = [];
        for (let key in config)
            cookies.push(`${key}=${config[key]}`);

        fs.writeFileSync(path.join(__dirname, "config.json"), `{\n\t"${cookies.map(value => value.replace("=", `": "`)).join(`",\n\t"`)}"\n}`);
    }
}

/**
 * Do a http get action with specific cookies.
 * @param {String} url url to post
 * @param {JSON|String} data Form Data
 */
function get(url) {
    return new Promise((resolve, reject) => {
        request.get({
            url: url,
            headers: {
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
                "cookie": cookies.join("; ")
            }
        }, function (err, response) {
            setCookie(response.headers["set-cookie"]);

            if (err) {
                console.error(url, "onGetError: ", err);
                reject(err);
            } else resolve(response.body);
        });
    });
}

/**
 * Do a http post action with specific cookies.
 * @param {String} url url to post
 * @param {JSON|String} data Form Data
 * @param {Number} [ckFORUM_MA] A 4-digit key for BM management use.
 */
function post(url, data, ckFORUM_MA) {
    return new Promise((resolve, reject) => {
        request.post({
            url: url,
            headers: {
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
                "cookie": (ckFORUM_MA ? cookies.concat(`ckFORUM_MA=${ckFORUM_MA}`) : cookies).join("; ")
            },
            form: data
        }, function (err, response) {
            setCookie(response.headers["set-cookie"]);

            if (err) {
                console.error(url, "onPostError: ", err);
                reject(err);
            } else resolve(response.body);
        });
    });
}