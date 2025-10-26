'use client'

import React from 'react'
import VideoPlayer from './VideoPlayer'
import { useTranslation } from '@/hooks/useTranslation'

interface VideoSectionProps {
  className?: string
}

export default function VideoSection({
  className = ""
}: VideoSectionProps) {
  const { language } = useTranslation()

  // URLs de la vidéo et miniature depuis Cloudinary
  const videoUrl = "https://res.cloudinary.com/doxeoyj0e/video/upload/v1761511114/mietenow/videos/commercial-video.mov"
  const thumbnailUrl = "https://res.cloudinary.com/doxeoyj0e/image/upload/v1761511661/mietenow/images/vignette.png"

  return (
    <section className={`py-16 ${className}`}>
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <VideoPlayer
            videoUrl={videoUrl}
            thumbnailUrl={thumbnailUrl}
            title={language === 'de' ? 'mietenow Demo' : 'mietenow Demo'}
            className="mx-auto"
          />
        </div>
      </div>
    </section>
  )
}
