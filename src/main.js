import './style.css'

const revealElements = document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right'
)

const revealOnScroll = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
      }
    })
  },
  {
    threshold: 0.15,
  }
)

revealElements.forEach((element) => {
  revealOnScroll.observe(element)
})

// Cuenta regresiva
const weddingDate = new Date('2026-12-05T00:00:00').getTime()

const daysElement = document.getElementById('days')
const hoursElement = document.getElementById('hours')
const minutesElement = document.getElementById('minutes')
const secondsElement = document.getElementById('seconds')

function updateCountdown() {
  const now = new Date().getTime()
  const distance = weddingDate - now

  if (distance <= 0) {
    daysElement.textContent = '00'
    hoursElement.textContent = '00'
    minutesElement.textContent = '00'
    secondsElement.textContent = '00'
    return
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor(
    (distance % (1000 * 60 * 60)) / (1000 * 60)
  )
  const seconds = Math.floor(
    (distance % (1000 * 60)) / 1000
  )

  daysElement.textContent = String(days).padStart(2, '0')
  hoursElement.textContent = String(hours).padStart(2, '0')
  minutesElement.textContent = String(minutes).padStart(2, '0')
  secondsElement.textContent = String(seconds).padStart(2, '0')
}

// Transición de entrada principal
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader')
  const mainContent = document.getElementById('main-content')

  setTimeout(() => {
    mainContent?.classList.add('main-visible')
  }, 350)

  setTimeout(() => {
    loader?.classList.add('loader-hidden')
  }, 1300)

  setTimeout(() => {
    loader?.remove()
  }, 2500)
})

const openInvitationButton = document.getElementById('open-invitation')

openInvitationButton?.addEventListener('click', (event) => {
  event.preventDefault()

  document.body.classList.add('page-exit')

  setTimeout(() => {
    window.location.href = openInvitationButton.href
  }, 700)
})

updateCountdown()
setInterval(updateCountdown, 1000)


// Historia interactiva
const storyTabs = document.querySelectorAll('.story-tab')
const storyPanels = document.querySelectorAll('.story-panel')

storyTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.story

    storyTabs.forEach((item) => {
      item.classList.remove('active')
    })

    storyPanels.forEach((panel) => {
      panel.classList.remove('active')
    })

    tab.classList.add('active')
    document.getElementById(targetId)?.classList.add('active')
  })
})



// Video de nuestra boda

const weddingVideo = document.getElementById('wedding-video')
const videoPlayButton = document.getElementById('wedding-video-play')
const videoCover = document.getElementById('wedding-video-cover')

if (weddingVideo && videoPlayButton && videoCover) {
  videoPlayButton.addEventListener('click', async () => {
    try {
      await weddingVideo.play()
      videoCover.classList.add('is-hidden')
    } catch (error) {
      console.error('No se pudo reproducir el video:', error)
    }
  })

  weddingVideo.addEventListener('ended', () => {
    weddingVideo.currentTime = 0
    videoCover.classList.remove('is-hidden')
  })
}

