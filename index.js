const map = './Images/Pellet Town.png'
const foregroundImg = './Images/foreground.png'
const playerUp = './Images/playerUp.png'
const playerDown = './Images/playerDown.png'
const playerLeft = './Images/playerLeft.png'
const playerRight = './Images/playerRight.png'
const battleBackgroundImg = './Images/battleBackground.png'
const fireBallImg = './Images/fireball.png'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const battleZonesMap = []
for(let i = 0; i<battleZonesData.length; i+=70){
  battleZonesMap.push(battleZonesData.slice(i,70+i))
}
const collisionsMap = []
for(let i = 0; i<collisions.length; i+=70){
  collisionsMap.push(collisions.slice(i,70+i))
}

const offSet={
  x: -735,
  y: -600
}



const boundaries = []
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if(symbol===1025)
    boundaries.push(new Boundary({ position: {
      x: j * Boundary.width + offSet.x,
      y: i * Boundary.height + offSet.y
    }}))
  })
})

const battleZones = []
battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if(symbol===1025)
    battleZones.push(new Boundary({ position: {
      x: j * Boundary.width + offSet.x,
      y: i * Boundary.height + offSet.y
    }}))
  })
})

const getImage = (imageUrl) => {
  const image = new Image()
  image.src = imageUrl
  return image
}


const playerDownImg = getImage(playerDown)
const playerUpImg = getImage(playerUp)
const playerRightImg = getImage(playerRight)
const playerLeftImg = getImage(playerLeft)


const player = new Sprite({
  position: {
    x:canvas.width/2 - (192/4)/2,
    y:canvas.height/2 - 68/2 + 20,
  },
  image: playerDownImg,
  frames:{
    max:4,
    hold: 10
  },
  sprites:{
    up: playerUpImg,
    down: playerDownImg,
    right: playerRightImg,
    left: playerLeftImg
  }
})


const background = new Sprite({
  position: {
    x: offSet.x,
    y: offSet.y,    
  },
  image: getImage(map)
})

const foreground = new Sprite({
  position: {
    x: offSet.x,
    y: offSet.y,    
  },
  image: getImage(foregroundImg)
})

const keys = {
  up:{
    pressed: false
  },
  left:{
    pressed: false
  },
  right:{
    pressed: false
  },
  down:{
    pressed: false
  }
}

const movables=[background,foreground, ...boundaries, ...battleZones]

const retangularCollision = ({rect1, rect2})=>{
  return(
    rect1.position.x + rect1.width>= rect2.position.x &&
    rect1.position.x<=rect2.position.x + rect2.width &&
    rect1.position.y+rect1.height/2 <=rect2.position.y +rect2.height &&
    rect1.position.y+rect1.height>=rect2.position.y
    )
}

const battle = {
  initiated: false
}

const animate = () =>{
  const animationId = requestAnimationFrame(animate)
  

  background.draw()
  boundaries.forEach(boundary=>{
    boundary.draw()
  })
  battleZones.forEach(battleZone=>{
    battleZone.draw()
  })
  player.draw()
  foreground.draw()

  let moving = true
  player.animate = false
  if( battle.initiated ) return
  //battle activate
  if( keys.down.pressed||keys.left.pressed||
      keys.right.pressed||keys.up.pressed
    ){
      for(let i = 0;i<battleZones.length;i++){
        const battleZone = battleZones[i]
        const overLappingArea = 
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y +( player.height),
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y))
        if(
          retangularCollision({
            rect1: player,
            rect2: battleZone
          }) && Math.abs(overLappingArea) > (player.width * player.height)/2
          && Math.random()<0.01
        ){
          

          cancelAnimationFrame(animationId)

          audio.map.stop()
          audio.initBattle.play()
          audio.battle.play()
          
          battle.initiated = true
          gsap.to("#overlappingDiv", {
            opacity: 1,
            repeat: 3,
            yoyo: true,
            duration:0.4,
            onComplete(){
              gsap.to("#overlappingDiv",{
                opacity: 1,
                duration:0.4,
                onComplete(){
                  //activate a new animation loop
                  initBattle()
                  animateBattle()
                  gsap.to("#overlappingDiv",{
                    opacity: 0,
                    duration:0.75,
                  })
                }
              })             
            }
          })
          break
        } 
      }
    }
  

  if (keys.down.pressed && lastKey ==='down') {
    player.animate=true;
    player.image = player.sprites.down
    for(let i = 0;i<boundaries.length;i++){
      const boundary = boundaries[i]
      if(
        retangularCollision({
          rect1: player,
          rect2: {...boundary, 
            position:{
            x: boundary.position.x,
            y: boundary.position.y-3
          }} 
        })
      ){
        
        moving = false
        break
      } 
    }
    
    if(moving)
      movables.forEach(movable=>movable.position.y-=3)
  }
  else if (keys.left.pressed && lastKey ==='left') {
    player.animate=true;
    player.image = player.sprites.left

    for(let i = 0;i<boundaries.length;i++){
      const boundary = boundaries[i]
      if(
        retangularCollision({
          rect1: player,
          rect2: {...boundary, 
            position:{
            x: boundary.position.x + 3,
            y: boundary.position.y
          }} 
        })
      ){
        
        moving = false
        break
      } 
    }
    if(moving)
    movables.forEach(movable=>movable.position.x+=3)
  }
  else if (keys.right.pressed && lastKey ==='right') {
    player.animate=true;
    player.image = player.sprites.right

    for(let i = 0;i<boundaries.length;i++){
      const boundary = boundaries[i]
      if(
        retangularCollision({
          rect1: player,
          rect2: {...boundary, 
            position:{
            x: boundary.position.x-3,
            y: boundary.position.y
          }} 
        })
      ){
        
        moving = false
        break
      } 
    }
    if(moving)
    movables.forEach(movable=>movable.position.x-=3)
  }
  else if (keys.up.pressed && lastKey ==='up') {
    player.animate=true;
    player.image = player.sprites.up

    for(let i = 0;i<boundaries.length;i++){
      const boundary = boundaries[i]
      if(
        retangularCollision({
          rect1: player,
          rect2: {...boundary, 
            position:{
            x: boundary.position.x,
            y: boundary.position.y+3
          }} 
        })
      ){
        
        moving = false
        break
      } 
    }
    if(moving)
    movables.forEach(movable=>movable.position.y+=3)
  }
}
animate()


let lastKey = ''

window.addEventListener('keydown', ({keyCode}) => {
  switch (keyCode){
    case 65:
      keys.left.pressed = true
      lastKey = 'left'
      break;
    case 83:
      keys.down.pressed = true
      lastKey = 'down'
      break;
    case 68:
      keys.right.pressed = true
      lastKey = 'right'
      break; 
    case 87:
      keys.up.pressed = true
      lastKey = 'up'
      break;       
  }
});

window.addEventListener('keyup', ({keyCode}) => {

  switch (keyCode){
    case 65:
      keys.left.pressed = false
      break;
    case 83:
      keys.down.pressed = false
      break;
    case 68:
      keys.right.pressed = false
      break; 
    case 87:
      keys.up.pressed = false
      break;       
  }
});

let clicked = false
addEventListener('click',()=>{
 if(!clicked){
   audio.map.play()
   clicked = true
 }
})

