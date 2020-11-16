chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.message == "popup"){
        sendResponse({"status":200});
        var UUGTech_popup = document.getElementById('js-UUGTech_popup');
        if(UUGTech_popup){
            if($(".UUGTech_popup").css("opacity")==1){
                $(".UUGTech_popup").css({
                    "opacity":"0",
                    "visibility":"hidden"
                });
                return;
            }else{
                UUGTech_popup.remove();
            }
        }
        append_popup();
        chrome.storage.local.get("tabs", function(value){
            var tabs = value.tabs;
            display(tabs[request["current_tab_id"]],"#UUGTech-display-area");

            $(".UUGTech-link").each(function(i, elem){
                if(Number($(elem).data("index")) == tabs[request["current_tab_id"]]["current_url_index"]){
                    $(elem).addClass("UUGTech-link-here");
                }
            });

            $(".UUGTech-link").on("click",function(event){
                event.preventDefault();
                var link = $(this).data("link");
                tabs[request["current_tab_id"]]["current_url_index"] = Number($(this).data("index"));
                chrome.storage.local.set({"tabs":tabs}, function(){});
                var UUGTech_popup = document.getElementById('js-UUGTech_popup');
                UUGTech_popup.remove();
                location.href = link;
            });

            $(".UUGTech-link").css({
                "color":"#0366d6",
                "text-decoration":"none",
            });
            $(".UUGTech-link").hover(function(){
                $(this).css("text-decoration","underline");
            },function(){
                $(this).css("text-decoration","none");
            });
            $(".UUGTech-link").focusin(function(){
                $(this).css("outline", "solid 2px #000");
            });
            $(".UUGTech-link").focusout(function(){
                $(this).css("outline", "none");
            });

            $(".UUGTech-link-here").css("color","green");
            $(".UUGTech-link-here").eq(0).focus();

        });

        $(".UUGTech_popup").css({
            "opacity":"1",
            "visibility":"visible"
        });

        var blackBg = document.getElementById('js-black-bg');
        
        function closePopUp(elem){
            if(!elem) return;
            elem.addEventListener('click', function() {
                $(".UUGTech_popup").css({
                    "opacity":"0",
                    "visibility":"hidden"
                });
            });
        }

        closePopUp(blackBg);

    }else if(request.message == "go_up"){
        sendResponse({"status":200});
        chrome.storage.local.get("tabs", function(value){
            var tabs = value.tabs;
            var current_url_index = Number(tabs[request["current_tab_id"]]["current_url_index"]);
            var childs = tabs[request["current_tab_id"]]["childs"];
            for(var i in childs){
                if(childs[i].includes(current_url_index)){
                    var link = tabs[request["current_tab_id"]]["urls"][i];
                    if(link.slice(0,4)=="http"){
                        location.href = tabs[request["current_tab_id"]]["urls"][i]
                    }
                    return;
                }
            }
        });
    }
});

$(document).on("keydown", function(e){
    if(e.keyCode == 38 || e.keyCode == 40){
        var UUGTech_popup = document.getElementById("js-UUGTech_popup");
        if(UUGTech_popup){
            if($(".UUGTech-link").index($(":focus")) == -1){
                $(".UUGTech-link-here").eq(0).focus();
            }
        }
    }
});

$(document).on("keydown", ".UUGTech-link", function(e){
    var UUGTech_popup = document.getElementById('js-UUGTech_popup');
    if(!UUGTech_popup){
        return;
    }
    var index;
    var selector = ".UUGTech-link";

    if(e.keyCode == 38){ // ↑
        e.preventDefault();
        index = $(selector).index(this);
        if(index > 0){
            $(selector).eq(index-1).focus();
        }else if(index == 0){
            $(selector).eq($(selector).length-1).focus();
        }
        return;
    }

    if(e.keyCode == 40){ // ↓
        e.preventDefault();
        index = $(selector).index(this);
        if(index < $(selector).length-1){
            $(selector).eq(index+1).focus();
        }else if(index == $(selector).length-1){
            $(selector).eq(0).focus();
        }
        return;
    }
});

function append_popup(){
    $("html").append(
        '<div class="UUGTech_popup" id="js-UUGTech_popup">\
            <div class="UUGTech_popup-inner">\
                <div id="UUGTech-display-area"></div>\
            </div>\
            <div class="black-background" id="js-black-bg"></div>\
        </div>'
    );
    $(".UUGTech_popup").css({
        "color":"#000",
        "font-size":"1vw",
        "font-weight":"normal",
        "position":"fixed",
        "left":"0",
        "top":"0",
        "width":"100%",
        "height":"100%",
        "z-index":"999999",
        "opacity":"0",
        "visibility":"hidden",
        "transition":"1s",
        "box-sizing":"content-box"
    });
    $(".UUGTech_popup-inner").css({
        "position":"absolute",
        "left":"50%",
        "top":"50%",
        "transform":"translate(-50%,-50%)",
        "height":"60%",
        "width":"60%",
        "padding":"50px",
        "background-color":"#FFF",
        "z-index":"999999",
        "overflow-y":"scroll",
        "overflow-x":"scroll",
        "white-space":"nowrap",
        "text-align":"left",
        "font-family":"'メイリオ', 'Meiryo', 'HiraginoSans-W0', 'ヒラギノ角ゴシック'",
        "font-style":"normal",
        "font-variant":"normal",
        "line-height":"1.5",
        "text-decoration":"none",
        "box-sizing":"content-box"
    });
    $(".black-background").css({
        "position": "absolute",
        "left": "0",
        "top": "0",
        "width": "100%",
        "height": "100%",
        "background-color": "rgba(0,0,0,.8)",
        "z-index": "1",
        "cursor": "pointer"
    });
}

function display(current_tab_info, target){
    var SPACE = 4;
    var level = 0;
    var level_state = [];
    var visited = [];
    level_state[0] = false;
    function dps(now, childs){
        level++;
        level_state[level] = true;
        visited.push(now);
        if(current_tab_info["urls"][now].slice(0,4)=="http"){
            $(target).append("<a href='"+ current_tab_info["urls"][now] + "' class='UUGTech-link' data-link='" + current_tab_info["urls"][now] + "' data-index="+ now +">" + current_tab_info["titles"][now] + "</a href='javascript:void(0);'>");
        }else{
            $(target).append(current_tab_info["titles"][now]);
        }
        $(target).append("<br>");
        
        for(var i in childs[now]){
            if(visited.includes(childs[now][i])){
                continue;
            }else{
                for(var j=0; j<level; j++){
                    if(level_state[j]){
                        $(target).append("┃"+"&nbsp;".repeat(SPACE));
                    }else{
                        $(target).append("　"+"&nbsp;".repeat(SPACE));
                    }
                }
                if(i == childs[now].length-1){
                    $(target).append("┗");
                    level_state[level] = false;
                }else{
                    $(target).append("┣");
                }
                dps(childs[now][i], childs);
            }
        }
        level--;
        return;
    }
    dps(0,current_tab_info["childs"]);

}