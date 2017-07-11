(function () {
    function navigationHandler() {
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
    }

    function countdown(nowTs) {
	// Compute the # of months from now til the wedding!
	function daysTil(startTs, endTs) {
	    return ((endTs - startTs) / (1000 * 60 * 60 * 24)) | 0; // force to int
	}

	var WEDDING_START_TS = 1518847200000; //February 17, 2018 T00:00:00.000 CST
	var days = daysTil(nowTs, WEDDING_START_TS);
	var counter = $('.time-to-wedding div');
	var countdownHeader = $('.countdown-header');
	if (days > 0) {
	    counter.text(days);
	} else if (days < 0) {
	    counter.text(days * -1);
	    countdownHeader.text("Days we've been married");
	} else {
	    countdownHeader.text('It is ' + (new Date()).toDateString());
	    counter.text('Today is the wedding!');
	    counter.removeClass('countdown');
	}
    }

    function copyrightYear(now) {
	$('#copyright-year').text(now.getFullYear());
    }


    navigationHandler();

    var now = new Date();
    countdown(now.getTime());
    copyrightYear(now);
})();
