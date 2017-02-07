(function () {
    $('.navbar a').click(function(event) {
	event.preventDefault();
	
	const full_url = this.href,
	      parts = full_url.split('#'),
	      trgt = parts[1],
	      target_offset = $('#'+trgt).offset(),
	      target_top = target_offset.top;
	
	$('html, body').animate({scrollTop:target_top}, 500);
	
    });
})();
