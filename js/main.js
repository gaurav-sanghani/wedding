(function () {
    // Animate scrolling from navbar
    $('.navbar a').click(function(event) {
	event.preventDefault();
	
	const full_url = this.href,
	      parts = full_url.split('#'),
	      trgt = parts[1],
	      target_offset = $('#'+trgt).offset(),
	      target_top = target_offset.top;
	
	$('html, body').animate({scrollTop:target_top}, 500);
    });

    // Compute the # of months from now til the wedding!
    function monthsTil(date) {
	const now = new Date();
	const years = date.getYear() - now.getYear();
	const months = date.getMonth() - now.getMonth();
	return years * 12 + months;
    }

    const WEDDING_DATE = new Date(1517464800000); //February 01, 2018 T00:00:00.000
    $('.time-to-wedding div').text(monthsTil(WEDDING_DATE));
    window.monthsTil = monthsTil;
})();
