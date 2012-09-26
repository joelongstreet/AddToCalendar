$(function(){
    chrome.browserAction.onClicked.addListener(function(tab) {
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
                if($(this).text() == 'A' || $(this).text() == 'AP'){
                    new_event = {
                        "start_time"    : date + '123000Z',
                        "end_time"      : date + '243000Z',
                        "description"   : "Work Day",
                        "summary"       : "Work Day",
                        "location"      : "Children\'s Mercy Hospital"
                    }
                    schedule.push(new_event);
                } else if($(this).text() == 'DTO'){
                    //console.log('new day trade off');
                } else if($(this).hasClass('overload-shading')){

                    var time = $(this).text().split(':');
                    element_id = $(this).attr('id');

                    chrome.tabs.sendRequest(tab.id, {action: "simulate_hover", el_id : element_id }, function(response){

                        new_event = {
                            "start_time"    : date + response.start_time + '00Z',
                            "end_time"      : date + response.end_time + '00Z',
                            "description"   : response.name,
                            "summary"       : "Meeting",
                            "location"      : "Children\'s Mercy Hospital"
                        }
                        console.log(new_event);
                        schedule.push(new_event);
                    });

                } else if($(this).hasClass('indirect')){

                    var time = $(this).text().split(':');
                    element_id = $(this).attr('id');

                    chrome.tabs.sendRequest(tab.id, {action: "simulate_hover", el_id : element_id }, function(response){

                        new_event = {
                            "start_time"    : date + response.start_time + '00Z',
                            "end_time"      : date + response.end_time + '00Z',
                            "description"   : response.name,
                            "summary"       : "Professional Day",
                            "location"      : "Children\'s Mercy Hospital"
                        }

                        console.log(new_event);
                        schedule.push(new_event);
                    });
                }
            });



            $.ajax({
                type        : 'POST',
                url         : 'http://joe.local:3001/',
                dataType    : 'json',
                contentType : "application/json; charset=utf-8",
                data        : JSON.stringify(schedule),
                success     : function(msg){
                    alert('Calendar Invitations Sent!')
                },
                error       : function(err){
                    alert('There was an Error :(');
                }
            });


        });
    });
});
