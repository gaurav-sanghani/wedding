(function () {
    // Animate scrolling from navbar
    $('.navbar a').click(function(event) {
	event.preventDefault();
	
	var full_url = this.href,
	      parts = full_url.split('#'),
	      trgt = parts[1],
	      target_offset = $('#'+trgt).offset(),
	      target_top = target_offset.top;
	
	$('html, body').animate({scrollTop:target_top}, 500);
    });

    // Compute the # of months from now til the wedding!
    function daysTil(startTs, endTs) {
	return ((endTs - startTs) / (1000 * 60 * 60 * 24)) | 0; // force to int
    }

    var WEDDING_START_TS = 1518760800000; //February 16, 2018 T00:00:00.000 CST
    var WEDDING_END_TS = 1518933599000; // February 17, 2018 T23:59:59 CST
    var now = (new Date()).getTime();
    var days = daysTil(now, WEDDING_START_TS);
    var counter = $('.time-to-wedding div');
    var countdownHeader = $('.countdown-header');
    if (days > 0) {
	counter.text(days);
    } else {
	days = daysTil(now, WEDDING_END_TS);
	if (days < 0) {
	    counter.text(days * -1);
	    countdownHeader.text('Days since February 17, 2018');
	} else {
	    countdownHeader.text('It is ' + (new Date()).toDateString());
	    counter.text('Today is the wedding!');
	    counter.removeClass('countdown');
	}
    }
    window.daysTil = daysTil;
})();
