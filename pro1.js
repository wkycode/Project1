const FPS = 60
const LOOP_INTERVAL = Math.round(1000 / FPS)
const $gameOverBox = $('#game-over-box')
const $p1HealthBar = $('#p1-health-bar')
const $p2HealthBar = $('#p2-health-bar')
const $restartButton = $('#restart-btn')
let GAME_WIDTH, GAME_HEIGHT, CHARACTER_WIDTH, CHARACTER_HEIGHT

let gameLoop
let player1 = {
  $elem:  $('#player1'),
  position: { x: 0, y: 0 },
  row: 3,
  beamDirection: 'normal',
  beams: [null, null, null, null, null],
  movement: { up: false, down: false, shoot: false },
  health: 3,
  isInvincible: false,
  invincibleStartTime: null,
  timeout: null
}
let player2 = {
  $elem: $('#player2'),
  position: { x: 0, y: 0 },
  row: 3,
  beamDirection: 'reverse',
  beams: [null, null, null, null, null],
  movement: { up: false, down: false, shoot: false },
  health: 3,
  isInvincible: false,
  invincibleStartTime: null,
  timeout: null
}

const handleResize = () => {
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
    const power = Math.ceil(Math.random() * (17 - 12) + 12)
    const newBeam = {
      $elem: $bElem,
      position: { 
        x: 0, 
        y: (GAME_HEIGHT / 5 * row) - (GAME_HEIGHT / 5 * 0.85)
      },
      power: Math.ceil(Math.random() * (17 - 12) + 12),
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

const restart = () => {
  clearInterval(gameLoop)
  gameLoop = setInterval(updateMovements, LOOP_INTERVAL)
  $gameOverBox.hide()
  $p1HealthBar.find('div').show()
  $p2HealthBar.find('div').show()

  $('.beam').remove()

  clearInterval(player1.timeout)
  clearInterval(player2.timeout)
  player1.$elem.removeClass('invincible exploding')
  player2.$elem.removeClass('invincible exploding')

  player1 = {
    ...player1,
    beams: [null, null, null, null, null],
    movement: { up: false, down: false, shoot: false },
    health: 3,
    isInvincible: false,
    invincibleStartTime: null,
    timeout: null
  }

  player2 = {
    ...player2,
    beams: [null, null, null, null, null],
    movement: { up: false, down: false, shoot: false },
    health: 3,
    isInvincible: false,
    invincibleStartTime: null,
    timeout: null
  }
}

const detectCollision =() =>{
  const { row: p1Row, beams: p1Beams, health: p1Health, isInvincible: p1IsInvincible, invincibleStartTime: p1invincibleStartTime } = player1
  const { row: p2Row, beams: p2Beams, health: p2Health, isInvincible: p2IsInvincible, invincibleStartTime: p2invincibleStartTime } = player2

  const currTime = new Date().getTime()

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
      const { $elem: $p1BeamElem } = p1Beams[i]
      let p1BeamWidth = Number($p1BeamElem.width())

      if (p1BeamWidth > GAME_WIDTH && i === p2Row - 1 && !p2IsInvincible){
        player2.$elem.addClass('exploding')
        player2.timeout = setTimeout(() => {
          player2.$elem.removeClass('exploding').addClass('invincible')
        }, 500)

        player2.health = p2Health - 1
        $p2HealthBar.find('div:visible').eq(0).hide()
        player2.isInvincible = true
        player2.invincibleStartTime = new Date().getTime()

        if (player2.health === 0) {
          const audio = new Audio("./over9000.mp3")
          audio.play();
          gameOver()
        }
      }
    }

    if (p2Beams[i]) {
      const { $elem: $p2BeamElem } = p2Beams[i]
      let p2BeamWidth = Number($p2BeamElem.width())

      if (p2BeamWidth > GAME_WIDTH && i === p1Row - 1 && !p1IsInvincible){
        player1.$elem.addClass('exploding')
        player1.timeout = setTimeout(() => {
          player1.$elem.removeClass('exploding').addClass('invincible')
        }, 500)

        player1.health = p1Health - 1
        $p1HealthBar.find('div:visible').eq(0).hide() 
        player1.isInvincible = true
        player1.invincibleStartTime = new Date().getTime()

        if (player1.health === 0) {
          const audio = new Audio("./over9000.mp3")
          audio.play();
          gameOver()

        }
      }
    }
  }

  if (p1IsInvincible && currTime - p1invincibleStartTime >= 2000) {
    player1.isInvincible = false
    player1.$elem.removeClass('invincible')
  }

  if (p2IsInvincible && currTime - p2invincibleStartTime >= 2000) {
    player2.isInvincible = false
    player2.$elem.removeClass('invincible')
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
  $restartButton.on('click', restart)

  restart()
}

init()





