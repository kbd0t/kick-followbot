// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://kick.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kick.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';



    /*
        =========================================
                    CONFIG SECTION
        =========================================
     */

    const config = {
        followTo: 218807, // Channel ID of the channel you want to follow to
        password: "", // Password of the account you want to use (leave blank if you want to use default password which is RanDomP@ssw0rdsjsj11!)
        usernamePrefix: "", // Prefix of the username you want to use (leave blank if you want to use username generated by the script without prefix)
    }

    /*
        =========================================
                  END OF CONFIG SECTION
        =========================================
        BELOW THIS LINE IS THE SCRIPT ITSELF
        DO NOT EDIT ANYTHING BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING
    */


    const randomID = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    getCookies = () => {
        let cookies = {};
        document.cookie.split('; ').forEach(r => {
            let [key,val] = r.split("=")
            cookies[key] = val
        })
        return cookies
    },
    handleRegistration = async () => {
        console.log('register')
        const [emailElem, moElem, dayElem, yrElem, userNameElem, passElem, confPassElem] = [
            document.getElementById('email'),
            ...document.querySelectorAll('[id*=headlessui-listbox-button-]'),
            document.getElementById('username'),
            document.getElementById('password'),
            document.getElementById('password_confirmation')
        ]

        if([emailElem, moElem, dayElem, yrElem, userNameElem, passElem, confPassElem].some(e => e==null)) return console.log('probably cloudflare error, wait for next refresh')

        emailElem.value = `${randomID(10)}@${randomID(5)}.com` // random email
        emailElem.dispatchEvent(new Event('input', { bubbles: true }))
        userNameElem.value = config.usernamePrefix + randomID(10) // random username
        userNameElem.dispatchEvent(new Event('input', { bubbles: true }))
        passElem.value = config.password == "" ? `RanDomP@ssw0rdsjsj11!` : config.password // random password
        passElem.dispatchEvent(new Event('input', { bubbles: true }))
        confPassElem.value = passElem.value // confirm password
        confPassElem.dispatchEvent(new Event('input', { bubbles: true }))

        for(let item of [moElem, dayElem, yrElem]){
            item.click()
            await wait(300)
            if(item !== yrElem) item.parentElement.querySelector('ul').querySelectorAll('li')[Math.floor(Math.random()*item.parentElement.querySelector('ul').querySelectorAll('li').length)].click()
            else {
                const year = Math.floor(Math.random()*(2003-1950))+1950
                const yrElems = item.parentElement.querySelector('ul').querySelectorAll('li');
                [...yrElems].find(e => e.value == year).click()
            }
            await wait(200)
        }

        document.querySelector('[type=submit]').click() // submit form
    },
    handleFollow = async () => {
        console.log('follow')
        const token = getCookies()['XSRF-TOKEN'].replaceAll('%3D', "=");
    
        let r;
        r = await fetch("https://kick.com/api/v1/signup/agreed-terms", {
          "headers": {
            "accept": "application/json, text/plain, */*",
            "authorization": `Bearer ${token}`,
            "content-type": "application/json",
            "x-xsrf-token": token
          },
          "body": JSON.stringify({"agreed":true}),
          "method": "POST",
          "credentials": "include"
        });
        console.log(r.status == 201 ? "Accepted terms" : "fail accepting terms")
        r = await fetch("https://kick.com/api/v1/channels/user/subscribe", {
          "headers": {
            "authorization": `Bearer ${token}`,
            "content-type": "application/json",
            "x-xsrf-token": token
          },
          "body": JSON.stringify({"channel_id":config.followTo}),
          "method": "POST",
          "credentials": "include"
        });
        console.log(r.status == 201 ? "followed" : "fail followed")

        const elem = [...document.querySelectorAll('div > span')].find(e => e.innerText == "Start over")
        if(elem) elem.click()
    },
    handleURLchange = (url) => {
        if(url.endsWith('auth/signup')) return handleRegistration();
        if(url.endsWith('auth/email-verification')) return handleFollow();
    }

    let urlprev = "";
    setInterval(()=>{
        if(urlprev!==location.href)handleURLchange(location.href)
        urlprev = location.href
    },1000)
})();