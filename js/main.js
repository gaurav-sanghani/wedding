$(document).ready(function () {
  var NAVBAR_HEIGHT = $('#navbar').height(); //should be relatively constant
  var $navbarMenu = $('#navbar-items');

  function _scrollToEl(selector) {
    var $el = $(selector);
    if (!$el.length) {
      return;
    }
    var target_offset = $el.offset();
    var target_top = Math.max(target_offset.top - NAVBAR_HEIGHT - 10, 0);
    if (window.history && window.history.pushState && $el.prop('id')) {
      window.history.pushState({}, '', "#" + $el.prop('id'));
    }

    $('html, body').animate({scrollTop:target_top}, 500);
    $el.children('.clickable.closed').click();
    if ($el.hasClass('clickable') && $el.hasClass('closed')) {
      $el.click();
    }
  }

  function navigationHandler() {
    // Animate scrolling from navbar
    $('.internal-link').click(function(event) {
      event.preventDefault();

      var full_url = this.href,
      parts = full_url.split('#'),
      trgt = parts[1];

      _scrollToEl("#" + trgt);
      $navbarMenu.collapse('hide');
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

  function handlePageLoadToHash() {
    var hash = window.location.hash;
    if (hash.length) {
      _scrollToEl(hash);
    }
  }

  function clickToOpenAnimations() {
    $('.expandable-section > h3.clickable').click(function() {
      var $this = $(this);
      var $toExpand = $($this.siblings('.slide-up').first());
      var curHeight = $toExpand.height();
      if (curHeight) {
        $toExpand.css('height', '');
        $this.addClass('closed');
      } else {
        $toExpand.height($toExpand.get(0).scrollHeight);
        $this.removeClass('closed');
      }
      $(this).children('.glyphicon-chevron-up').toggleClass('rotate-reverse');
    });
  }

  navigationHandler();

  var now = new Date();
  copyrightYear(now);
  handlePageLoadToHash();
  clickToOpenAnimations();
});
