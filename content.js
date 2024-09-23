browser.runtime.onMessage.addListener((request) => {
    console.log("Received message:", request);
    if (request.message === "terminate"){
        console.log("Content script terminating");
        
        throw new Error("Termination requested");
    }
});

const targetNode = document.querySelector("body");
const config = { attributes: false, childList: true, subtree: true };

const modify_titles = async (mutationlist, observer) => {
    console.info("modifying titles")
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
    observer.disconnect();
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
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}