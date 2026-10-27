
import './style.css'
import './confirmacion.css'

// Endpoint de nuestra función en Vercel
const RSVP_ENDPOINT = '/api/rsvp'

const form = document.getElementById('rsvp-form')
const attendingFields = document.getElementById('attending-fields')
const decliningFields = document.getElementById('not-attending-fields')
const guestTotal = document.getElementById('guest-total')
const feedback = document.getElementById('form-feedback')
const submitButton = document.getElementById('submit-rsvp')
const submitLabel = document.getElementById('submit-label')

const companionInputs = [
  document.getElementById('companion-1'),
  document.getElementById('companion-2')
]

const companionContainers = [
  document.getElementById('companion-1-field'),
  document.getElementById('companion-2-field')
]

function selectedValue(name) {
  return form?.querySelector(
    `input[name="${name}"]:checked`
  )?.value
}

function getCompanionQuantity() {
  if (selectedValue('asistencia') !== 'si') return 0

  // Si el formulario no tiene sección de acompañantes,
  // registramos únicamente al invitado principal.
  if (!attendingFields) return 0

  const quantity = Number(
    selectedValue('cantidad_acompanantes') || 0
  )

  if (!Number.isInteger(quantity)) return 0

  return Math.max(0, Math.min(2, quantity))
}

function updateForm() {
  if (!form) return

  const attends = selectedValue('asistencia') === 'si'
  const quantity = getCompanionQuantity()

  if (attendingFields) {
    attendingFields.hidden = !attends
  }

  if (decliningFields) {
    decliningFields.hidden = attends
  }

  companionInputs.forEach((input, index) => {
    const container = companionContainers[index]

    if (!input) return

    const visible = attends && index < quantity

    if (container) {
      container.hidden = !visible
    }

    input.required = visible
    input.disabled = !visible

    if (!visible) {
      input.value = ''
    }
  })

  if (guestTotal) {
    guestTotal.textContent = attends
      ? String(1 + quantity)
      : '0'
  }

  if (submitLabel && !submitButton?.disabled) {
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

async function enviarConfirmacion(datos) {
  const response = await fetch(RSVP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(datos)
  })

  const result = await response.json().catch(() => null)

  if (!response.ok || result?.ok !== true) {
    throw new Error(
      result?.error || 'No fue posible guardar la respuesta.'
    )
  }

  return result
}

if (form) {
  form.querySelectorAll(
    'input[name="asistencia"], input[name="cantidad_acompanantes"]'
  ).forEach(input => {
    input.addEventListener('change', () => {
      updateForm()

      if (feedback) {
        feedback.textContent = ''
        feedback.classList.remove('error')
      }
    })
  })

  updateForm()

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!form.reportValidity() || submitButton.disabled) {
      return
    }

    const attends = selectedValue('asistencia') === 'si'
    const quantity = getCompanionQuantity()

    const acompanantes = companionInputs
      .slice(0, quantity)
      .map(input => input?.value.trim() || '')

    if (acompanantes.some(nombre => !nombre)) {
      showError('Escribe los nombres de los acompañantes.')
      return
    }

    // Estos nombres coinciden con los esperados por Apps Script
    const payload = {
      nombre: document.getElementById('guest-name').value.trim(),
      telefono: document.getElementById('guest-phone')?.value.trim() || '',
      asistencia: attends ? 'si' : 'no',
      acompanantes: attends ? acompanantes : [],
      mensaje: document.getElementById('guest-message')?.value.trim() || ''
    }

    submitButton.disabled = true
    submitLabel.textContent = 'Guardando confirmación...'

    if (feedback) {
      feedback.textContent = ''
      feedback.classList.remove('error')
    }

    try {
      const resultado = await enviarConfirmacion(payload)

      // Google confirmó el registro
      const paper = document.querySelector('.rsvp-paper')
      if (paper) paper.hidden = true

      const success = document.getElementById('rsvp-success')
      const successTitle = document.getElementById('success-title')
      const successMessage = document.getElementById('success-message')

      const total = attends ? 1 + acompanantes.length : 0

      if (successTitle) {
        successTitle.textContent = attends
          ? '¡Te esperamos con mucha ilusión!'
          : '¡Gracias por tus buenos deseos!'
      }

      if (successMessage) {
        successMessage.textContent = attends
          ? `Hemos recibido tu confirmación para ${total} persona(s). Tu folio es ${resultado.folio}. ¡Gracias por acompañarnos!`
          : `Hemos recibido tu respuesta. Tu folio es ${resultado.folio}. Gracias por tus buenos deseos.`
      }

      if (success) {
        success.hidden = false
        success.focus()
        success.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }

    } catch (error) {
      console.error('Error guardando RSVP:', error)

      showError(
        'No pudimos confirmar el registro. Verifica tu conexión o consulta si tu respuesta ya fue recibida antes de volver a enviarla.'
      )

      submitButton.disabled = false
      updateForm()
    }
  })
}
