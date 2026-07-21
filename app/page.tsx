import React from 'react'
import { Camera, Film, Layers } from 'lucide-react'
import PortfolioGrid, { PortfolioItem } from '../components/PortfolioGrid'

export const runtime = 'edge';
export const revalidate = 60; // Cache refresh every 60s

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/pub?output=csv";

// Premium Fallback data showcasing rich gallery images and highlights
const FALLBACK_ITEMS: PortfolioItem[] = [
  {
    id: 'laika-2026',
    title: 'Laika (Obra de Teatro)',
    category: 'Teatro',
    description: 'Producción y booking de la obra para niños en colegios de la Región Metropolitana y Valparaíso. Gestión logística completa y coordinación con establecimientos educacionales.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460881680858-30d872d5b530?q=80&w=1200&auto=format&fit=crop'
    ],
    date: 'Enero 2026',
    location: 'Santiago, Chile',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    highlights: ['Teatro Infantil', 'Gira Escolar', 'Producción de Elenco', 'Escenografía Móvil']
  },
  {
    id: 'cumbia-sur',
    title: 'Gira de Cumbia Sur',
    category: 'Música',
    description: 'Producción ejecutiva de la gira estival de grupos de cumbia destacados. Coordinación de recintos, sistemas de sonido PA, venta de tickets y plan de prensa local.',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop'
    ],
    date: 'Febrero 2026',
    location: 'Sur de Chile',
    videoUrl: '',
    highlights: ['Conciertos Masivos', 'Logística Gira', 'Prensa Local', 'Sonido Line-Array']
  },
  {
    id: 'la-remolienda',
    title: 'La Remolienda (Teatro Clásico)',
    category: 'Teatro',
    description: 'Coordinación y venta corporativa para municipalidades de este clásico del teatro chileno. Adaptación técnica para teatros locales y espacios abiertos comunitarios.',
    image: 'https://images.unsplash.com/photo-1503095391757-11174c636d6d?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1503095391757-11174c636d6d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&auto=format&fit=crop'
    ],
    date: 'Diciembre 2025',
    location: 'Región de O\'Higgins, Chile',
    videoUrl: '',
    highlights: ['Clásico Chileno', 'Funciones Gratuitas', 'Montaje Teatral']
  }
];

function parseCSV(csvText: string): PortfolioItem[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else if (char === '\r' && !inQuotes) {
      // ignore carriage returns
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length <= 1) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map(h => h.toLowerCase().trim());

  const items: PortfolioItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, idx) => {
      if (header) {
        row[header] = values[idx] || '';
      }
    });

    const title = row['title'] || row['título'] || row['titulo'] || '';
    const category = row['category'] || row['categoría'] || row['categoria'] || '';
    const description = row['description'] || row['descripción'] || row['descripcion'] || '';
    const image = row['image'] || row['imagen'] || row['imageurl'] || row['image url'] || '';
    const videoUrl = row['videourl'] || row['video url'] || row['video'] || '';
    const date = row['date'] || row['fecha'] || '';
    const location = row['location'] || row['ubicación'] || row['ubicacion'] || '';

    // Advanced Gallery parse
    const rawGallery = row['gallery'] || row['galería'] || row['galeria'] || row['imagenes'] || row['images'] || '';
    const gallery = rawGallery
      ? rawGallery.split(/[;,]/).map(url => url.trim()).filter(Boolean)
      : [];

    // Advanced Highlights parse
    const rawHighlights = row['highlights'] || row['destacados'] || row['tags'] || '';
    const highlights = rawHighlights
      ? rawHighlights.split(';').map(h => h.trim()).filter(Boolean)
      : [];

    if (title) {
      items.push({
        id: `sheet-${i}-${encodeURIComponent(title.slice(0, 10))}`,
        title,
        category,
        description,
        image: image && image.startsWith('http') ? image : `https://images.unsplash.com/photo-1460881680858-30d872d5b530?q=80&w=1200&auto=format&fit=crop`,
        gallery: gallery.length > 0 ? gallery : (image && image.startsWith('http') ? [image] : []),
        videoUrl,
        date,
        location,
        highlights
      });
    }
  }

  return items;
}

