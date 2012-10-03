$(function(){

    $('#email').val(localStorage.email);

    $('#ok').click(function(){
        email = $('#email').val();
        localStorage.email = email;
        alert('Thanks, now using email: ' + localStorage.email)
    });

    $(window).keydown(function(e) {
        if(e.keyCode == 13){
            $('#ok').trigger('click')
        }
    });

});