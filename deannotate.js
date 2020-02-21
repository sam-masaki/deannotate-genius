// Only load if there are lyrics/annotated text
if (document.getElementsByClassName("lyrics").length !== 0
    || document.getElementsByTagName("lyrics").length !== 0) {
    browser.storage.sync.get(["annoUnrev", "annoVer", "annoAccept", "recirculated", "comments"]).then(gotSettings, onError)
}

var replacedComments
var replacedRecirculated
var replacedUnreviewed
var replacedVerified
var replacedAccepted

function gotSettings(result) {
    replacedUnreviewed = result.annoUnrev === undefined ? false : !result.annoUnrev
    replacedVerified = result.annoVer === undefined ? false : !result.annoVer
    replacedAccepted = result.annoAccept === undefined ? false : !result.annoAccept
    replacedRecirculated = result.recirculated === undefined ? false : !result.recirculated
    replacedComments = result.comments === undefined ? false : !result.comments

    // Remove initial annotations
    let allAnnotations = document.getElementsByClassName("referent")
    if (allAnnotations.length === 0) {
        replacedUnreviewed = true
        replacedVerified = true
        replacedAccepted = true
    } else {
        if (allAnnotations[0].parentElement.parentElement.className === "lyrics") {
            console.log(allAnnotations[0])
            Array.from(allAnnotations).forEach(replaceAnnotation)
        }
    }

    // Remove initial "More From Genius" stuff
    let recirculatedInitial = document.querySelector('div [initial-content-for="recirculated_content"]')
    if (recirculatedInitial !== undefined) {
        recirculatedInitial.replaceWith("")
    }

    observer.observe(document.body, { childList: true, subtree: true })
}

function onError(error) {
    console.log(`Error loading settings: ${error}`);
}

const observer = new MutationObserver(function() {
    checkComments()
    checkRecirculated()
    checkAnnotations()
    if (checkDone()) {
        observer.disconnect()
    }
})

function checkComments() {
    if (replacedComments) {
        return
    }

    let comments = document.getElementsByTagName("comments")[0]
    if (comments !== undefined) {
        comments.replaceWith("")
        replacedComments = true;
    }
}

function checkRecirculated() {
    if (replacedRecirculated) {
        return
    }

    let recirculated = document.getElementsByTagName("recirculated-content")[0]
    if (recirculated !== undefined) {
        recirculated.replaceWith("")
        replacedRecirculated = true;
    }
}

function checkAnnotations() {
    if (replacedUnreviewed && replacedVerified && replacedAccepted) {
        return
    }

    let allAnnotations = document.getElementsByClassName("referent")

    if (allAnnotations.length === 0) {
        return
    }

    let oldLen = allAnnotations.length
    Array.from(allAnnotations).forEach(replaceAnnotation)

    if (allAnnotations.length < oldLen) {
        replacedUnreviewed = true
        replacedVerified = true
        replacedAccepted = true
    }
}

function replaceAnnotation(item) {
    let classification = item.attributes["classification"].nodeValue

    console.log(item.innerText)
    console.log(classification)

    if (replacedVerified && classification === "verified") {
        return
    }
    if (replacedUnreviewed && classification === "unreviewed") {
        return
    }
    if (replacedAccepted && classification === "accepted") {
        return
    }

    // Replace breaks in mulitiline annotations with <br> objects
    let contents = item.innerText.split("\n")
    let replacement = []

    contents.forEach(function(item) {
        replacement.push(item)
        replacement.push(document.createElement("br"))
    })

    replacement.pop()

    item.replaceWith(...replacement)
}

function checkDone() {
    return replacedComments
        && replacedRecirculated
        && replacedVerified
        && replacedUnreviewed
        && replacedAccepted
}
