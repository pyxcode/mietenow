import sgMail from '@sendgrid/mail'

// Configuration SendGrid
if (process.env.APIKEYSENDGRID) {
  sgMail.setApiKey(process.env.APIKEYSENDGRID)
}

export async function sendEmail(emailData) {
  try {
    if (!process.env.APIKEYSENDGRID) {
      console.error('SendGrid API key not configured')
      return { success: false, error: 'SendGrid not configured' }
    }

    // Mode test - simuler l'envoi d'email
    if (process.env.NODE_ENV === 'development' || process.env.SENDGRID_TEST_MODE === 'true') {
      console.log('📧 [TEST MODE] Email simulé envoyé à:', emailData.to)
      console.log('📧 [TEST MODE] Sujet:', emailData.subject)
      console.log('📧 [TEST MODE] Contenu HTML:', emailData.html.substring(0, 100) + '...')
      return { success: true }
    }

    const msg = {
      to: emailData.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'julia@mietenow.iqorbis.com', // Email vérifié
      subject: emailData.subject,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
      html: emailData.html,
    }

    await sgMail.send(msg)
    console.log(`📧 Email envoyé avec succès à: ${emailData.to}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message)
    return { success: false, error: error.message }
  }
}

export function generateAlertEmailHTML(listings) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelles annonces disponibles</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .listing { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 8px; background: #f9f9f9; }
        .listing h3 { color: #667eea; margin-top: 0; }
        .price { font-size: 20px; font-weight: bold; color: #2c3e50; }
        .details { margin: 10px 0; }
        .details span { background: #e8f4f8; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .btn:hover { background: #5a6fd8; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Nouvelles annonces disponibles</h1>
          <p>Nous avons trouvé ${listings.length} nouvelle${listings.length > 1 ? 's' : ''} annonce${listings.length > 1 ? 's' : ''} qui correspond${listings.length > 1 ? 'ent' : ''} à vos critères !</p>
        </div>
        
        <div class="content">
          ${listings.slice(0, 3).map(listing => `
            <div class="listing">
              <h3>${listing.title}</h3>
              <div class="price">${listing.price} €</div>
              <div class="details">
                <span>📍 ${listing.location}</span>
                <span>🏠 ${listing.type}</span>
                <span>🛏️ ${listing.rooms} chambre${listing.rooms > 1 ? 's' : ''}</span>
                ${listing.size ? `<span>📐 ${listing.size} m²</span>` : ''}
                ${listing.furnished !== undefined ? `<span>🪑 ${listing.furnished ? 'Meublé' : 'Non meublé'}</span>` : ''}
              </div>
              <p>${listing.description ? listing.description.substring(0, 150) + '...' : 'Aucune description disponible'}</p>
              <a href="${listing.url_source}" class="btn">Voir l'annonce complète</a>
            </div>
          `).join('')}
          
          ${listings.length > 3 ? `<p><strong>Et ${listings.length - 3} autres appartements...</strong></p>` : ''}
          
          <div class="cta">
            <h3>🚀 Terminez votre recherche !</h3>
            <p>Pour voir tous les appartements et postuler, terminez votre inscription sur MieteNow.</p>
            <a href="https://mietenow.com/rent" class="btn">Terminer ma recherche</a>
          </div>
          
          <p>MieteNow vous aide à trouver le logement parfait à Berlin avec des alertes personnalisées et un accès exclusif aux meilleures annonces.</p>
        </div>
        
        <div class="footer">
          <p>MieteNow - Votre assistant pour trouver un logement à Berlin</p>
          <p>Si vous ne souhaitez plus recevoir ces emails, ignorez simplement ce message.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateUnpaidUserEmailHTML(listings) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelles annonces disponibles</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .listing { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 8px; background: #f9f9f9; }
        .listing h3 { color: #667eea; margin-top: 0; }
        .price { font-size: 20px; font-weight: bold; color: #2c3e50; }
        .details { margin: 10px 0; }
        .details span { background: #e8f4f8; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .btn:hover { background: #5a6fd8; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Nouvelles annonces disponibles</h1>
          <p>Nous avons trouvé ${listings.length} nouvelle${listings.length > 1 ? 's' : ''} annonce${listings.length > 1 ? 's' : ''} qui correspond${listings.length > 1 ? 'ent' : ''} à vos critères !</p>
        </div>
        
        <div class="content">
          ${listings.slice(0, 3).map(listing => `
            <div class="listing">
              <h3>${listing.title}</h3>
              <div class="price">${listing.price} €</div>
              <div class="details">
                <span>📍 ${listing.location}</span>
                <span>🏠 ${listing.type}</span>
                <span>🛏️ ${listing.rooms} chambre${listing.rooms > 1 ? 's' : ''}</span>
                ${listing.size ? `<span>📐 ${listing.size} m²</span>` : ''}
                ${listing.furnished !== undefined ? `<span>🪑 ${listing.furnished ? 'Meublé' : 'Non meublé'}</span>` : ''}
              </div>
              <p>${listing.description ? listing.description.substring(0, 150) + '...' : 'Aucune description disponible'}</p>
              <a href="${listing.url_source}" class="btn">Voir l'annonce complète</a>
            </div>
          `).join('')}
          
          ${listings.length > 3 ? `<p><strong>Et ${listings.length - 3} autres appartements...</strong></p>` : ''}
          
          <div class="cta">
            <h3>🚀 Terminez votre recherche !</h3>
            <p>Pour voir tous les appartements et postuler, terminez votre inscription sur MieteNow.</p>
            <a href="https://mietenow.com/rent" class="btn">Terminer ma recherche</a>
          </div>
          
          <p>MieteNow vous aide à trouver le logement parfait à Berlin avec des alertes personnalisées et un accès exclusif aux meilleures annonces.</p>
        </div>
        
        <div class="footer">
          <p>MieteNow - Votre assistant pour trouver un logement à Berlin</p>
          <p>Si vous ne souhaitez plus recevoir ces emails, ignorez simplement ce message.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
