'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()

  const footerLinks = {
    product: [
      { name: t('footer.links.features'), href: '/features' },
      { name: t('footer.links.pricing'), href: '/pricing' },
      { name: t('footer.links.api'), href: '/api' },
      { name: t('footer.links.integrations'), href: '/integrations' },
    ],
    company: [
      { name: t('footer.links.about'), href: '/about' },
      { name: t('footer.links.blog'), href: '/blog' },
      { name: t('footer.links.careers'), href: '/careers' },
      { name: t('footer.links.press'), href: '/press' },
    ],
    support: [
      { name: t('footer.links.help'), href: '/help' },
      { name: t('footer.links.contact'), href: '/contact' },
      { name: t('footer.links.status'), href: '/status' },
      { name: t('footer.links.community'), href: '/community' },
    ],
    legal: [
      { name: t('footer.links.legal'), href: '/legal' },
      { name: t('footer.links.privacy'), href: '/privacy' },
      { name: t('footer.links.terms'), href: '/terms' },
      { name: t('footer.links.cookies'), href: '/cookies' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 items-start">
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

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.sections.product')}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
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
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} MieteNow. {t('footer.copyright')}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
