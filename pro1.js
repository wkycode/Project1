let GAME_WIDTH, GAME_HEIGHT, CHARACTER_WIDTH, CHARACTER_HEIGHT
let FPS = 60
let LOOP_INTERVAL = Math.round(1000 / FPS)

let player1 = {
  $elem:  $('#player1'),
  position: { x: 0, y: 0 },
  movement: { up: false, down: false, shoot: false },
  row: 3,
  beams: [null, null, null, null, null],
  beamDirection: 'normal'
}

let player2 = {
  $elem: $('#player2'),
  position: { x: 0, y: 0 },
  movement: { up: false, down: false, shoot: false },
  row: 3,
  beams: [null, null, null, null, null],
  beamDirection: 'reverse'
}

let gameLoop

const handleResize = () => {
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

  const player1Pos = player1.$elem.position()
  player1.position.x = player1Pos.left
  player1.position.y = player1Pos.top
  player1.row = 3

  const player2Pos = player2.$elem.position()
  player2.position.x = player2Pos.left
  player2.position.y = player2Pos.top
  player2.row = 3
}

const setCharacterMovement = (value, keyCode) => {
  switch (keyCode) {
    case 38: {
      player2.movement.up = value
      break
    }
    case 40: {
      player2.movement.down = value
      break
    }
    case 37: {
      player2.movement.shoot = value
      break
    }
    case 87: {
      player1.movement.up = value
      break
    }
    case 83: {
      player1.movement.down = value
      break
    }
    case 68: {
      player1.movement.shoot = value
      break
    }
  }
}

const handleKeyDown = (e) => {
  setCharacterMovement(true, e.keyCode)
}

const updateCharacterMovement = (player) => {
  const { position: { y }, movement: { up, down }, row } = player
  let newY = y

  if (up && row > 1) {
    newY -= CHARACTER_HEIGHT 
    player.row = row - 1
  }

  if (down && row < 5) {
    newY += CHARACTER_HEIGHT 
    player.row = row + 1
  }
  
  player.position.y = newY
  player.$elem.css('top', newY)
  player.movement = { ...player.movement, up: false, down: false }
}

const generateBeam = (beamClass) => {
  return `
    <div class="beam ${beamClass}">
      <div class="main" style="display: none;"></div>
      <div class="end"" style="display: none;"></div>
      <div class="start"></div>
    </div>
  `
}

const spawnBeam = (player) => {
  const { movement: { shoot }, row, beamDirection, beams } = player
  
  if (shoot && beams[row - 1] === null) {
    const $elem = $(generateBeam(beamDirection))
    const power = Math.ceil(Math.random() * 10)
    const newBeam = {
      $elem,
      position: { 
        x: 0, 
        y: (GAME_HEIGHT / 5 * row) - (GAME_HEIGHT / 5 * 0.85)
      },
      power: Math.ceil(Math.random() * 10),
      row
    }
  
    $elem.css({
      top: newBeam.position.y,
      height: `${(GAME_HEIGHT / 5) * 0.7}px`,
      width: `${(GAME_HEIGHT / 5) * 0.7}px`
    })
    $elem.appendTo("#grid")
    player.beams[row - 1] = newBeam
  }

  player.movement.shoot = false
}

const updateBeamMovement = (player) => {
  player.beams.forEach((beam) => {
    if (beam) {
      const { $elem, power, row } = beam
      const newW = $elem.width() + power
  
      if (newW >= GAME_WIDTH + CHARACTER_WIDTH){
        $elem.remove()
        player.beams[row - 1] = null
      } else {
        $elem.css('width', newW).find('.main, .end').show()
      }
    }
  })
}

// detectCollision(player1, player2)
const detectCollision =() =>{
  for (let i = 0; i < 5; i++) {
    if (player1.beams[i] && player2.beams[i]) {
      const { $elem: $p1Elem, row: p1Row, beams: p1Beams, power: p1Power } = player1.beams[i]
      const { $elem: $p2Elem, row: p2Row, beams: p2Beams, power: p2Power } = player2.beams[i]
      console.log($p1Elem.width())
      let p1Width = Number($p1Elem.width())
      let p2Width = Number($p2Elem.width())

      if ( p1Width >= GAME_WIDTH - p2Width && p1Power > p2Power) {
        player2.beams[i] = null
      }
      if ( p2Width >= GAME_WIDTH - p1Width && p2Power > p1Power){
        player1.beams[i]= null
      }
    }
  }
}
const updateMovements = () => {
  updateCharacterMovement(player1)
  updateCharacterMovement(player2)

  spawnBeam(player1)
  spawnBeam(player2)

  updateBeamMovement(player1)
  updateBeamMovement(player2)

  detectCollision()
}

const init = () => {
  $(window).on('resize', handleResize).trigger('resize')
  $(document).on('keydown', handleKeyDown)

  gameLoop = setInterval(updateMovements, LOOP_INTERVAL)
}

init()







