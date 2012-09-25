$(function(){
    chrome.browserAction.onClicked.addListener(function(tab) {

        header  = $('.qaMyScheduleGrid').find('.x-grid3-header');
        body    = $('.qaMyScheduleGrid').find('.x-grid3-scroller');

        alert(body.length)

        body_table = body.find('table');
        temp = body_table.find('td')

        alert(temp.length);

        //$.each(body_table.find('td'), function(){
            //alert($(this).text())
        //});

        //alert('test');

        /*
        text = $('#cnn_maintt1imgbul').find('h2').text();
        

        $.ajax({
            type     : 'GET',
            url      : '/mailer',
            data     : 'name=John&location=Boston',
            success  : function(msg){
                alert('done');
            }
        });
        */
    });
});