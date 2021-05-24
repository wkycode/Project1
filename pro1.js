let GAME_WIDTH, GAME_HEIGHT, CHARACTER_WIDTH, CHARACTER_HEIGHT
let FPS = 144
let LOOP_INTERVAL = Math.round(1000 / FPS)
let VELOCITY = 6

const $player1 = $('#player1')
let player1 = {
  position: { x: 0, y: 0 },
  movement: { up: false, down: false }
}

const $player2 = $('#player2')
let player2 = {
  position: { x: 0, y: 0 },
  movement: { up: false, down: false }
}

//character positioning and sizing
$(window).on('resize', () => {
  console.log('resized')
  GAME_WIDTH = $('#grid').width()
  GAME_HEIGHT = $('#grid').height()
  CHARACTER_HEIGHT = GAME_HEIGHT * 0.2
  CHARACTER_WIDTH = CHARACTER_HEIGHT * 1.43

  $('.player')
    .css('height', `${CHARACTER_HEIGHT}px`)
    .css('width', `${CHARACTER_WIDTH}px`)
    .css('top', `${CHARACTER_HEIGHT * 2}px`)

  $('#player1').css('left', -CHARACTER_WIDTH)
  $('#player2').css('left', GAME_WIDTH)

  const player1Pos = $player1.position()
  player1.position.x = player1Pos.left
  player1.position.y = player1Pos.top

  const player2Pos = $player2.position()
  player2.position.x = player2Pos.left
  player2.position.y = player2Pos.top
})

$(document).trigger('resize')

//character movement
let gameLoop

// Toggle which direction the character is moving to
const setCharacterMovement = (value, keyCode) => {
  switch (keyCode) {
    case 38:
      player2.movement.up = value
      break
    case 40:
      player2.movement.down = value
      break
  }
}

// Handling Key Down
const handleKeyDown = (e) => {
  setCharacterMovement(true, e.keyCode)
}

// Handling Key Up
const handleKeyUp = (e) => {
  const { keyCode } = e
  setCharacterMovement(false, e.keyCode)
}

// Everytime this gets invoked, update character position
const updateMovements = () => {
  const { position: { y }, movement: {up, down } } = player2
  let newY = y

  if (up) newY -= VELOCITY
  if (down) newY += VELOCITY

  player2.position.y = newY
  $player2.css('top', newY)
}

const init = () => {
  $(document).on('keydown', handleKeyDown)
  $(document).on('keyup', handleKeyUp)

  gameLoop = setInterval(updateMovements, LOOP_INTERVAL)
}

init()


