let GAME_WIDTH, GAME_HEIGHT, CHARACTER_WIDTH, CHARACTER_HEIGHT
let FPS = 60
let LOOP_INTERVAL = Math.round(1000 / FPS)
let $gameOverBox = $('#game-over-box')

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
  const { $elem, position: { y }, movement: { up, down }, row } = player
  let newY = y

  if (up && row > 1) {
    newY -= CHARACTER_HEIGHT 
    player.row = row - 1
  }

  if (down && row < 5) {
    newY += CHARACTER_HEIGHT 
    player.row = row + 1
  }
  
  if (y !== newY) {
    $elem.css('top', newY).removeClass('shoot')
    player.position.y = newY
  }

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
  const { $elem: $pElem, movement: { shoot }, row, beamDirection, beams } = player
  
  if (shoot && beams[row - 1] === null) {
    const $bElem = $(generateBeam(beamDirection))
    const power = Math.ceil(Math.random() * (15 - 8) + 8)
    const newBeam = {
      $elem: $bElem,
      position: { 
        x: 0, 
        y: (GAME_HEIGHT / 5 * row) - (GAME_HEIGHT / 5 * 0.85)
      },
      power: Math.ceil(Math.random() * (15 - 8) + 8),
      row
    }
  
    $bElem.css({
      top: newBeam.position.y,
      height: `${(GAME_HEIGHT / 5) * 0.7}px`,
      width: `${(GAME_HEIGHT / 5) * 0.7}px`
    })
    
    $pElem.addClass('shoot')
    setTimeout(() => {
      $pElem.removeClass('shoot')
    }, 500)

    $bElem.appendTo("#grid")
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

const gameOver = () => {
  clearInterval(gameLoop)
  gameLoop = null
  $gameOverBox.show()
}

const detectCollision =() =>{
  const { row: p1Row, beams: p1Beams } = player1
  const { row: p2Row, beams: p2Beams } = player2

  for (let i = 0; i < 5; i++) {
    if (p1Beams[i] && p2Beams[i]) {
      const { $elem: $p1BeamElem, power: p1BeamPower } = p1Beams[i]
      const { $elem: $p2BeamElem, power: p2BeamPower } = p2Beams[i]

      let p1BeamWidth = Number($p1BeamElem.width())
      let p2BeamWidth = Number($p2BeamElem.width())

      if (p1BeamWidth + p2BeamWidth >= GAME_WIDTH) {
        if (p1BeamPower > p2BeamPower) {
          p2Beams[i] = null
          $p2BeamElem.remove()
        } else if (p2BeamPower > p1BeamPower) {
          p1Beams[i]= null
          $p1BeamElem.remove()
        } else {
          p1Beams[i]= null
          $p1BeamElem.remove()
          p2Beams[i] = null
          $p2BeamElem.remove()
        }
      }
    }

    if (p1Beams[i]) {
      console.log("Checking")
      const { $elem: $p1BeamElem } = p1Beams[i]
      let p1BeamWidth = Number($p1BeamElem.width())

      if (p1BeamWidth > GAME_WIDTH && i === p2Row - 1){
        console.log("P2 got hit")
        player2.$elem.addClass('exploding').animate({
          opacity: 0,
        }, 1000, () => {
          player1.$elem.remove()
        })
        gameOver()
      }
    }

    if (p2Beams[i]) {
      const { $elem: $p2BeamElem } = p2Beams[i]
      let p2BeamWidth = Number($p2BeamElem.width())

      if (p2BeamWidth > GAME_WIDTH && i === p1Row - 1){
        player1.$elem.addClass('exploding').animate({
          opacity: 0,
        }, 1000, () => {
          player1.$elem.remove()
        })  
        gameOver()
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




