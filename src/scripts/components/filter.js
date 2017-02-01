/* global $ */

let filter = $('.js-filter');

let form = filter.find('form').addClass('collapse');
let articleContainer = $('.js-article-list');

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

let filterList = [];

let doFilter = function(event) {
  let el = $(event.currentTarget);
  let needle = el.attr('name');
  articleContainer.find('article').hide();
  if(el.is(':checked')) {
    filterList.push(needle);
  } else {
    filterList = filterList.filter(item => item !== needle);
  }
  console.log(filterList);
  for (let article in filterList) {
    if(article) {
      articleContainer.find('article[data-slug="'+filterList[article]+'"]').show();
    }
  }
}

filter.find('.title').on('click', { origClass: 'collapse', altClass: 'expand', needle: form },  toggleClass);
filter.find('input').on('change', doFilter);
