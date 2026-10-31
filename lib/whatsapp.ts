export async function sendWhatsAppMessage(to: string, message: string) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID

  // If keys are missing, just log a warning so the app doesn't crash
  if (!token || !phoneId) {
    console.warn("WhatsApp API keys missing. Message not sent.")
    return
  }

  // Meta requires phone numbers to be in international format without the '+'
  const cleanNumber = to.replace(/\D/g, '')

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanNumber,
        type: "text",
        text: { body: message }
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error("WhatsApp API Error:", errorData)
    }
  } catch (error) {
    console.error("Failed to send WhatsApp:", error)
  }
}