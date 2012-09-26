chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if (request.action == "getDOM") {
        sendResponse({dom: document.body.innerHTML});
    } else if (request.action == 'simulate_hover'){

        var mouseover = document.createEvent('MouseEvents');
        var mouseout  = document.createEvent('MouseEvents');
        mouseover.initMouseEvent('mouseover', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        mouseout.initMouseEvent('mouseout', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

        var cb = document.getElementById(request.el_id)
        cb.dispatchEvent(mouseover);

        tips        = document.getElementsByClassName('x-tip');
        tip         = null

        for(var i = 0; i < tips.length; i++) {
            if(tips[i].style.display != 'none') {
                tip = tips[i]
            }
        }

        body        = tip.getElementsByClassName('x-tip-body')[0];
        list        = body.getElementsByTagName('li');

        event_name  = list[1].innerText;
        date_string = list[0].innerText;
        
        splits      = date_string.split(':');
        start_hr    = splits[0].charAt(splits[0].length - 2) + splits[0].charAt(splits[0].length - 1);
        start_min   = splits[1].charAt(0) + splits[1].charAt(1);
        start_time  = start_hr + start_min;
        end_hr      = splits[1].charAt(splits[1].length - 2) + splits[1].charAt(splits[1].length - 1);
        end_min     = splits[2].charAt(0) + splits[2].charAt(1);
        end_time    = end_hr + end_min;

        cb.dispatchEvent(mouseout);

        obj = {
            "start_time"    : start_time,
            "end_time"      : end_time,
            "name"          : event_name,
            "date"          : request.date
        }

        sendResponse(obj);

    } else{
        sendResponse({});
    }
});