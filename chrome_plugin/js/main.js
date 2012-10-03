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
                $table_weeks    = $($table_header[0]).find('td');
                $table_dates    = $($table_header[1]).find('td');



                //Build Base Dates
                base_date       = $dom.find('#lblDateTime').text().split(':')[1].split(' ')[1];
                split           = base_date.split('/');
                base_month      = split[0];
                base_day        = split[1];
                base_year       = '20' + split[2];

                

                $.each($table_body.find('td'), function(i, val){


                    //Straighten Out Dates
                    day = $($table_weeks[i - 5]).text();

                    if(parseFloat($($table_weeks[i - 5]).text()) < base_day){
                        month = parseFloat(base_month) + 1;
                    } else{
                        month = base_month;
                    }

                    if(month < 10){ month = '0' + parseFloat(month); }
                    if(day < 10) { day = '0' + parseFloat(day); }

                    date = base_year + month + day + 'T'

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

                        chrome.tabs.sendRequest(tab.id, {action: "simulate_hover", el_id : element_id, date : date, summary : summary}, function(response){

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