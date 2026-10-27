
import './style.css'
import './confirmacion.css'

const RSVP_ENDPOINT = '/api/rsvp'
const MAX_COMPANIONS = 6

const form = document.getElementById('rsvp-form')
const attendingFields = document.getElementById('attending-fields')
const decliningFields = document.getElementById('not-attending-fields')
const quantitySelect = document.getElementById('companion-quantity')
const companionFields = document.getElementById('companion-fields')
const guestTotal = document.getElementById('guest-total')
const feedback = document.getElementById('form-feedback')
const submitButton = document.getElementById('submit-rsvp')
const submitLabel = document.getElementById('submit-label')

function selectedAttendance() {
  return form.querySelector(
    'input[name="asistencia"]:checked'
  )?.value || 'si'
}

function companionQuantity() {
  if (selectedAttendance() !== 'si') return 0

  const number = Number(quantitySelect.value)

  return Number.isInteger(number)
    ? Math.min(MAX_COMPANIONS, Math.max(0, number))
    : 0
}

// Crear una sola vez los seis campos.
function createCompanionFields() {
  if (!companionFields) return

  for (let i = 1; i <= MAX_COMPANIONS; i++) {
    const field = document.createElement('div')
    field.className = 'rsvp-field'
    field.id = `companion-${i}-field`
    field.hidden = true

    const label = document.createElement('label')
    label.htmlFor = `companion-${i}`
    label.textContent = `Nombre completo del acompañante ${i} *`

    const input = document.createElement('input')
    input.id = `companion-${i}`
    input.name = `acompanante_${i}`
    input.type = 'text'
    input.maxLength = 120
    input.placeholder = `Nombre del acompañante ${i}`
    input.autocomplete = 'off'
    input.disabled = true

    field.append(label, input)
    companionFields.appendChild(field)
  }
}

function updateForm() {
  const attends = selectedAttendance() === 'si'
  const quantity = companionQuantity()

  if (attendingFields) {
    attendingFields.hidden = !attends
  }

  if (decliningFields) {
    decliningFields.hidden = attends
  }

  for (let i = 1; i <= MAX_COMPANIONS; i++) {
    const field = document.getElementById(
      `companion-${i}-field`
    )

    const input = document.getElementById(
      `companion-${i}`
    )

    if (!field || !input) continue

    const visible = attends && i <= quantity

    field.hidden = !visible
    input.required = visible
    input.disabled = !visible

    if (!visible) {
      input.value = ''
    }
  }

  if (guestTotal) {
    guestTotal.textContent = attends
      ? String(quantity + 1)
      : '0'
  }

  if (!submitButton.disabled) {
    submitLabel.textContent = attends
      ? 'Confirmar mi asistencia'
      : 'Enviar mis buenos deseos'
  }
}

function showError(message) {
  if (!feedback) return

  feedback.textContent = message
  feedback.classList.add('error')
}

async function sendRSVP(payload) {
  const response = await fetch(RSVP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const result = await response.json().catch(() => null)

  if (!response.ok || result?.ok !== true) {
    throw new Error(
      result?.error || 'No se pudo registrar la respuesta.'
    )
  }

  return result
}

if (form && quantitySelect && companionFields) {
  createCompanionFields()
  updateForm()

  form.querySelectorAll(
    'input[name="asistencia"]'
  ).forEach(input => {
    input.addEventListener('change', updateForm)
  })

  quantitySelect.addEventListener('change', updateForm)

  form.addEventListener('submit', async event => {
    event.preventDefault()

    if (submitButton.disabled || !form.reportValidity()) {
      return
    }

    const attends = selectedAttendance() === 'si'
    const quantity = companionQuantity()

    const companions = []

    if (attends) {
      for (let i = 1; i <= quantity; i++) {
        const name = document.getElementById(
          `companion-${i}`
        ).value.trim()

        if (!name) {
          showError(
            'Escribe los nombres de todos tus acompañantes.'
          )
          return
        }

        companions.push(name)
      }
    }

    const payload = {
      nombre: document.getElementById(
        'guest-name'
      ).value.trim(),

      telefono: document.getElementById(
        'guest-phone'
      )?.value.trim() || '',

      asistencia: attends ? 'si' : 'no',

      acompanantes: companions,

      mensaje: document.getElementById(
        'guest-message'
      )?.value.trim() || ''
    }

    submitButton.disabled = true
    submitLabel.textContent = 'Guardando confirmación...'

    feedback.textContent = ''
    feedback.classList.remove('error')

    try {
      const result = await sendRSVP(payload)

      const paper = document.querySelector('.rsvp-paper')
      if (paper) paper.hidden = true

      const success = document.getElementById('rsvp-success')
      const title = document.getElementById('success-title')
      const message = document.getElementById('success-message')

      const total = attends ? companions.length + 1 : 0

      title.textContent = attends
        ? '¡Te esperamos con mucha ilusión!'
        : '¡Gracias por tus buenos deseos!'

      message.textContent = attends
        ? `Hemos recibido tu confirmación para ${total} persona(s). Tu folio es ${result.folio}.`
        : `Hemos recibido tu respuesta. Tu folio es ${result.folio}. Muchas gracias por tus buenos deseos.`

      success.hidden = false
      success.focus()
      success.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })

    } catch (error) {
      console.error('Error RSVP:', error)

      showError(
        'No pudimos confirmar tu registro. Comprueba si ya fue recibido antes de intentar nuevamente.'
      )

      submitButton.disabled = false
      updateForm()
    }
  })
}
