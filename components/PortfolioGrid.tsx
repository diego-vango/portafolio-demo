'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Play, X, MapPin, Calendar, ArrowLeft, ArrowRight, Video, ImageIcon, Sparkles, Camera } from 'lucide-react'

export interface PortfolioItem {
  id: string
  title: string
  category?: string
  description: string
  image: string
  gallery?: string[]
  videoUrl?: string
  date?: string
  location?: string
  highlights?: string[]
}

interface PortfolioGridProps {
  items: PortfolioItem[]
}

// Helpers for video detection and embedding
const isDirectVideo = (url: string) => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

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

const getFallbackImage = (category?: string, id?: string) => {
  const cat = category?.toLowerCase() || '';
  const seed = id ? encodeURIComponent(id) : 'trino';
  if (cat.includes('teatro')) {
    return `https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop`;
  }
  if (cat.includes('música') || cat.includes('musica')) {
    return `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop`;
  }
  return `https://images.unsplash.com/photo-1460881680858-30d872d5b530?q=80&w=1200&auto=format&fit=crop`;
}

export default function PortfolioGrid({ items }: PortfolioGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [modalMediaTab, setModalMediaTab] = useState<'video' | 'photos'>('video')
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  // Disable page scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedItem])

  // Category list extraction
  const categories = ['todos', ...Array.from(new Set(items.map(item => item.category?.trim()).filter(Boolean)))] as string[]

  // Filter items
  const filteredItems = selectedCategory === 'todos'
    ? items
    : items.filter(item => item.category?.trim().toLowerCase() === selectedCategory.toLowerCase())

  const handleOpenItem = (item: PortfolioItem) => {
    setCurrentImageIndex(0)
    setModalMediaTab(item.videoUrl ? 'video' : 'photos')
    setSelectedItem(item)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  // Next / Prev Gallery Navigation
  const handlePrevImage = (galleryList: string[]) => {
    setCurrentImageIndex(prev => (prev === 0 ? galleryList.length - 1 : prev - 1))
  }

  const handleNextImage = (galleryList: string[]) => {
    setCurrentImageIndex(prev => (prev === galleryList.length - 1 ? 0 : prev + 1))
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-32 border border-zinc-900 bg-zinc-950/40 max-w-xl mx-auto" id="no-items-card">
        <Camera className="w-12 h-12 text-zinc-700 mx-auto mb-6 stroke-[1]" id="no-items-icon" />
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest" id="no-items-title">Ninguna obra registrada</p>
        <p className="text-zinc-600 text-xs mt-3 leading-relaxed max-w-xs mx-auto" id="no-items-desc">
          El catálogo se encuentra temporalmente vacío. Por favor verifique más tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      
      {/* MINIMALIST CATEGORIES MENU */}
      <div className="flex justify-center" id="categories-menu-container">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-b border-zinc-900 pb-4 w-full max-w-4xl">
          {categories.map(cat => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative py-2 text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                  isActive ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                id={`category-btn-${cat}`}
              >
                {cat}
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* PORTFOLIO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolio-items-grid">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const hasVideo = !!item.videoUrl
            const isDummyUrl = item.image && (
              item.image.includes('enlace-de-tu-foto.com') ||
              item.image.includes('example.com') ||
              item.image.includes('tu-foto.com') ||
              item.image.includes('tufoto.cl')
            )
            const isBroken = brokenImages[item.id] || isDummyUrl
            const imageUrl = isBroken ? getFallbackImage(item.category, item.id) : (item.image || '')

            return (
              <motion.div
                layout
                key={item.id}
                id={`portfolio-item-${item.id}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col bg-[#050505] border border-zinc-900/80 overflow-hidden hover:border-zinc-700 transition-all duration-500 cursor-pointer"
                onClick={() => handleOpenItem(item)}
              >
                {/* Media Aspect Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black" id={`media-container-${item.id}`}>
                  {imageUrl ? (
                    <Image
                      id={`media-img-${item.id}`}
                      src={imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setBrokenImages(prev => ({ ...prev, [item.id]: true }))
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-zinc-950" id={`fallback-media-${item.id}`}>
                      <Camera className="w-8 h-8 stroke-[1]" />
                    </div>
                  )}

                  {/* Aesthetic Cinematic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />

                  {/* Dark Elegant Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" id={`hover-overlay-${item.id}`}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-none flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all duration-500">
                      {hasVideo ? <Play className="w-5 h-5 fill-current text-white translate-x-0.5" /> : <Sparkles className="w-5 h-5 text-white" />}
                    </div>
                  </div>

                  {/* Category & Media Tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2" id={`tags-container-${item.id}`}>
                    {item.category && (
                      <span className="bg-white text-black text-[9px] font-mono font-bold tracking-[0.15em] uppercase px-2 py-1" id={`category-tag-${item.id}`}>
                        {item.category}
                      </span>
                    )}
                    {hasVideo && (
                      <span className="bg-black/80 border border-zinc-800 text-[8px] font-mono text-zinc-300 tracking-[0.15em] uppercase px-2.5 py-1 flex items-center gap-1.5" id={`video-tag-${item.id}`}>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        Film
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between border-t border-zinc-900/60" id={`content-container-${item.id}`}>
                  <div className="space-y-3">
                    <h3 className="font-sans font-bold text-lg text-white leading-tight uppercase tracking-tight" id={`title-${item.id}`}>
                      {item.title}
                    </h3>
                    
                    {/* Meta info */}
                    {(item.location || item.date) && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest" id={`meta-container-${item.id}`}>
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

                    <p className="text-zinc-400 text-xs leading-relaxed font-light font-sans line-clamp-3" id={`desc-${item.id}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Card Bottom Indicator */}
                  <div className="mt-6 pt-4 border-t border-zinc-900/80 flex items-center justify-between" id={`card-footer-${item.id}`}>
                    <span className="text-[10px] font-mono text-zinc-300 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                      Ver Exposición →
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider" id={`footer-brand-${item.id}`}>
                      {item.category || 'EXHIBIT'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* DETAILED LUXURY LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedItem && (() => {
          const hasVideo = !!selectedItem.videoUrl
          const galleryList = selectedItem.gallery && selectedItem.gallery.length > 0 
            ? selectedItem.gallery 
            : [selectedItem.image]

          // Check for dummy or broken URLs in gallery
          const cleanGallery = galleryList.map((img, i) => {
            const isDummy = img && (
              img.includes('enlace-de-tu-foto.com') ||
              img.includes('example.com') ||
              img.includes('tu-foto.com') ||
              img.includes('tufoto.cl')
            )
            return isDummy ? getFallbackImage(selectedItem.category, `${selectedItem.id}-${i}`) : img
          })

          const activeEmbedUrl = selectedItem.videoUrl ? getEmbedUrl(selectedItem.videoUrl) : null
          const activeDirectVideoUrl = selectedItem.videoUrl && isDirectVideo(selectedItem.videoUrl) ? selectedItem.videoUrl : null

          return (
            <motion.div
              id="lightbox-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-xl overflow-y-auto"
              onClick={handleCloseModal}
            >
              {/* Close Button */}
              <button
                id="lightbox-close-btn"
                onClick={handleCloseModal}
                className="absolute top-6 right-6 z-50 w-12 h-12 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar exhibición"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Exhibition Box Container */}
              <motion.div
                id="lightbox-container"
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="w-full max-w-6xl bg-[#030303] border border-zinc-800/80 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col lg:flex-row my-auto max-h-[90vh] lg:max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Media Left Section (Carousel or Video Player) */}
                <div className="w-full lg:w-3/5 bg-black relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-900 min-h-[300px] lg:min-h-[500px]">
                  
                  {/* Media Navigation Tabs if both exist */}
                  {hasVideo && cleanGallery.length > 0 && (
                    <div className="absolute top-4 left-4 z-20 flex gap-1 bg-black/60 border border-zinc-900 p-1 backdrop-blur-md">
                      <button
                        onClick={() => setModalMediaTab('video')}
                        className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer ${
                          modalMediaTab === 'video' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Video className="w-3 h-3" />
                        Video
                      </button>
                      <button
                        onClick={() => setModalMediaTab('photos')}
                        className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer ${
                          modalMediaTab === 'photos' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" />
                        Galería ({cleanGallery.length})
                      </button>
                    </div>
                  )}

                  {/* ACTIVE MEDIA RENDERING */}
                  <div className="flex-1 w-full h-full relative flex items-center justify-center">
                    {modalMediaTab === 'video' && hasVideo ? (
                      // VIDEO VIEW
                      <div className="w-full h-full aspect-video flex items-center justify-center">
                        {activeEmbedUrl ? (
                          <iframe
                            id="lightbox-iframe"
                            src={activeEmbedUrl}
                            title={selectedItem.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full border-none"
                          />
                        ) : activeDirectVideoUrl ? (
                          <video
                            id="lightbox-video"
                            src={activeDirectVideoUrl}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center" id="lightbox-fallback">
                            <Play className="w-12 h-12 text-zinc-700 mb-4 stroke-1 animate-pulse" />
                            <p className="text-xs font-mono tracking-widest uppercase text-white mb-2">Video Link Detectado</p>
                            <a
                              id="lightbox-external-link"
                              href={selectedItem.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-white text-black text-[10px] font-mono font-bold tracking-widest px-5 py-2.5 uppercase hover:bg-zinc-200 transition-colors"
                            >
                              Ver externamente <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      // CAROUSEL VIEW
                      <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full h-full"
                          >
                            <Image
                              src={cleanGallery[currentImageIndex] || getFallbackImage(selectedItem.category, selectedItem.id)}
                              alt={`${selectedItem.title} gallery ${currentImageIndex}`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 60vw"
                              className="object-contain p-2"
                              referrerPolicy="no-referrer"
                            />
                          </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        {cleanGallery.length > 1 && (
                          <>
                            <button
                              onClick={() => handlePrevImage(cleanGallery)}
                              className="absolute left-4 z-20 w-10 h-10 bg-black/60 border border-zinc-900 text-white flex items-center justify-center hover:bg-black hover:border-zinc-700 cursor-pointer"
                              aria-label="Imagen anterior"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleNextImage(cleanGallery)}
                              className="absolute right-4 z-20 w-10 h-10 bg-black/60 border border-zinc-900 text-white flex items-center justify-center hover:bg-black hover:border-zinc-700 cursor-pointer"
                              aria-label="Siguiente imagen"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Indicator Pill */}
                        <div className="absolute bottom-4 right-4 z-20 bg-black/70 px-3 py-1.5 border border-zinc-900 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                          {currentImageIndex + 1} / {cleanGallery.length}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip (only for gallery view if more than 1 image) */}
                  {modalMediaTab === 'photos' && cleanGallery.length > 1 && (
                    <div className="bg-[#050505] border-t border-zinc-900 p-3 flex gap-2 overflow-x-auto select-none scrollbar-none justify-center">
                      {cleanGallery.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`relative w-14 h-10 overflow-hidden border transition-all duration-300 ${
                            currentImageIndex === i ? 'border-white opacity-100 scale-105' : 'border-zinc-900 opacity-40 hover:opacity-80'
                          }`}
                        >
                          <Image
                            src={img || getFallbackImage(selectedItem.category, selectedItem.id)}
                            alt={`thumb ${i}`}
                            fill
                            sizes="100px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                </div>

                {/* Details Right Section */}
                <div className="w-full lg:w-2/5 p-8 lg:p-10 overflow-y-auto flex flex-col justify-between bg-[#070707] space-y-8 max-h-[50vh] lg:max-h-full">
                  
                  {/* Text Details */}
                  <div className="space-y-6">
                    
                    {/* Header meta */}
                    <div className="space-y-2">
                      {selectedItem.category && (
                        <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-zinc-500 uppercase block">
                          {selectedItem.category}
                        </span>
                      )}
                      <h4 className="text-2xl font-serif italic text-white leading-tight font-medium">
                        {selectedItem.title}
                      </h4>
                    </div>

                    {/* Meta location & date */}
                    {(selectedItem.location || selectedItem.date) && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-zinc-400 uppercase tracking-widest pb-4 border-b border-zinc-900">
                        {selectedItem.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4.5 h-4.5 text-zinc-600" />
                            {selectedItem.location}
                          </span>
                        )}
                        {selectedItem.location && selectedItem.date && <span className="text-zinc-800">•</span>}
                        {selectedItem.date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4.5 h-4.5 text-zinc-600" />
                            {selectedItem.date}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Resumen del Proyecto</span>
                      <p className="text-zinc-300 text-sm leading-relaxed font-sans font-light">
                        {selectedItem.description}
                      </p>
                    </div>

                    {/* Highlights */}
                    {selectedItem.highlights && selectedItem.highlights.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Aspectos Destacados</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.highlights.map((hl, index) => (
                            <span 
                              key={index} 
                              className="text-[9px] font-mono uppercase tracking-widest text-zinc-300 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5"
                            >
                              {hl}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Brand signature at bottom */}
                  <div className="pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                    <span>Trino Selección</span>
                    <span>v3.0</span>
                  </div>

                </div>

              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
