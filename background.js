chrome.runtime.onInstalled.addListener(function(){
    var tabs  = {};
    chrome.storage.local.set({"tabs":tabs},function(){});
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    chrome.storage.local.get("tabs", function(value){
        var tabs = value.tabs;
        if(!tabs[tabId]){
            tabs[tabId] = {"current_url_index":0, "urls":[], "titles":[], "childs":{}};
        }
        // if the url is the same as current url
        if(tabs[tabId]["urls"][tabs[tabId]["current_url_index"]] == tab.url || tabs[tabId]["titles"][tabs[tabId]["current_url_index"]] == tab.title){
            if(tabs[tabId]["titles"][tabs[tabId]["current_url_index"]] != tab.title){
                tabs[tabId]["titles"][tabs[tabId]["current_url_index"]] = tab.title;
                chrome.storage.local.set({"tabs":tabs},function(){});
            }
            return;
        }
        
        var visited_url_index = -1;
        for(var i in tabs[tabId]["urls"]){
            if(tabs[tabId]["urls"][i] == tab.url){
                visited_url_index = i;
                break;
            }
        }
        // if it is not visited
        if(visited_url_index == -1){
            tabs[tabId]["urls"].push(tab.url);
            if(tab.title){
                tabs[tabId]["titles"].push(tab.title);
            }else{
                tabs[tabId]["titles"].push("No Title");
            }
            if(tabs[tabId]["urls"].length != 1){
                if(tabs[tabId]["childs"][tabs[tabId]["current_url_index"]]){
                    tabs[tabId]["childs"][tabs[tabId]["current_url_index"]].push(tabs[tabId]["urls"].length-1);
                }
                else{
                    tabs[tabId]["childs"][tabs[tabId]["current_url_index"]] = [tabs[tabId]["urls"].length-1];
                }
            }
            // update current_url_index
            tabs[tabId]["current_url_index"] = tabs[tabId]["urls"].length-1;
        // if it is visited
        }else{
            tabs[tabId]["current_url_index"] = visited_url_index;
        }
        chrome.storage.local.set({"tabs":tabs},function(){});
    });

});

chrome.tabs.onCreated.addListener(function(tab){
    chrome.storage.local.get("tabs", function(value){
        var tabs = value.tabs;
        if(tabs[tab.id]){
            tabs[tab.id] = {"current_url_index":0, "urls":[], "titles":[], "childs":{}};
            chrome.storage.local.set({"tabs":tabs},function(){});
        }
    });
});

// delete tab_info when the tab is removed
chrome.tabs.onRemoved.addListener(function(tabId){
    chrome.storage.local.get("tabs", function(value){
        var tabs = value.tabs;
        if(tabs[tabId]){
            tabs[tabId] = {"current_url_index":0, "urls":[], "titles":[], "childs":{}};
            chrome.storage.local.set({"tabs":tabs},function(){});
        }
    });
});

// command
chrome.commands.onCommand.addListener(function(command){
    if(command == "display_tree"){
        chrome.storage.local.get("tabs", function(value){
            var tabs = value.tabs;
            chrome.tabs.query({"highlighted":true, "currentWindow":true}, function(current_tabs){
                var current_tab_id = current_tabs[0].id;
                if(!tabs[current_tab_id] || current_tabs[0].url.slice(0,4)!="http"){
                    return;
                }
                chrome.tabs.sendMessage(current_tab_id, {message: "popup", "current_tab_id":current_tab_id}, function(){});
            });
        });
    }else if(command == "go_up"){
        chrome.storage.local.get("tabs", function(value){
            var tabs = value.tabs;
            chrome.tabs.query({"highlighted":true, "currentWindow":true}, function(current_tabs){
                if(!current_tabs.length){
                    return;
                }
                var current_tab_id = current_tabs[0].id;
                if(!tabs[current_tab_id] || current_tabs[0].url.slice(0,4)!="http"){
                    return;
                }
                chrome.tabs.sendMessage(current_tab_id, {message: "go_up", "current_tab_id":current_tab_id}, function(){});
            });
        });
    }
  });

chrome.contextMenus.removeAll(function(){
    chrome.contextMenus.create({
        id: "popup",
        title: "タブの履歴",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "go-up",
        title: "上の階層へ",
        contexts: ["all"]
    });
});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "go-up") {
        chrome.storage.local.get("tabs", function(value){
            var tabs = value.tabs;
            chrome.tabs.query({"highlighted":true, "currentWindow":true}, function(current_tabs){
                var current_tab_id = current_tabs[0].id;
                if(!tabs[current_tab_id] || current_tabs[0].url.slice(0,4)!="http"){
                    return;
                }
                chrome.tabs.sendMessage(current_tab_id, {message: "go_up", "current_tab_id":current_tab_id}, function(){});
            });
        });
    }
});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "popup") {
        chrome.storage.local.get("tabs", function(value){
            var tabs = value.tabs;
            chrome.tabs.query({"highlighted":true, "currentWindow":true}, function(current_tabs){
                var current_tab_id = current_tabs[0].id;
                if(!tabs[current_tab_id] || current_tabs[0].url.slice(0,4)!="http"){
                    return;
                }
                chrome.tabs.sendMessage(current_tab_id, {message: "popup", "current_tab_id":current_tab_id}, function(){});
            });
        });
    }
});