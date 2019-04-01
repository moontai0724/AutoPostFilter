module.exports = { water, deleteWater, checkWaterCount, checkWaterStatus, checkWater };

const cheerio = require("cheerio");

const AuthorizedRequest = require("./AuthorizedRequest.js");

/**
 * To get CSRFToken for authorize.
 * @returns {Promise<String>} token.
 */
function getCSRFToken() {
    return new Promise(function (resolve, reject) {
        AuthorizedRequest.get("https://forum.gamer.com.tw/ajax/getCSRFToken.php").then(resolve, reject);
    });
}

/**
 * Water someone
 * @param {Number} bsn Board SN
 * @param {String} userId User to ban
 * @param {String} url Place where user do wrong
 * @param {Number} day Days of the water time
 * @param {String} reason Water reason!
 * @param {String} time The given time is used to check water status.
 * @returns {Promise<String>} html file that server response.
 */
function water(bsn, userId, url, day, reason, time) {
    return new Promise(async function (resolve, reject) {
        console.log("doWater: ", bsn, userId, url, day, reason, time);

        if (await checkWaterStatus(bsn, userId, (new Date(time).getTime()))) {
            AuthorizedRequest.post("https://forum.gamer.com.tw/ajax/watera.php", {
                bsn: bsn,
                type: 1,
                length: day,
                reason: reason,
                id: userId,
                linkurl: url,
                sn: 0,
                token: await getCSRFToken()
            }).then(data => {
                if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
                if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
                console.log("Water success: ", bsn, userId, url, day, reason, time);
                resolve(data);
            }, reject);
        }
    });
}

/**
 * Delete water
 * @param {Number} bsn Board SN
 * @param {Number} id ID of the water to delete.
 * @returns {Promise<String>} html file that server response.
 */
function deleteWater(bsn, id) {
    return new Promise(async function (resolve, reject) {
        console.log("deleteWater: ", bsn, id);

        AuthorizedRequest.post(`https://forum.gamer.com.tw/gemadmin/delwater.php?bsn=${bsn}`, {
            code: await getCSRFToken(),
            "dwater[]": id
        }).then(data => {
            if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
            if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
            console.log("deleteWater success: ", bsn, id);
            resolve(data);
        }, reject);
    });
}

/**
 * Check times of water time, 初犯(1)、再犯(2)、累犯(3)
 * @param {Number} bsn Board SN
 * @param {String} userId id of the user to search
 * @returns {Promise<Number>} times of water
 */
function checkWaterCount(bsn, userId) {
    return new Promise(function (resolve, reject) {
        AuthorizedRequest.post(`https://forum.gamer.com.tw/ajax/checkwater.php`, {
            bsn: bsn,
            type: 1,
            uid: userId,
            sn: 0
        }).then(data => {
            if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
            if (JSON.parse(data) && JSON.parse(data).error) reject(JSON.parse(data).error);
            resolve(JSON.parse(data).days / 30);
        }, reject);
    });
}

/**
 * To check water status.
 * @param {Number} bsn Board SN
 * @param {String} userId User to check
 * @param {String} time time to compare
 */
function checkWaterStatus(bsn, userId, time) {
    return new Promise(function (resolve, reject) {
        AuthorizedRequest.get(`https://forum.gamer.com.tw/water.php?bsn=${bsn}&u=${userId}`).then(html => {
            let html = cheerio(htmlCode);

            if (html.find("#BH-master tr").length > 1) {
                let date = html.find("#BH-master tr:nth-child(2) td:nth-child(2)")[0].innerText.replace(/\s/g, '').split('~');
                if ((new Date(time).getTime()) < (new Date(date[1]).getTime())) resolve(false);
                else resolve(true);
            } else resolve(true);
        }, reject);
    });
}

/**
 * To get infomation of a water history
 * @param {Number} bsn Board SN
 * @param {String} userId id of the user to search
 * @param {Number} sn SN of the water to search
 * @returns {Promise<JSON>} JSON format parameter that server response.
 */
function checkWater(bsn, userId, sn) {
    return new Promise(function (resolve, reject) {
        AuthorizedRequest.post(`https://forum.gamer.com.tw/ajax/checkwater.php`, {
            bsn: bsn,
            type: 2,
            uid: userId,
            sn: sn
        }).then(data => {
            if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
            if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
            resolve(data);
        }, error => {
            console.error("checkWater error: ", error);
            reject(error);
        });
    });
}