//document.addEventListener('load', (event) => {
    console.info("Page fully loaded");

    const targetNode = document.querySelector("body");
    const config = { attributes: false, childList: true, subtree: true };
    
    const modify_titles = (mutationlist, observer) => {
        console.info("changing titles")
        let elements;
        // Select all elements with id "video-title"
        elements = document.querySelectorAll("yt-formatted-string#video-title");
        observer.disconnect()
        // Modify the text content of each element
        elements.forEach((element, index) => {
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
        });
        observer.observe(targetNode, config)
    };
    let future_observer;
    const observer = new MutationObserver(modify_titles, future_observer);
    future_observer = observer;
    observer.observe(targetNode, config)
//})