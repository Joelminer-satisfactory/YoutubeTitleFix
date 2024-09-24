browser.tabs.onUpdated.addListener(updateHandler)
let isPaused = false
async function updateHandler(tabId, changeInfo, changedTab){
    if (isPaused){
        return
    }
    if (changeInfo.url !== undefined && changeInfo.status !== "loading"){
        isPaused = true
        console.log("TabId: ", tabId, "Change info: ", changeInfo, "New status: ", changedTab.status)

        browser.tabs.query({ active: true, currentWindow: true }).then(async tabs => {
            const tabId = tabs[0].id;
            console.log("Tab ID:", tabId, "sending termination message")
            browser.tabs.sendMessage(tabId, { message: "terminate" });
            if (/.\.youtube\.com\/$/.test(changeInfo.url) || /.\.youtube\.com$/.test(changeInfo.url)){
                await sleep(500)
                console.log("reloading tab")
                browser.tabs.update(tabId, {url: tabs[0].url})
            }
            await sleep(500)
            console.info("inserting script")
            browser.tabs.executeScript(tabId, { file: "content.js" });
        });
        await sleep(500)
        isPaused = false
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}