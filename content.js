let currentWindowUrl;
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message:", request);
    if (request.message === "terminate"){
        console.log("Content script terminating");
        browser.runtime.sendMessage({message: currentWindowUrl})
        console.log("sent message: ", currentWindowUrl)
        throw new error("terminating")
    }
    else if(request.message === "fetchUrl"){
        currentWindowUrl = window.location.href
        console.log("Recieved, setting url to: ", currentWindowUrl)
    }
});

const targetNode = document.querySelector("body");
const config = { attributes: false, childList: true, subtree: true };

const modify_titles = async (mutationlist, observer) => {
    let videoTitles = [];
    let selectors = [
        "yt-formatted-string#video-title", 
        "yt-formatted-string.style-scope.ytd-watch-metadata", 
        "span#video-title.ytd-compact-video-renderer", 
        "span.yt-core-attributed-string", 
        "span.yt-core-attributed-string.yt-core-attributed-string--white-space-pre-wrap"]
    selectors.forEach((selector) => {
        let elements = document.querySelectorAll(selector);
        elements.forEach((el) => {videoTitles.push(el)})
    });
    let element = document.querySelector("div#title.style-scope.ytd-watch-metadata")
    try{
        element.style.display = 'none'
    }
    catch (error){
        console.log(error.message)
    }
    observer.disconnect();
    //get and display the title on a video page
    let url = window.location.href;
    let match = url.match(/(?<=v=)[^&#]+/);
    let videoId;
    if (match){
        videoId = match[0];
    }
    if(/youtube\.com\/watch\?v=/.test(url)){
        fetch(`https://www.youtube.com/oembed?url=https%3A//youtube.com/watch%3Fv%3D${videoId}&format=json`)
            .then(response => response.json())
            .then(data => {
                let title = data.title
                let newTitle = title.toLowerCase();
                var rg = /(^\s*\w{1}|\.\s*\w{1})/gi;
                newTitle = newTitle.replace(rg, function(toReplace) {
                    return toReplace.toUpperCase();
                });
                if (!document.querySelector("div#titleDiv")){
                    let element = document.querySelector("div#above-the-fold.style-scope.ytd-watch-metadata")
                    let newDiv = document.createElement("div")
                    newDiv.id = "titleDiv"
                    let h1Element = document.createElement("h1")
                    h1Element.textContent = newTitle
                    h1Element.id = "titleH1"
                    newDiv.appendChild(h1Element)
                    element.insertBefore(newDiv, element.firstChild)
                }
                let element = document.querySelector("h1#titleH1")
                if (element.textContent != newTitle){
                    element.textContent = newTitle
                }
            })
    }
    // Modify the text content of each element
    videoTitles.forEach((element, index) => {
        if (element.hasAttribute("aria-label")){
            let ariaLabel = element.getAttribute("aria-label");
            let indexOfBy = ariaLabel.indexOf(" by");
            if (indexOfBy !== -1){
                let trimmedAriaLabel = ariaLabel.substring(0, indexOfBy);
                let newTitle = trimmedAriaLabel.toLowerCase();
                var rg = /(^\s*\w{1}|\.\s*\w{1})/gi;
                newTitle = newTitle.replace(rg, function(toReplace) {
                    return toReplace.toUpperCase();
                });
                element.textContent = newTitle;
            }
        }
        else{
            let title = element.textContent;
            let newTitle = title.toLowerCase();
            var rg = /(^\s*\w{1}|\.\s*\w{1})/gi;
            newTitle = newTitle.replace(rg, function(toReplace) {
                return toReplace.toUpperCase();
            });
            element.textContent = newTitle;
        }
    });
    await sleep(1000);
    observer.observe(targetNode, config);
};
let future_observer;
const observer = new MutationObserver(modify_titles, future_observer);
future_observer = observer;
observer.observe(targetNode, config)
console.log("script inserted, started observing for changes")
currentWindowUrl = window.location.href
console.log("current window url: ", window.location.href)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}