function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('optilink.cmh.edu') > -1) {
    chrome.pageAction.show(tabId);
  }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

$(function(){
    chrome.pageAction.onClicked.addListener(function(tab) {

        if(localStorage.email == undefined || localStorage.email == ''){

            // If a user has not yet put in their e-mail address
            chrome.tabs.create({
                url : '/html/options.html'
            });
            // End - Email Request

        } else{

            chrome.tabs.sendRequest(tab.id, {action: "getDOM"}, function(response){

                //Get DOM ready to be ABSOLUTELY RAVAGED
                schedule        = []
                $dom            = $(response.dom);
                $table_body     = $dom.find('.qaMyScheduleGrid').find('.x-grid3-scroller').find('table');
                $table_header   = $dom.find('.qaMyScheduleGrid').find('.x-grid3-header').find('table');

                $.each($table_body.find('td'), function(i, val){

                    // Figure out which kind of event to make
                    // A, AP, $A : new regular AM work day : Grey : Creates new Work Day Devent
                    // DTO : Day Trade Off : Blue : Creates Nothing
                    // overload-shading : Meeting : Red : Creates new Meeting
                    // indirect : Professional Day : Pink : Creates new Professional Day

                    if($(this).hasClass('overload-shading')){
                        summary = 'Meeting';
                    } else if($(this).hasClass('indirect')){
                        summary = 'Professional Day'
                    } else {
                        summary = 'Work Day';
                    }
                    element_id  = $(this).attr('id');
                    txt         = $(this).text();

                    if(txt == 'A' || txt == 'AP' || text == '$A' || $(this).hasClass('overload-shading') || $(this).hasClass('indirect')){

                        chrome.tabs.sendRequest(tab.id, {action: "simulate_hover", el_id : element_id, summary : summary}, function(response){

                            new_event = {
                                "start_time"    : response.date + 'T' + response.start_time + '00',
                                "end_time"      : response.date + 'T' + response.end_time + '00',
                                "description"   : response.name,
                                "location"      : "Children\'s Mercy Hospital",
                                "summary"       : response.summary
                            }

                            schedule.push(new_event);

                        });
                    }
                });

                // Just wait a darn second, let the dom finish parsing
                setTimeout(function(){

                    ajax_data = {
                        email       : localStorage.email,
                        schedule    : schedule
                    }

                    $.ajax({
                        type        : 'POST',
                        url         : 'http://addtocalendar.jit.su/',
                        //url         : 'http://joe.local:3001/',
                        dataType    : 'json',
                        contentType : "application/json; charset=utf-8",
                        data        : JSON.stringify(ajax_data),
                        success     : function(msg){
                            chrome.tabs.sendRequest(tab.id, {action: "complete"}, function(response){
                                console.log(msg);
                            });
                        },
                        error       : function(err){
                            alert('There was an Error :(');
                        }
                    });
                }, 2000);
            });
        }
    });
});