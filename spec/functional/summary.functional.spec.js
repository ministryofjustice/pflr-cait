Feature('Main summary page')

Scenario('Summary page includes the phrase "Child arrangements"', (I) => {
  I.amOnPage('/')
  I.see('child arrangements')
})
