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

  function Rsvp() {
    this.$submit = $('#rsvp-button');
    this.$rsvpError =  $('#rsvp-error');
    this.$rsvpSuccess = $('#rsvp-success');
    this.$specificRsvpError = $('#specific-rsvp-error');

    this.curStage = 0;
    var boundNext = this.next(), boundError = this.showError(), boundSuccess = this.showSuccess();
    var rsvpSearch = new RsvpSearch($('#rsvp-search'), boundError, boundSuccess, boundNext);
    var rsvpForm = new RsvpForm($('#rsvp-form'), boundError, boundSuccess, boundNext);
    this.stages = [rsvpSearch, rsvpForm];

    this.$submit.click(this.onSubmit());
  };

  Rsvp.prototype.onSubmit = function () {
    var self = this;
    return function (e) {
      e.preventDefault();
      self.$submit.prop('disabled', true);

      var currentStage = self.stages[self.curStage];
      var promise = currentStage.onSubmit(e);
      if (promise) {
        promise.always(function () {
          self.$submit.prop('disabled', false);
        });
      } else {
        self.$submit.prop('disabled', false);
      }
    }
  };

  Rsvp.prototype.showError = function () {
    var self = this;
    return function (errorMsgs) {
      self.$specificRsvpError.empty();
      if (!errorMsgs.length) {
        errorMsgs = ['Please try again in a few minutes, or send an email to info@gauravlovesradhika.com'];
      }

      for (var i = 0, len = errorMsgs.length; i < len; ++i) {
        var errorMsg = $('<div>').text(errorMsgs[i]);
        self.$specificRsvpError.append(errorMsg);
      }

      self.$rsvpError.removeClass('hidden');
      self.$rsvpSuccess.addClass('hidden');
      _scrollToEl('#rsvp-msg');
    };
  };

  Rsvp.prototype.showSuccess = function () {
    var self = this;
    return function (msgs) {
      self.$rsvpError.addClass('hidden');
      self.$rsvpSuccess.empty();
      for (var i = 0, len = msgs.length; i < len; ++i) {
        var msg = $('<div>').text(msgs[i]);
        self.$rsvpSuccess.append(msg);
      }

      self.$rsvpSuccess.removeClass('hidden');
    };
  };

  Rsvp.prototype.next = function (guest) {
    var self = this;
    return function (guest) {
      self.$rsvpError.addClass('hidden');
      self.$rsvpSuccess.addClass('hidden');
      self.stages[self.curStage].hide();
      console.log(guest);

      if (self.curStage + 1 < self.stages.length) {
        ++self.curStage;
        self.stages[self.curStage].show(guest);
      } else {
        self.showSuccess()(["Thank you!. Your RSVP for Gaurav & Radhika's wedding has been successfully saved"]);
        self.$submit.hide();
        setTimeout(function() {_scrollToEl('#rsvp');}, 0);
      }
    };
  };


  function RsvpForm($el, onError, showSuccess, next) {
    this.$el = $el;
    this.$adultCntMax = $("#adultCntMax");
    this.$childCntMax = $("#childCntMax");
    var fields = this.fields = {};
    this.$el.find('input').each(function (i, input) {
      var $input = $(input);
      fields[$input.prop('name')] = $input;
    });

    fields.adultCount.change(this.enforceLimit('max_num_adults'));
    fields.childCount.change(this.enforceLimit('max_num_children'));

    this.events = ['sangeet', 'wedding', 'reception'];
    this.onError = onError;
    this.showSuccess = showSuccess;
    this.next = next;
  };

  RsvpForm.prototype.enforceLimit = function (field) {
    var self = this;
    return function (e) {
      var $input = $(e.target);
      if ($input.val() > self.guest[field] || $input.val() < 0) {
        $input.siblings('label').addClass('text-danger');
        $input.val(self.guest[field]);
      } else {
        $input.siblings('label').removeClass('text-danger');
      }
    };
  };

  RsvpForm.prototype.onSubmit = function (e) {
    var data = this.collectInput(this.$el);
    if (!this.validate(data)) {
      return false;
    }

    data.guestHash = this.guest.hash;

    return $.ajax({
      url:'/api/rsvp', method:'POST', data:data, context:this
    }).fail(function (jqXhr) {
      var response = jqXhr.responseJSON;
      var errs = [];
      if (response) {
        this.rsvpHash = response.rsvpHash;
        errs = response.err_msg;
      }

      this.onError(errs);
    }).done(function () {
      this.next();
    });
  };

  function parseIntAndSum() {
    var value = 0;
    for (var i = 0; i < arguments.length; i++) {
      try {
        var num = parseInt(arguments[i]);
        if (!isNaN(num)) {
          value += num;
        }
      } catch(e){}
    }
    return value;
  }

  RsvpForm.prototype.validate = function (data) {
    var errors = [];
    if (!data.name) {
      errors.push('Missing name');
    } else if (data.name.length < 2) {
      errors.push('Name does not look valid. Please submit your full name');
    }

    if (!data.decline) {
      if (!data.adultCount) {
        errors.push('Please RSVP with the number of guests');
      } else if (data.adultCount > this.guest.max_num_adults) {
        errors.push('Please limit your RSVP to ' + this.guest.max_num_adults + ' adults');
      }

      if (data.childCount > this.guest.max_num_children) {
        errors.push('Please limit your RSVP to ' + this.guest.max_num_children + ' children');
      }

      var foodCnt = parseIntAndSum(data.num_veg, data.num_non_veg);
      if (!foodCnt) {
        errors.push('Please indicate how many in your party are Vegetarian or not');
      } else {
        var rsvpCnt = parseIntAndSum(data.adultCount, data.childCount);
        if (foodCnt !== rsvpCnt) {
          errors.push('Out of ' + rsvpCnt + ' guests, you have specified dietary restrictions for ' + foodCnt);
        }
      }
    }

    var count = 0;
    for (var i = 0, len = this.events.length; i < len; ++i) {
      var rsvp = data[this.events[i]];
      if (rsvp) {
        count++;
      }
    }

    if (!(count ^ data.decline)) {
      errors.push('You must choose to either decline or attend')
    }

    if (errors.length) {
      this.onError(errors);
      return false;
    }

    return true;
  }

  RsvpForm.prototype.collectInput = function ($form) {
    var data = {};
    $form.find('input').each(function (i, el) {
      var $el = $(el);
      var name = $el.prop('name');
      if ($el.prop('type') === 'checkbox') {
        data[name] = $el.prop('checked') ? 1 : 0;
      } else if ($el.prop('type') !== 'radio' || $el.prop('checked')) {
        data[name] = $el.val().trim();
      }
    });

    data.message = $form.find('textarea').val().trim();
    return data;
  };

  RsvpForm.prototype.show = function (guest) {
    this.guest = guest;
    if (!guest.max_num_adults) {
      guest.max_num_adults = 1;
    }

    this.fields.name.val(guest.display_name);
    var isPrevHidden = false;
    for (var i = 0, len = this.events.length; i < len; ++i) {
      var event = this.events[i];
      if (guest['invited_to_' + event]) {
        var $container = this.fields[event].parent().parent().show();
        if (isPrevHidden) {
          $container.css('margin-top', '5px');
          isPrevHidden = false;
        }
      } else {
        this.fields[event].parent().parent().hide().css('margin-top', '');
        isPrevHidden = true;
      }
    }

    this.$adultCntMax.text("(Max " + guest.max_num_adults + ")");
    if (guest.max_num_children) {
      this.$childCntMax.text("(Max " + guest.max_num_children + ")").parent().parent().show();
    } else {
      this.$childCntMax.parent().parent().hide();
    }

    this.$el.collapse('show');
  };

  RsvpForm.prototype.hide = function () {
    this.$el.collapse('hide');
  };


  function RsvpSearch($el, onError, showSuccess, next) {
    this.$el = $el;
    this.$resultsContainer = $el.find('.container');
    this.$input = $el.find('input[name="searchName"]');
    this.errCallback = onError;
    this.successCallback = showSuccess;
    this.suggestions = [
      'If none of them match, try the following',
      '1) Try searching for your first & last names',
      '2) Email us directly at info@gauravlovesradhika.com'
    ];

    var self = this;
    $el.on('click', '.guest-card', function (e) {
      var hash = $(e.target).data('guest-hash');
      var guest = null;
      for (var i = 0, len = self.results.length; i < len; ++i) {
        if (self.results[i].hash === hash) {
          guest = self.results[i];
          break;
        }
      }

      if (!guest) {
        onError(['Something went wrong. Please try again.']);
      } else {
        next(guest);
      }
    });
  };

  RsvpSearch.prototype.hide = function () {
    this.$el.collapse('hide');
  };

  RsvpSearch.prototype.onSubmit = function (e) {
    var searchName = this.$input.val().trim();
    if (searchName.length < 3) {
      if (searchName.length > 0) {
        this.errCallback(['Please enter your full name.']);
      }
      return false;
    }

    return $.ajax({
      url: '/api/rsvp', method:'GET', data:{name:searchName}, context:this
    }).done(function (response) {
      if (response && response.results && response.results.length) {
        this.results = response.results;
        this.askWhichGuest(response.results);
        var addS = response.results.length === 1 ? '': 's';
        var msgs = [
          'Found ' + response.results.length + ' matching reservation' + addS + '. Please select yours.',
        ].concat(this.suggestions);
        this.successCallback(msgs);
      }
    }).fail(function (resp) {
      this.errCallback(['Sorry, we were unable to find your RSVP'].concat(this.suggestions));
    });
  };

  RsvpSearch.prototype.askWhichGuest = function (results) {
    // Save rendering operations until we've added all the nodes
    this.$resultsContainer.empty().addClass('hidden');

    for (var i = 0, len = results.length; i < len; ++i) {
      var guest = results[i];
      $('<div>')
        .text(guest.display_name)
        .data('guest-hash', guest.hash)
        .addClass('guest-card')
        .appendTo(this.$resultsContainer);
    }

    this.$resultsContainer.removeClass('hidden');
  };








  navigationHandler();

  var now = new Date();
  copyrightYear(now);
  handlePageLoadToHash();
  clickToOpenAnimations();


  countdown(now);

  new Rsvp(); // setup bindings
});
