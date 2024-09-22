try{
    let isPaused = false;
    browser.webNavigation.onHistoryStateUpdated.addListener( () => {
        console.log("Paused: ", isPaused)
        if (!isPaused){
            isPaused = true;
            console.log("updated")
            browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
                const tabId = tabs[0].id;
                console.log(tabId, "sending termination message")
                browser.tabs.sendMessage(tabId, { message: "terminate" });
            });
            browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
                const tabId = tabs[0].id;
                console.log(/youtube\.com/.test(tabs[0].url))
                if (/youtube\.com/.test(tabs[0].url)){
                    browser.tabs.update(tabId, {url: tabs[0].url})
                }
                browser.tabs.executeScript(tabId, { file: "content.js" });
        })};
    })
    browser.webNavigation.onCompleted.addListener(() => {
        isPaused = false;
    })
}
catch (error){
    console.log(error.message)
}