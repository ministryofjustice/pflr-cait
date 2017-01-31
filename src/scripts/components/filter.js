/* global $ */

let filter = $('.js-filter');

let form = filter.find('form').addClass('collapse');

let toggleClass = function(event) {
  let needle = event.data.needle;
  let element = needle.length ? needle : event.currentTarget;
  let origClass = event.data.origClass;
  let altClass = event.data.altClass;

  if (element.hasClass(origClass)) {
    element.removeClass(origClass).addClass(altClass);
  } else {
    element.removeClass(altClass).addClass(origClass);
  }
}

filter.on('click', { origClass: 'collapse', altClass: 'expand', needle: form },  toggleClass);
