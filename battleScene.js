const battleBackground = new Sprite({
  position: {
    x:0,
    y:0
  },
  image: getImage(battleBackgroundImg)
})

let draggle 
let emby 
let renderedSprites
let battleAnimationID
let queue 

const initBattle = () =>{

  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  draggle = new Monster({...monsters.Draggle, isEnemy: true})
  emby = new Monster(monsters.Emby)
  renderedSprites = [ draggle, emby]
  queue = []

  emby.attacks.forEach(attack=>{
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
  })

  //event listeners for buttons
document.querySelectorAll('button').forEach(button=>{
  button.addEventListener('click',(e)=>{
    const selectedAttack = attacks[e.currentTarget.innerHTML]
    emby.attack({ 
      attack:selectedAttack,
      recipient: draggle, 
      renderedSprites
    })
    if(draggle.health<=0){
      queue.push(()=>{
        draggle.faint()
      })
      queue.push(()=>{
        gsap.to('#overLappingDiv',{
          opacity: 1,
          onComplete:()=>{
            cancelAnimationFrame(battleAnimationID)
            animate()
            document.querySelector("#userInterface").style.display = 'none'
            gsap.to('#overLappingDiv', {
              opacity: 0
            })
            battle.initiated = false
            audio.map.play()
          }
        })
      })
    }
    // enemy attack
    const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]
    queue.push(()=>{
      draggle.attack({ 
        attack:randomAttack,
        recipient: emby, 
        renderedSprites
      })
      if(emby.health<=0){
        queue.push(()=>{
          emby.faint()
        })
        queue.push(()=>{
          gsap.to('#overLappingDiv',{
            opacity: 1,
            onComplete:()=>{
              cancelAnimationFrame(battleAnimationID)
              animate()
              document.querySelector("#userInterface").style.display = 'none'
              gsap.to('#overLappingDiv', {
                opacity: 0
              })
              battle.initiated = false
              audio.map.play()
            }
          })
        })
      }
    })
  })

  button.addEventListener('mouseenter',(e)=>{
    const selectedAttack = attacks[e.currentTarget.innerHTML]
    document.querySelector('#attackType').innerHTML = selectedAttack.type
    document.querySelector('#attackType').style.color = selectedAttack.color
  })
})
}

const animateBattle = ()=>{
  battleAnimationID =  requestAnimationFrame(animateBattle)
  battleBackground.draw()
  renderedSprites.forEach(sprite=>{
    sprite.draw()
  })
}
// animate()
// initBattle()
// animateBattle()


document.querySelector('#dialogueBox').addEventListener('click',(e)=>{
  if(queue.length>0) {
    queue[0]()
    queue.shift()
  
  } else e.currentTarget.style.display = 'none'
})