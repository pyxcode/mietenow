'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()

  const footerLinks = {
    company: [
      { name: t('footer.links.about'), href: '/about' },
      { name: t('footer.links.blog'), href: '/blog' },
    ],
    support: [
      { name: t('footer.links.help'), href: '/help' },
      { name: t('footer.links.contact'), href: '/contact' },
      { name: t('footer.links.community'), href: '/community' },
    ],
    legal: [
      { name: t('footer.links.impressum'), href: '/impressum' },
      { name: t('footer.links.privacy'), href: '/privacy' },
      { name: t('footer.links.terms'), href: '/terms' },
      { name: t('footer.links.cookies'), href: '/cookies' },
    ],
  }


  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <p className="text-gray-300 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <Link href="/" className="flex items-center -mb-6">
              <Image
                src="/Logos/L1.png"
                alt="MieteNow"
                width={120}
                height={30}
                className="h-50 w-auto"
              />
            </Link>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.sections.company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.sections.support')}</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.sections.legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} MieteNow. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
