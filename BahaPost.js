module.exports = { lock, unlock, delete: del, recover, move, accuse };

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
 * Lock the discussion(s).
 * @param {Number} bsn bsn of the post.
 * @param {Number} snA snA of the post(s) in array or single number.
 * @param {String} reason delete reason.
 * @returns {Promise<String>} html file that server response.
 */
function lock(bsn, snA, reason = "") {
    return new Promise(function (resolve, reject) {
        console.log(`doLock: https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}#`, reason);

        AuthorizedRequest.get(`https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}`).then(html => {
            if (cheerio(html).find('#post_textarea_1').length > 0) {
                let ckFORUM_MA = /vcode=(\d{4})/.exec(html)[1];

                AuthorizedRequest.post(`https://forum.gamer.com.tw/marticle.php?bsn=${bsn}&type=lock&iflock=1&lockreason=${encodeURIComponent(reason)}`, {
                    "vcode": ckFORUM_MA,
                    "jsn[]": snA
                }, ckFORUM_MA).then(data => {
                    if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
                    if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
                    console.log(`Lock success: https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}#`, reason);
                    resolve(data);
                }, reject);
            } else {
                console.warn(`Didn't lock post because it was already locked: https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}#`);
                reject("Already locked");
            }
        }, reject);
    });
}

/**
 * Unlock the discussion(s).
 * @param {Number} bsn bsn of the post.
 * @param {Number} snA snA of the post(s) in array or single number.
 * @returns {Promise<String>} html file that server response.
 */
function unlock(bsn, snA) {
    return new Promise(function (resolve, reject) {
        console.log(`doUnlock: https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}#`, reason);

        AuthorizedRequest.get(`https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}`).then(html => {
            let ckFORUM_MA = /vcode=(\d{4})/.exec(html)[1];

            AuthorizedRequest.post(`https://forum.gamer.com.tw/marticle.php?bsn=${bsn}&type=lock&iflock=2`, {
                "vcode": ckFORUM_MA,
                "jsn[]": snA
            }, ckFORUM_MA).then(data => {
                if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
                if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
                console.log(`Unlock Success: https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}#`);
                resolve(data);
            }, reject);
        }, reject);
    });
}

/**
 * To delete post(s).
 * @param {Number} bsn bsn of the post.
 * @param {Array<Number>} sn SN of the post(s) in array or single number, NOT snA!
 * @param {Boolean} doubles Double(true) or not(false)? to recover the reward of post.
 * @param {String} reason delete reason.
 * @returns {Promise<String>} html file that server response.
 */
function del(bsn, sn, doubles, reason = "") {
    return new Promise(function (resolve, reject) {
        console.log(`Delete: https://forum.gamer.com.tw/Co.php?bsn=${bsn}&sn=${sn}`, Number(doubles), reason);

        AuthorizedRequest.get(`https://forum.gamer.com.tw/Co.php?bsn=${bsn}&sn=${sn}`).then(html => {
            let ckFORUM_MA = /vcode=(\d{4})/.exec(html)[1];

            AuthorizedRequest.post(`https://forum.gamer.com.tw/marticle.php?bsn=${bsn}&type=del&all=1&dreason=${encodeURIComponent(reason)}&doubles=${Number(doubles)}`, {
                vcode: ckFORUM_MA,
                gparent: 0,
                unlock: 0,
                "jsn[]": sn
            }, ckFORUM_MA).then(data => {
                if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
                if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
                console.log(`Delete Success: https://forum.gamer.com.tw/Co.php?bsn=${bsn}&sn=${sn}#`, reason);
                resolve(data);
            }, reject);
        }, reject);
    });
}

/**
 * To recover a post.
 * @param {Number} bsn bsn of the post.
 * @param {Number} snA snA of the post.
 * @param {Number} sn SN of the post(s) in array or single number, NOT snA!
 * @returns {Promise<String>} html file that server response.
 */
function recover(bsn, snA, sn) {
    return new Promise(function (resolve, reject) {
        AuthorizedRequest.get(`https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}`).then(html => {
            let ckFORUM_MA = /vcode=(\d{4})/.exec(html)[1];

            AuthorizedRequest.post(`https://forum.gamer.com.tw/marticle.php?bsn=${bsn}&type=recover&all=1&snA=${snA}`, {
                vcode: ckFORUM_MA,
                gparent: 0,
                unlock: 0,
                "jsn[]": sn
            }, ckFORUM_MA).then(data => {
                if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
                if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
                console.log(`Recover success: https://forum.gamer.com.tw/Co.php?bsn=${bsn}&snA=${snA}&sn=${sn}`);
                resolve(data);
            }, reject);
        }, reject);
    });
}

/**
 * Move post to a subboard.
 * @param {Number} bsn bsn of the post.
 * @param {Number} snA snA of the post.
 * @param {Number} subbsn sub board number
 */
function move(bsn, snA, subbsn) {
    return new Promise(function (resolve, reject) {
        AuthorizedRequest.get(`https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}`).then(html => {
            let ckFORUM_MA = /vcode=(\d{4})/.exec(html)[1];

            AuthorizedRequest.post(`https://forum.gamer.com.tw/marticle.php?bsn=${bsn}&type=move_sub`, {
                vcode: ckFORUM_MA,
                subbsn: subbsn,
                "jsn[]": snA
            }, ckFORUM_MA).then(data => {
                if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
                if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
                console.log(`Move success: https://forum.gamer.com.tw/C.php?bsn=${bsn}&snA=${snA}`, subbsn);
                resolve(data);
            }, reject);
        }, reject);
    });
}

/**
 * Accuse a post.
 * @param {Number} bsn Board SN
 * @param {Number} sn SN of the single post
 * @param {String} reason Accuse reason.
 * @returns {Promise<String>} html file that server response.
 */
function accuse(bsn, sn, reason = "") {
    return new Promise(async function (resolve, reject) {
        console.log(`doAccuse: https://forum.gamer.com.tw/Co.php?bsn=${bsn}&sn=${sn}`, reason);

        AuthorizedRequest.post("https://forum.gamer.com.tw/ajax/accuse_postdata2.php", {
            bsn: bsn,
            sn: sn,
            aExp: reason,
            token: await getCSRFToken()
        }).then(data => {
            if (/<title>巴哈姆特電玩資訊站 - 系統訊息<\/title>/.test(data)) reject(/訊息[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(data)[1]);
            if (JSON.parse(JSON.stringify(data)).error) reject(JSON.parse(data).error);
            console.log(`Accuse success: https://forum.gamer.com.tw/Co.php?bsn=${bsn}&sn=${sn}`, reason);
            resolve(data);
        }, reject);
    });
}