function onError(error) {
    console.log(`Error loading settings: ${error}`);
}

var replacedComments = false
var replacedRecirculated = false
var replacedUnreviewed = false
var replacedVerified = false
var replacedAccepted = false

function gotSettings(result) {
    if (result.annoUnrev !== undefined) {
        replacedUnreviewed = !result.annoUnrev
    }
    if (result.annoVer !== undefined) {
        replacedVerified = !result.annoUnrev
    }
    if (result.annoAccept !== undefined) {
        replacedAccepted = !result.annoUnrev
    }
    if (result.recirculated !== undefined) {
        replacedRecirculated = !result.recirculated
    }
    if (result.comments !== undefined) {
        replacedComments = !result.comments
    }

    if (document.getElementsByClassName("lyrics").length === 0
        && document.getElementsByTagName("lyrics").length === 0) {
        // This page doesn't have lyrics, so it isn't a song/something that has annotations
        replacedUnreviewed = true
        replacedVerified = true
        replacedAccepted = true

        replacedComments = true
        replacedRecirculated = true
    }

    // Remove initial annotations
    let allAnnotations = document.getElementsByClassName("referent")

    if (allAnnotations.length === 0) {
        // There are no annotations
        replacedUnreviewed = true
        replacedVerified = true
        replacedAccepted = true
    } else {
        if (allAnnotations[0].parentElement.parentElement.className === "lyrics") {
            // remove the initial annotations before they get replaced
            Array.from(allAnnotations).forEach(replaceAnnotation)
        }
    }

    // Remove initial "More From Genius" stuff
    let recirculatedInitial = document.querySelector('div [initial-content-for="recirculated_content"]')

    if (recirculatedInitial !== undefined) {
        // Removed initial recirculated stuff doesn't regenerate, so we don't need to remove it again later
        console.log("removed recirc initially")
        recirculatedInitial.replaceWith("")
    }

    observer.observe(document.body, { childList: true, subtree: true })
}

browser.storage.sync.get(["annoUnrev", "annoVer", "annoAccept", "recirculated", "comments"]).then(gotSettings, onError)

const observer = new MutationObserver(function(mutationsList) {
    console.log("observed mutation")

    checkComments()
    checkRecirculated()
    checkAnnotations()
    if (checkDone()) {
        observer.disconnect()
        return
    }
})

function checkComments() {
    if (!replacedComments) {
        let comments = document.getElementsByTagName("comments")[0]
        if (comments !== undefined) {
            comments.replaceWith("")
            replacedComments = true;
            console.log("found comments")
            return
        }
    }
}

function checkRecirculated() {
    if (!replacedRecirculated) {
        let recirculated = document.getElementsByTagName("recirculated-content")[0]
        if (recirculated !== undefined) {
            recirculated.replaceWith("")
            replacedRecirculated = true;
            console.log("found recirculated")
            return
        }
    }
}

function checkAnnotations() {
    if (!(replacedUnreviewed && replacedVerified && replacedAccepted)) {
        let allAnnotations = document.getElementsByClassName("referent")

        if (allAnnotations.length === 0) {
            return
        }


        Array.from(allAnnotations).forEach(replaceAnnotation)

        replacedUnreviewed = true
        replacedVerified = true
        replacedAccepted = true

        console.log("found annotations")
    }
}

function replaceAnnotation(item) {
    if (item.attributes["classification"].nodeValue === "verified" && replacedVerified) {
        return;
    }
    if (item.attributes["classification"].nodeValue === "unreviewed" && replacedUnreviewed) {
        return;
    }
    if (item.attributes["classification"].nodeValue === "accepted" && replacedAccepted) {
        return;
    }

    var contents = item.innerText.split("\n")
    var replacement = []

    contents.forEach(function(item) {
        replacement.push(item)
        replacement.push(document.createElement("br"))
    })

    replacement.pop()

    item.replaceWith(...replacement)
}

function checkDone() {
    return replacedComments && replacedRecirculated && replacedVerified && replacedUnreviewed && replacedAccepted
}