async function getPortfolioData(): Promise<PortfolioItem[]> {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'text/csv',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const text = await response.text();
    const parsed = parseCSV(text);

    if (parsed && parsed.length > 0) {
      return parsed;
    }
    
    return FALLBACK_ITEMS;
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return FALLBACK_ITEMS;
  }
}

export default async function HomePage() {
  const items = await getPortfolioData();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans" id="portfolio-root">
      
      {/* MINIMALIST FIXED HEADER */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900/60" id="main-header">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-4" id="brand-logo-container">
            <span className="font-sans font-black text-xl uppercase tracking-[0.25em]" id="brand-name">
              TRINO <span className="text-zinc-600 font-serif italic text-sm tracking-normal ml-1">Estudio</span>
            </span>
          </div>

          {/* Luxury Label / Timepiece (No technical terms) */}
          <div className="flex items-center gap-6 text-[10px] font-mono tracking-widest text-zinc-500 uppercase" id="header-right-controls">
            <span>Santiago, CL</span>
            <span className="hidden sm:inline-block text-zinc-700">•</span>
            <span className="hidden sm:inline-block">Est. 2026</span>
          </div>

        </div>
      </header>

      {/* CINEMATIC HERO SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-900/60 py-28 md:py-36 flex flex-col justify-center" id="hero-section">
        {/* Cinematic ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black -z-10" />
        
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <h1 className="font-sans font-black text-5xl md:text-8xl uppercase tracking-tighter leading-[0.85] text-white" id="hero-title">
            TRINO<br />
            <span className="text-zinc-500 font-serif italic text-4xl md:text-6xl tracking-tight block mt-4 lowercase font-medium">Música, Teatro & Cultura</span>
          </h1>

          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans font-light" id="hero-desc">
            Dirección artística, curatoría de contenidos y producción ejecutiva. Creamos y promovemos experiencias culturales de primer nivel con un enfoque estético impecable.
          </p>

          {/* Creative Specs Tag */}
          <div className="flex items-center justify-center gap-6 pt-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest" id="specs-bar">
            <span className="flex items-center gap-2">
              <Camera className="w-4.5 h-4.5 stroke-[1.2] text-zinc-400" />
              Dirección de Arte
            </span>
            <span className="text-zinc-800">|</span>
            <span className="flex items-center gap-2">
              <Film className="w-4.5 h-4.5 stroke-[1.2] text-zinc-400" />
              Producción de Escena
            </span>
            <span className="text-zinc-800">|</span>
            <span className="flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 stroke-[1.2] text-zinc-400" />
              Curatoría Cultural
            </span>
          </div>
        </div>
      </section>

      {/* PORTFOLIO GRID SECTION */}
      <main className="max-w-7xl mx-auto px-6 py-24" id="main-content">
        
        {/* Section title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-16 pb-6 border-b border-zinc-900/60" id="section-header">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Colección Seleccionada</span>
            <h2 className="font-serif italic text-3xl text-white mt-2 font-normal">
              Obras & Producciones
            </h2>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider" id="items-counter">
            {items.length} {items.length === 1 ? 'PROYECTO EXPENDIDO' : 'PROYECTOS EXPENDIDOS'}
          </div>
        </div>

        {/* Dynamic Client Portfolio Component with Redesigned Carousel / Lightbox Modal */}
        <PortfolioGrid items={items} />

      </main>

      {/* FOOTER */}
      <footer className="py-24 text-center border-t border-zinc-900/60 bg-black" id="main-footer">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">© 2026 TRINO. TODOS LOS DERECHOS RESERVADOS.</p>
          <p className="text-[9px] font-sans text-zinc-700 uppercase tracking-widest font-light">
            SANTIAGO • VALPARAÍSO • DIRECCIÓN ARTÍSTICA & ACCIÓN CULTURAL
          </p>
        </div>
      </footer>

    </div>
  )
}
