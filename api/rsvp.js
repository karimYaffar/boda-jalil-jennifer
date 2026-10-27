
const APPS_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Método no permitido'
    });
  }

  try {
    if (!APPS_SCRIPT_URL) {
      throw new Error('Falta configurar GOOGLE_SCRIPT_URL');
    }

    const datos = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    if (
      !datos ||
      typeof datos.nombre !== 'string' ||
      !datos.nombre.trim() ||
      !['si', 'no'].includes(datos.asistencia)
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Datos de confirmación inválidos'
      });
    }

    const respuesta = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(datos),
      redirect: 'follow'
    });

    if (!respuesta.ok) {
      throw new Error('Google no respondió correctamente');
    }

    const resultado = await respuesta.json();

    if (resultado.ok !== true) {
      throw new Error(
        resultado.error || 'Google no pudo guardar el invitado'
      );
    }

    return res.status(200).json({
      ok: true,
      folio: resultado.folio,
      total: resultado.total
    });

  } catch (error) {
    console.error('Error RSVP:', error);

    return res.status(502).json({
      ok: false,
      error: 'No se pudo confirmar el registro. Intenta nuevamente.'
    });
  }
}
