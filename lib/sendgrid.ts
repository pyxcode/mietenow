import sgMail from '@sendgrid/mail'

// Configuration SendGrid
if (process.env.APIKEYSENDGRID) {
  sgMail.setApiKey(process.env.APIKEYSENDGRID)
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(emailData: EmailData) {
  try {
    if (!process.env.APIKEYSENDGRID) {
      console.error('SendGrid API key not configured')
      return { success: false, error: 'SendGrid not configured' }
    }

    const msg = {
      to: emailData.to,
      from: 'louan@example.com', // Email temporaire pour les tests
      subject: emailData.subject,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
      html: emailData.html,
    }

    await sgMail.send(msg)
    console.log('Email sent successfully to:', emailData.to)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Template pour les alertes d'appartements
export function generateAlertEmailHTML(listings: any[], userPreferences: any) {
  const { address, radius } = userPreferences
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelles annonces trouvées - MieteNow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #00BFA6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .listing { background: white; margin: 15px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #00BFA6; }
        .price { font-size: 18px; font-weight: bold; color: #00BFA6; }
        .address { color: #666; margin: 5px 0; }
        .details { font-size: 14px; color: #888; }
        .btn { display: inline-block; background: #00BFA6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Nouvelles annonces trouvées !</h1>
          <p>Nous avons trouvé ${listings.length} nouvelle(s) annonce(s) correspondant à vos critères</p>
        </div>
        
        <div class="content">
          <p>Bonjour,</p>
          <p>Nous avons trouvé de nouvelles annonces qui correspondent à vos critères de recherche${address ? ` près de ${address} (rayon: ${radius}km)` : ''}.</p>
          
          ${listings.map(listing => `
            <div class="listing">
              <div class="price">${listing.price}€/mois</div>
              <div class="address">📍 ${listing.address || 'Adresse non disponible'}</div>
              <div class="details">
                ${listing.surface ? `📐 ${listing.surface}m²` : ''} 
                ${listing.bedrooms ? `🛏️ ${listing.bedrooms} chambre(s)` : ''}
                ${listing.furnishing ? `🪑 ${listing.furnishing}` : ''}
              </div>
              <a href="${listing.url}" class="btn">Voir l'annonce</a>
              <a href="https://mietenow.com/search" class="btn">Voir sur MieteNow</a>
            </div>
          `).join('')}
          
          <p>Ces annonces sont disponibles sur notre plateforme. Connectez-vous pour voir plus de détails et postuler.</p>
          
          <a href="https://mietenow.com/search" class="btn">Voir toutes les annonces</a>
        </div>
        
        <div class="footer">
          <p>MieteNow - Votre assistant pour trouver un logement à Berlin</p>
          <p>Pour désactiver ces alertes, connectez-vous à votre compte MieteNow</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template pour les utilisateurs non payants
export function generateUnpaidUserEmailHTML(listings: any[], userPreferences: any) {
  const { address, radius } = userPreferences
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appartements trouvés pour vous - MieteNow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #00BFA6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .listing { background: white; margin: 15px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #00BFA6; }
        .price { font-size: 18px; font-weight: bold; color: #00BFA6; }
        .address { color: #666; margin: 5px 0; }
        .details { font-size: 14px; color: #888; }
        .btn { display: inline-block; background: #00BFA6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .cta { background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Appartements trouvés pour vous !</h1>
          <p>Nous avons trouvé ${listings.length} appartement(s)${address ? ` près de ${address}` : ''}</p>
        </div>
        
        <div class="content">
          <p>Bonjour,</p>
          <p>Nous avons trouvé des appartements qui pourraient vous intéresser${address ? ` près de ${address} (rayon: ${radius}km)` : ''}.</p>
          
          ${listings.slice(0, 3).map(listing => `
            <div class="listing">
              <div class="price">${listing.price}€/mois</div>
              <div class="address">📍 ${listing.address || 'Adresse non disponible'}</div>
              <div class="details">
                ${listing.surface ? `📐 ${listing.surface}m²` : ''} 
                ${listing.bedrooms ? `🛏️ ${listing.bedrooms} chambre(s)` : ''}
                ${listing.furnishing ? `🪑 ${listing.furnishing}` : ''}
              </div>
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
