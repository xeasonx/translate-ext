let portConn;

function onMessagePost(message) {
    console.log("message sent");
}

function onMessagePostFailed(error) {
    console.log("message error");
    console.log(error);
}

function onCreated() {
    if (browser.runtime.lastError) {
        console.log(`Error: ${browser.runtime.lastError}`);
    } else {
        console.log("Item created successfully");
    }
}

function translateNotification(title, message) {
    console.log(message);
    browser.notifications.create("notify-translate", {
        "type": "basic",
        "title": title,
        "message": message,
    });
}

function translatePopup() {
    browser.browserAction.openPopup();
}

function translate(word) {
    let url = `https://cn.bing.com/api/v6/dictionarywords/search?q=${word}&appid=371E7B2AF0F9B84EC491D731DF90A55719C7D209&mkt=zh-cn&pname=bingdict`;
    console.log(url);
    fetch(
        url, 
        {method: "GET"}
    ).then(response => {
        return response.json()
    }).then(data => {
        // console.log(data);
        let results = resolveTranslation(data);
        let pronunciation = results.pop();
        if (results.length > 0) {
            // console.log(results);
            let items = new Array();
            items.push(word + ` /${pronunciation}/`);
            results.forEach(item => {
                items.push([item[0] + ": " + item[1].join(", ")]);
            });
            portConn.postMessage({result: items});
            // translateNotification(word + ` /${pronunciation}/`, items.join("\n"));            
        } else {
            portConn.postMessage({result: `${word}\nnot found`});
            // translateNotification(word, "not found");
        }
    });
}

function resolveTranslation(respJson) {
    let simpleMeaningGroup = new Array();
    let meaningGroups = respJson["value"][0]["meaningGroups"];
    // console.log(meaningGroups);
    for (let i=0; i<meaningGroups.length; i++) {
        let meaning = meaningGroups[i];
        if (meaning["partsOfSpeech"][0]["description"] === "快速释义") {
            let t = meaning["partsOfSpeech"][0]["name"];
            let results = new Array();
            meaning["meanings"][0]["richDefinitions"][0]["fragments"].forEach(result => {
                results.push(result.text);
            });
            simpleMeaningGroup.push([t, results]);
            // console.log(results);
        } else {
            break;
        }
    };
    let pronunciation = respJson["value"][0]["pronunciation"];
    simpleMeaningGroup.push(pronunciation);
    return simpleMeaningGroup;
}

function onClientPortConnected(port) {
    portConn = port;
    console.log("client port connected.");
}

browser.runtime.onConnect.addListener(onClientPortConnected);

browser.contextMenus.create({
    id: "ctx-menu-translate-me",
    title: browser.i18n.getMessage("ctxMenuTranlateMe"),
    contexts: ["selection"]
}, onCreated);


browser.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info);
    console.log(tab);
    switch (info.menuItemId) {
        case "ctx-menu-translate-me":
            console.log(info.selectionText);
            translate(info.selectionText.trim());
            break;
        default:
            break;
    }
});

browser.notifications.onClicked.addListener((ntfId, btnIdx) => {
    switch (ntfId) {
        case "notify-translate":
            console.log("close button clicked")
            browser.notifications.clear("notify-translate");
            break;
        default:
            break;
    }
});