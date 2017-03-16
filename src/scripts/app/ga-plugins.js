// https://github.com/googleanalytics/autotrack
(function () {
  const dimensions = {
    QUERY_DIMENSION: 7,
    BREAKPOINT: 8,
    PIXEL_DENSITY: 9,
    DEVICE_ORIENTATION: 10
  }

  window.ga = window.ga || function () {
    (ga.q = ga.q || []).push(arguments)
  }

  // cleanUrlTracker
  ga('require', 'cleanUrlTracker', {
    stripQuery: true,
    queryDimensionIndex: dimensions.QUERY_DIMENSION,
    indexFilename: 'index.html',
    trailingSlash: 'remove'
  })

  // outboundLinkTracker
  ga('require', 'outboundLinkTracker', {
    events: ['click', 'contextmenu']
  })

  // pageVisibilityTracker
  ga('require', 'pageVisibilityTracker')

  // mediaQueryTracker
  ga('require', 'mediaQueryTracker', {
    definitions: [
      {
        name: 'Breakpoint',
        dimensionIndex: dimensions.BREAKPOINT,
        items: [
          {name: 's', media: 'all'},
          {name: 'm', media: '(min-width: 740px)'},
          {name: 'l', media: '(min-width: 1080px)'}
        ]
      },
      {
        name: 'Pixel Density',
        dimensionIndex: dimensions.PIXEL_DENSITY,
        items: [
          {name: '1x', media: 'all'},
          {name: '1.5x', media: '(min-resolution: 144dpi)'},
          {name: '2x', media: '(min-resolution: 192dpi)'}
        ]
      },
      {
        name: 'Device Orientation',
        dimensionIndex: dimensions.DEVICE_ORIENTATION,
        items: [
          {name: 'landscape', media: '(orientation: landscape)'},
          {name: 'portrait', media: '(orientation: portrait)'}
        ]
      }
    ]
  })
  // maxScrollTracker
  ga('require', 'maxScrollTracker')
})()
