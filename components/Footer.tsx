'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t, language } = useTranslation()

  const footerLinks = [
    { name: t('footer.links.about'), href: '/about' },
    { name: t('footer.links.careers'), href: '/careers' },
    { name: t('footer.links.help'), href: '#', onClick: () => { if (typeof window !== 'undefined' && window.$crisp) { window.$crisp.push(['do', 'chat:open']) } } },
    { name: t('footer.links.community'), href: '/community' },
    { name: t('footer.links.blog'), href: '/blog' },
    { name: t('footer.links.privacy'), href: '/privacy' },
    { name: t('footer.links.terms'), href: '/terms' },
    { name: t('footer.links.cookies'), href: '/cookies' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <Image
                src="/Logos/L1.png"
                alt="MieteNow"
                width={56}
                height={14}
                className="h-36 w-auto"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-white mb-6 text-lg">
              {language === 'de' ? 'Links' : 'Links'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {footerLinks.map((link) => (
                link.onClick ? (
                  <button
                    key={link.name}
                    onClick={link.onClick}
                    className="text-gray-300 hover:text-white transition-colors text-sm py-1 text-left"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm py-1"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} MieteNow. {t('footer.copyright')}
            </p>
            <p className="text-gray-500 text-xs">
              {language === 'de' 
                ? 'Mit ❤️ in Berlin gemacht'
                : 'Made with ❤️ in Berlin'
              }
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
