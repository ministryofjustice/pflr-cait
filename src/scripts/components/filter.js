/* global $ */


// Set up the variables
let filter = $('.js-filter');
let filterList = [];
let form = filter.find('form').addClass('collapse');
let articleContainer = $('.js-article-list');

// This is a generic function that can be moved to a utility if it is needed another component. All it does is swap one class for another on both the clicked target and an optional additional target.
let toggleClass = function(event) {
  let needle = event.data.needle;
  let element = needle.length ? needle : $(event.currentTarget);
  let origClass = event.data.origClass;
  let altClass = event.data.altClass;

  if (element.hasClass(origClass)) {
    $(event.currentTarget).removeClass(origClass).addClass(altClass);
    element.removeClass(origClass).addClass(altClass);
  } else {
    $(event.currentTarget).removeClass(altClass).addClass(origClass);
    element.removeClass(altClass).addClass(origClass);
  }
}

// Takes the event from a form update and shows or hides the appropriate sections on the page.
// Note: This doesn't save the state between sessions or page refreshes.
let doFilter = function(event) {
  let el = $(event.currentTarget);
  let needle = el.attr('name');
  articleContainer.find('article').hide();

  // check to see which items are checked and add those items to the filterList array.
  if(el.is(':checked')) {
    el.parents('li').addClass('checked');
    filterList.push(needle);
  } else {
    el.parents('li').removeClass('checked');
    filterList = filterList.filter(item => item !== needle);
  }

  // If the array has items in then filter by the array, if not then show all the articles.
  if (filterList.length > 0) {
    for (let article in filterList) {
      if(article) {
        articleContainer.find('article[data-slug="'+filterList[article]+'"]').show();
      }
    }
  } else {
    articleContainer.find('article').show();
  }

  $('.u-cards').each(function(){
    var $cards = $(this);
    var cardMethod = $cards.find('.u-card').is(':visible') ? 'show' : 'hide'
    $cards.find('h2')[cardMethod]()
  })
}

filter.find('.title').on('click', { origClass: 'collapse', altClass: 'expand', needle: form },  toggleClass);
filter.find('input').on('change', doFilter);
