function saveOptions(e) {
    e.preventDefault();

    browser.storage.sync.set({
        annoUnrev: document.querySelector("#annoUnrev").checked,
        annoVer: document.querySelector("#annoVer").checked,
        annoAccept: document.querySelector("#annoAccept").checked,
        recirculated: document.querySelector("#recirculated").checked,
        comments: document.querySelector("#comments").checked
    });
}

function restoreOptions() {
    function setOptions(result) {
        document.querySelector("#annoUnrev").checked = result.annoUnrev !== undefined ? result.annoUnrev : true
        document.querySelector("#annoVer").checked = result.annoVer !== undefined ? result.annoVer : true
        document.querySelector("#annoAccept").checked = result.annoVer !== undefined ? result.annoVer : true
        document.querySelector("#recirculated").checked = result.recirculated !== undefined ? result.recirculated : true
        document.querySelector("#comments").checked = result.comments !== undefined ? result.comments : true
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.sync.get(["annoUnrev", "annoVer", "annoAccept", "recirculated", "comments"])
    getting.then(setOptions, onError)
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
