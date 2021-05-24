//character positioning and sizing

$(window).on('resize', () => {
  console.log('resized')
  const gridH = $('#grid').height()
  const gridW = $('#grid').width()
  const cH = gridH * 0.2
  const cW = cH * 1.43

  $('.player')
    .css('height', `${cH}px`)
    .css('width', `${cW}px`)
    .css('top', `${cH * 2}px`)

  $('#player1').css('left', -cW)
  $('#player2').css('left', gridW)
})

$(document).trigger('resize')