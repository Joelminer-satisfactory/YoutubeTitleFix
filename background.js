browser.tabs.onUpdated.addListener(updateHandler)
let isPaused = false
let isAwaitingRequest = false;
async function updateHandler(tabId, changeInfo, changedTab){
    if (isPaused){
        return
    }
    if (changeInfo.url !== undefined && changeInfo.status !== "loading"){
        isPaused = true
        console.log("TabId: ", tabId, "Change info: ", changeInfo, "New status: ", changedTab.status)
        let urlBeforeNav;
        browser.tabs.query({ active: true, currentWindow: true }).then(async tabs => {
            const tabId = tabs[0].id;
            console.log("Tab ID:", tabId, "sending termination message")
            browser.tabs.sendMessage(tabId, { message: "terminate" }, (response) => {
                urlBeforeNav = response.response
                console.log("response: ", urlBeforeNav)
            });
             //if actively awaiting request, stop awaiting and continue
            if(isAwaitingRequest){
                isAwaitingRequest = false
            }
            /*if not awaiting request, start the wait by changing the variable to true, and waiting 1000ms (1s), 
            if still awaiting after that, no longer wait and proceed. If no longer waiting, quit, because another request has come in shortly after*/
            else if(!isAwaitingRequest){
                isAwaitingRequest = true
                await sleep(1000)
                if (isAwaitingRequest){
                    isAwaitingRequest = false
                }
                else{
                    return
                }
            }
            if (/.\.youtube\.com\/$/.test(changeInfo.url) || /.\.youtube\.com$/.test(changeInfo.url)){
                console.log("reloading tab")
                browser.tabs.update(tabId, {url: tabs[0].url})
            }
            
            console.info("inserting script")
            browser.tabs.executeScript(tabId, { file: "content.js" });
        });
        
        isPaused = false
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}