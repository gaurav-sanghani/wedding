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

  function countdown(now) {
    // number of days in each month
    var daysInMonth = [31, now.getFullYear() % 4 ? 28 : 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Compute the # of years, months, & days from now til the wedding!
    // Assumption: start <= end
    function timeTil(start, end) {
      var months = start.getDate() <= end.getDate() ? 0 : -1;
      var days = months ? daysInMonth[start.getMonth()] - start.getDate() + end.getDate() : end.getDate() - start.getDate();

      months += Math.abs(start.getMonth() + 12 * start.getYear() - (end.getMonth() + 12 * end.getYear()));
      var years = months / 12 | 0;
      months = months - years * 12;
      return {years: years, months: months, days: days};
    }

    var WEDDING_START = new Date(1518847200000); //February 17, 2018 T00:00:00.000 CST
    var weddingFuture = now.getTime() < WEDDING_START.getTime();
    var timeTil = weddingFuture ? timeTil(now, WEDDING_START) : timeTil(WEDDING_START, now);

    var pluralYears = timeTil.years === 1 ? '': 's';
    var pluralMonths = timeTil.months === 1 ? '': 's';
    var pluralDays = timeTil.days === 1 ? '': 's';

    var timeleftCopy = [];
    if (timeTil.years) {
      timeleftCopy.push(timeTil.years + ' year' + pluralYears);
    }

    if (timeTil.months) {
      timeleftCopy.push(timeTil.months + ' month' + pluralMonths);
    }

    if (timeTil.days) {
      timeleftCopy.push(timeTil.days + ' day' + pluralDays);
    }

    var formattedCopy;
    switch (timeleftCopy.length) {
      case 1:
        formattedCopy = timeleftCopy[0];
        break;
      case 2:
        formattedCopy = timeleftCopy.join(' and ');
        break;
      case 3:
        formattedCopy = timeleftCopy[0] + ', ' + timeleftCopy[1] + ', and ' + timeleftCopy[2];
        break;
    }

    if (formattedCopy) {
      var prefixText = weddingFuture ? 'We get married in ' : 'We have been married for ';
      $('#time-left').text(prefixText + formattedCopy);
    } else {
      $('#time-left').text('The wedding is today');
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

  function RSVP() {
    this.$submit = $('#rsvp-button');
    this.$rsvpForm = $('#rsvp > .container').children();
    this.$currentView = this.$rsvpForm;
    this.$rsvpError =  $('#rsvp-error');
    this.$rsvpSuccess = $('#rsvp-success');
    this.$specificRsvpError = $('#specific-rsvp-error');

    var self = this;
    this.$submit.click(function (e) {
      e.preventDefault();
      
      self.$submit.prop('disabled', true);
      var data = self.collectInput();
      self.myRsvp = data;

      var method = 'POST';
      var path = '/api/rsvp';
      $.ajax({
        url:path, method:method, data:data
      }).fail(function (jqXhr) {
        var response = jqXhr.responseJSON;
        var errs = {};
        if (response) {
          self.rsvpHash = response.rsvpHash;
          errs = response.err_msg;
        }

        self.showError(errs);
        _scrollToEl('#rsvp');
      }).done(function (response) {
        self.showSuccess();
        _scrollToEl('#rsvp');
      }).always(function () {
        self.$submit.prop('disabled', false);
      });
    });
  };

  RSVP.prototype.showError = function (errorMsgs) {
    this.$specificRsvpError.html('');

    for (var key in errorMsgs) {
      var errorMsg = $('<div>').text(errorMsgs[key]);
      this.$specificRsvpError.append(errorMsg);
    }

    this.$rsvpError.removeClass('hidden');
    this.$rsvpSuccess.addClass('hidden');
  };

  RSVP.prototype.showSuccess = function () {
    this.$rsvpError.addClass('hidden');
    this.$rsvpSuccess.removeClass('hidden');
  };

  RSVP.prototype.collectInput = function () {
    var data = {};
    this.$rsvpForm.find('input').each(function (i, el) {
      var $el = $(el);
      var name = $el.prop('name');
      if ($el.prop('type') === 'checkbox') {
        data[name] = $el.prop('checked') ? 1 : 0;
      } else if ($el.prop('type') !== 'radio' || $el.prop('checked')) {
        data[name] = $el.val();
      }
    });

    data.message = this.$rsvpForm.find('textarea').val();
    console.log(data);
    return data;
  };

  navigationHandler();

  var now = new Date();
  copyrightYear(now);
  handlePageLoadToHash();
  clickToOpenAnimations();


  countdown(now);

  new RSVP(); // setup bindings
});
