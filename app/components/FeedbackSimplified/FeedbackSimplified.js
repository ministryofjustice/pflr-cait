if (window.jQuery) {
  const helpfulEvent = (eventLabel, eventAction) => {
    const eventValue = eventLabel === 'yes' ? 1 : -1
    eventAction = eventAction || document.location.pathname
    return {
      eventCategory: 'Page Helpfulness',
      eventAction,
      eventLabel,
      eventValue
    }
  }

  jQuery('.FeedbackSimplified a').attr('data-link-type', 'feedback-simplified')
  const $feedbackDefault = jQuery('.FeedbackSimplified__default')
  const $feedbackQuestion = jQuery('.FeedbackSimplified__question')
  const $feedbackFollowup = jQuery('.FeedbackSimplified__followup')

  const toggleFeedbackAriaState = ($show, $hide) => {
    $show.attr('aria-hidden', false)
    $hide.attr('aria-hidden', true)
  }
  toggleFeedbackAriaState($feedbackQuestion, $feedbackDefault)

  jQuery('.FeedbackSimplified__response').on('click', function () {
    const $response = jQuery(this)
    $response.closest('.FeedbackSimplified').addClass('FeedbackSimplified--answered')

    toggleFeedbackAriaState($feedbackFollowup, $feedbackQuestion)
    const helpfulPayload = helpfulEvent($response.data('response'))
    ga('create', 'UA-91035505-5');
    ga('send', 'event', helpfulPayload)
  })
}
