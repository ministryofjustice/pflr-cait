/* global $ */


// Set up the variables
let filter = $('.js-filter');
let filterList = [];
let form = filter.find('form')
let articleContainer = $('.js-article-list');

let expandToggle = localStorage.getItem('toggled:collapse:expand')
if (expandToggle) {
  $('.title').addClass('expand').removeClass('collapse')
  form.addClass('expand');
} else {
  form.addClass('collapse');
}

// This is a generic function that can be moved to a utility if it is needed another component. All it does is swap one class for another on both the clicked target and an optional additional target.
let toggleClass = function(event) {
  let needle = event.data.needle;
  let element = needle.length ? needle : $(event.currentTarget);
  let origClass = event.data.origClass;
  let altClass = event.data.altClass;

  let toggled = ''
  if (element.hasClass(origClass)) {
    $(event.currentTarget).removeClass(origClass).addClass(altClass);
    element.removeClass(origClass).addClass(altClass);
    toggled = 'true'
  } else {
    $(event.currentTarget).removeClass(altClass).addClass(origClass);
    element.removeClass(altClass).addClass(origClass);
  }
  localStorage.setItem('toggled:' + origClass + ':' + altClass, toggled)
}

// Takes the event from a form update and shows or hides the appropriate sections on the page.
// Note: This doesn't save the state between sessions or page refreshes.
let doFilter = function(event) {
    articleContainer.find('article').hide();
    if (event) {
    let el = $(event.currentTarget);
    let elLabel = el.closest('li')
    let articleList = $('.c-article-list')
    elLabel.addClass('updating')
    articleList.addClass('updating')
    setTimeout(() => {
      elLabel.removeClass('updating')
      articleList.removeClass('updating')
    }, 300)
    let needle = el.attr('name');

    // check to see which items are checked and add those items to the filterList array.
    if(el.is(':checked')) {
      el.parents('li').addClass('checked');
      filterList.push(needle);
    } else {
      el.parents('li').removeClass('checked');
      filterList = filterList.filter(item => item !== needle);
    }
    localStorage.setItem('filterList', JSON.stringify(filterList))
  } else {
    let previousFilters = localStorage.getItem('filterList')
    if (previousFilters) {
      filterList = JSON.parse(previousFilters)
      filterList.forEach(f => {
        let $input = $('input[name=' + f + ']')
        $input.attr('checked', true)
        $input.closest('li').addClass('checked')
      })
    }
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

  // If a card group has no visible cards, hide its heading
  $('.u-cards').each(function(){
    let $cards = $(this);
    let cardMethod = $cards.find('.u-card').is(':visible') ? 'show' : 'hide'
    $cards.find('h2')[cardMethod]()
  })
}

filter.find('.title').on('click', { origClass: 'collapse', altClass: 'expand', needle: form },  toggleClass);
filter.find('input').on('change', doFilter);
doFilter()