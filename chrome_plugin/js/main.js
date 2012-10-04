function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('optilink.cmh.edu') > -1) {
    chrome.pageAction.show(tabId);
  }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

$(function(){
    chrome.pageAction.onClicked.addListener(function(tab) {

        if(localStorage.email == undefined || localStorage.email == ''){
            chrome.tabs.create({
                url : '/html/options.html'
            });
        } else{
            chrome.tabs.sendRequest(tab.id, {action: "getDOM"}, function(response){


                schedule         = []


                //Get DOM ready to be RAVAGED
                $dom            = $(response.dom);
                $table_body     = $dom.find('.qaMyScheduleGrid').find('.x-grid3-scroller').find('table');
                $table_header   = $dom.find('.qaMyScheduleGrid').find('.x-grid3-header').find('table');


                $.each($table_body.find('td'), function(i, val){


                    // Figure out which kind of event to make
                    // A or AP - is a new regular AM work day - Grey
                    // DTO - Day Trade Off - Blue
                    // overload-shading - Meeting - Red
                    // indirect - Professional Day - Pink


                    if($(this).hasClass('overload-shading')){
                        summary = 'Meeting';
                    } else if($(this).hasClass('indirect')){
                        summary = 'Professional Day'
                    } else {
                        summary = 'Work Day';
                    }
                    element_id  = $(this).attr('id');
                    txt         = $(this).text();

                    if(txt == 'A' || txt == 'AP' || $(this).hasClass('overload-shading') || $(this).hasClass('indirect')){

                        chrome.tabs.sendRequest(tab.id, {action: "simulate_hover", el_id : element_id, summary : summary}, function(response){

                            new_event = {
                                "start_time"    : response.date + response.start_time + '00',
                                "end_time"      : response.date + response.end_time + '00',
                                "description"   : response.name,
                                "location"      : "Children\'s Mercy Hospital",
                                "summary"       : response.summary
                            }

                            schedule.push(new_event);

                        });
                    }
                });

        
                setTimeout(function(){

                    ajax_data = {
                        email : localStorage.email,
                        schedule : schedule
                    }

                    $.ajax({
                        type        : 'POST',
                        url         : 'http://addtocalendar.jit.su/',
                        dataType    : 'json',
                        contentType : "application/json; charset=utf-8",
                        data        : JSON.stringify(ajax_data),
                        success     : function(msg){
                            chrome.tabs.sendRequest(tab.id, {action: "complete"}, function(response){

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