'use client'

import React, { useState, useRef } from 'react'
import { Play, Pause } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl: string
  title?: string
  className?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
}

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  title = "Video",
  className = "",
  autoplay = false,
  muted = false,
  controls = true
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showThumbnail, setShowThumbnail] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
      setShowThumbnail(false)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowThumbnail(true)
  }

  const handleVideoClick = () => {
    if (isPlaying) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Container vidéo - Plus large */}
      <div className="relative w-full aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-2xl">
        {/* Vidéo */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={thumbnailUrl}
          onClick={handleVideoClick}
          onEnded={handleVideoEnd}
          muted={muted}
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>

        {/* Overlay avec miniature et bouton play */}
        {showThumbnail && (
          <div 
            className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer transition-all duration-300 group-hover:bg-black/30"
            onClick={handlePlay}
          >
            {/* Image de miniature */}
            <div className="absolute inset-0">
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Bouton Play */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-3xl">
                <Play className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Titre optionnel */}
            {title && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h3 className="text-white text-lg font-semibold drop-shadow-lg">
                  {title}
                </h3>
              </div>
            )}
          </div>
        )}

        {/* Contrôles personnalisés */}
        {controls && !showThumbnail && (
          <div className="absolute bottom-4 left-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              
              <div className="flex-1 mx-4">
                <div className="w-full bg-white/30 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{
                      width: videoRef.current 
                        ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>

              <span className="text-white text-sm">
                {videoRef.current && videoRef.current.duration
                  ? `${Math.floor(videoRef.current.currentTime)}:${Math.floor(videoRef.current.currentTime % 60).toString().padStart(2, '0')} / ${Math.floor(videoRef.current.duration)}:${Math.floor(videoRef.current.duration % 60).toString().padStart(2, '0')}`
                  : '0:00 / 0:00'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
