$(function(){
    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.sendRequest(tab.id, {action: "getDOM"}, function(response){


            schedule         = []



            //Get DOM ready to be ravaged
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

            console.log('base month:' + base_month)
            
            $.each($table_body.find('td'), function(i, val){


                //Straighten Out Dates
                day = $($table_weeks[i - 5]).text();

                if(parseFloat($($table_weeks[i - 5]).text()) < base_day){
                    month = parseFloat(base_month) + 1;
                } else{
                    month = base_month;
                }

                if(month < 10){ month = '0' + parseFloat(month); }
                if(day < 10) { day = '0' + day; }

                date = base_year + month + day + 'T'


                // Figure out which kind of event to make
                // A or AP - is a new regular AM work day
                // DTO - Day Trade Off
                // overload-shading - Meeting
                // indirect - Professional Day
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
                    new_event = {
                        "start_time"    : date + '000000Z',
                        "end_time"      : date + '235900Z',
                        "description"   : "Meeting",
                        "summary"       : "Meeting",
                        "location"      : "Children\'s Mercy Hospital"
                    }
                    schedule.push(new_event);
                } else if($(this).hasClass('indirect')){
                    new_event = {
                        "start_time"    : date + '000000Z',
                        "end_time"      : date + '235900Z',
                        "description"   : "Professional Day",
                        "summary"       : "Professional Day",
                        "location"      : "Children\'s Mercy Hospital"
                    }
                    schedule.push(new_event);
                }
            });



            $.ajax({
                type        : 'POST',
                url         : 'http://joe.local:3001/',
                dataType    : 'json',
                contentType : "application/json; charset=utf-8",
                data        : JSON.stringify(schedule),
                success     : function(msg){
                    console.log(msg)
                },
                error       : function(err){
                    console.log(err);
                }
            });


        });
    });
});