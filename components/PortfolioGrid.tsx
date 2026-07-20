'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Play, X, ExternalLink, Film, Camera, MapPin, Calendar } from 'lucide-react'

export interface PortfolioItem {
  id: string
  title: string
  category?: string
  description: string
  image: string
  videoUrl?: string
  date?: string
  location?: string
}

interface PortfolioGridProps {
  items: PortfolioItem[]
}

// Helper to check if string is a direct video link
const isDirectVideo = (url: string) => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

// Helper to convert YouTube/Vimeo URLs into embed links
const getEmbedUrl = (url: string) => {
  if (!url) return null

  // YouTube
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const ytMatch = url.match(ytRegex)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  }

  return null
}

export default function PortfolioGrid({ items }: PortfolioGridProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  const handlePlayVideo = (item: PortfolioItem) => {
    if (item.videoUrl) {
      setActiveVideo(item.videoUrl)
      setActiveItem(item)
    }
  }

  const closeLightbox = () => {
    setActiveVideo(null)
    setActiveItem(null)
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-24 border border-zinc-800/60 bg-zinc-950/40 rounded-none p-12 max-w-xl mx-auto" id="no-items-card">
        <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-4 stroke-1" id="no-items-icon" />
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider" id="no-items-title">No hay elementos en el portafolio</p>
        <p className="text-zinc-500 text-xs mt-2" id="no-items-desc">
          Agrega algunos ítems en tu hoja de cálculo de Google Sheets para verlos reflejados aquí.
        </p>
      </div>
    )
  }

  // Parse embed elements
  const embedUrl = activeVideo ? getEmbedUrl(activeVideo) : null
  const directVideoUrl = activeVideo && isDirectVideo(activeVideo) ? activeVideo : null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolio-items-grid">
        {items.map((item, index) => {
          const hasVideo = !!item.videoUrl
          const isDummyUrl = item.image && (
            item.image.includes('enlace-de-tu-foto.com') ||
            item.image.includes('example.com') ||
            item.image.includes('tu-foto.com') ||
            item.image.includes('tufoto.cl')
          )
          const isBroken = brokenImages[item.id] || isDummyUrl
          const imageUrl = isBroken ? `https://picsum.photos/seed/${item.id}/800/600` : (item.image || '')

          return (
            <motion.div
              key={item.id}
              id={`portfolio-item-${item.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col bg-zinc-900 border border-zinc-800/60 rounded-none overflow-hidden hover:border-zinc-500 transition-colors duration-500"
            >
              {/* Media Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950" id={`media-container-${item.id}`}>
                {imageUrl ? (
                  <Image
                    id={`media-img-${item.id}`}
                    src={imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setBrokenImages(prev => ({ ...prev, [item.id]: true }))
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900" id={`fallback-media-${item.id}`}>
                    <Camera className="w-8 h-8 stroke-1" />
                  </div>
                )}

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" id={`hover-overlay-${item.id}`}>
                  {hasVideo ? (
                    <button
                      id={`play-btn-${item.id}`}
                      onClick={() => handlePlayVideo(item)}
                      className="w-14 h-14 bg-white text-black hover:bg-neutral-200 transition-colors rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300 cursor-pointer"
                      title="Reproducir Video"
                    >
                      <Play className="w-6 h-6 fill-current text-black translate-x-0.5" />
                    </button>
                  ) : (
                    <div className="w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white" id={`photo-indicator-${item.id}`}>
                      <Camera className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Video/Category Indicator Tag */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2" id={`tags-container-${item.id}`}>
                  {item.category && (
                    <span className="bg-white/90 text-black text-[8px] font-mono font-bold tracking-widest uppercase px-2 py-1 backdrop-blur-sm" id={`category-tag-${item.id}`}>
                      {item.category}
                    </span>
                  )}
                  {hasVideo && (
                    <span className="bg-black/85 border border-white/10 text-[8px] font-mono text-zinc-200 tracking-widest uppercase px-2 py-1 flex items-center gap-1.5 backdrop-blur-sm" id={`video-tag-${item.id}`}>
                      <Film className="w-3 h-3 text-zinc-400" />
                      Video
                    </span>
                  )}
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6 flex-1 flex flex-col justify-between" id={`content-container-${item.id}`}>
                <div>
                  <h3 className="font-display font-black text-lg text-white group-hover:text-zinc-200 transition-colors leading-tight uppercase tracking-tight" id={`title-${item.id}`}>
                    {item.title}
                  </h3>
                  
                  {/* Location & Date */}
                  {(item.location || item.date) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] font-mono text-zinc-500" id={`meta-container-${item.id}`}>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-600" />
                          {item.location}
                        </span>
                      )}
                      {item.location && item.date && <span>•</span>}
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          {item.date}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-sans line-clamp-3" id={`desc-${item.id}`}>
                    {item.description}
                  </p>
                </div>

                {/* Footer Controls inside card */}
                {hasVideo && (
                  <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between" id={`card-footer-${item.id}`}>
                    <button
                      id={`play-action-${item.id}`}
                      onClick={() => handlePlayVideo(item)}
                      className="text-[10px] font-mono text-zinc-300 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current text-current" />
                      Reproducir Reel
                    </button>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider" id={`footer-brand-${item.id}`}>
                      Interactive Show
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            id="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              id="lightbox-close-btn"
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-50 w-12 h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-none border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar reproductor"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Box Container */}
            <motion.div
              id="lightbox-container"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-5xl aspect-video bg-zinc-950 border border-zinc-800/80 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {embedUrl ? (
                <iframe
                  id="lightbox-iframe"
                  src={embedUrl}
                  title={activeItem?.title || 'Reproductor de Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-none"
                />
              ) : directVideoUrl ? (
                <video
                  id="lightbox-video"
                  src={directVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-8 text-center" id="lightbox-fallback">
                  <Film className="w-12 h-12 text-zinc-600 mb-4 stroke-1 animate-pulse" />
                  <p className="text-sm font-mono tracking-widest uppercase text-white mb-2">Video Link Detectado</p>
                  <p className="text-zinc-400 text-xs max-w-sm leading-relaxed mb-6">
                    Este video no puede embeberse directamente. Te invitamos a visitarlo de forma externa.
                  </p>
                  <a
                    id="lightbox-external-link"
                    href={activeVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black text-xs font-mono font-bold tracking-widest px-6 py-3 uppercase hover:bg-zinc-200 transition-colors"
                  >
                    Ver en nueva pestaña <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Video Overlay Info */}
              {activeItem && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 pt-16 flex justify-between items-end pointer-events-none" id="lightbox-overlay-info">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">Ahora Reproduciendo</p>
                    <h4 className="text-base font-display font-black text-white uppercase tracking-tight">
                      {activeItem.title}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline" id="lightbox-tag-info">
                    Interactive Lightbox v1.1
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
