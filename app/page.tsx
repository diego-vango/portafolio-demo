import React from 'react'
import { Camera, Film, ArrowUpRight, Sparkles, ExternalLink, MapPin, Layers, Info } from 'lucide-react'
import PortfolioGrid, { PortfolioItem } from '../components/PortfolioGrid'

export const runtime = 'edge';
export const revalidate = 60; // Cache refresh every 60s

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/pub?output=csv";

// Senior Fallback data for robust UI if fetching fails or sheet is currently empty
const FALLBACK_ITEMS: PortfolioItem[] = [
  {
    id: 'laika-2026',
    title: 'Laika (Obra de Teatro)',
    category: 'Teatro',
    description: 'Producción y booking de la obra para niños en colegios de la Región Metropolitana y Valparaíso. Gestión logística completa y coordinación con establecimientos educacionales.',
    image: 'https://picsum.photos/seed/laika/800/600',
    date: 'Enero 2026',
    location: 'Santiago, Chile',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'cumbia-sur',
    title: 'Gira de Cumbia Sur',
    category: 'Música',
    description: 'Producción ejecutiva de la gira estival de grupos de cumbia destacados. Coordinación de recintos, sistemas de sonido PA, venta de tickets y plan de prensa local.',
    image: 'https://picsum.photos/seed/cumbia/800/600',
    date: 'Febrero 2026',
    location: 'Sur de Chile',
    videoUrl: ''
  },
  {
    id: 'la-remolienda',
    title: 'La Remolienda (Teatro Clásico)',
    category: 'Teatro',
    description: 'Coordinación y venta corporativa para municipalidades de este clásico del teatro chileno. Adaptación técnica para teatros locales y espacios abiertos comunitarios.',
    image: 'https://picsum.photos/seed/remolienda/800/600',
    date: 'Diciembre 2025',
    location: 'Región de O\'Higgins, Chile',
    videoUrl: ''
  }
];

function parseCSV(csvText: string): PortfolioItem[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  // Split content into rows while properly respecting newlines inside quoted values
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

  // Parse a CSV line into separate field values, correctly maintaining quoted commas
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

    // Map according to requested structure: Title, Category, Description, Image, VideoUrl, Date, Location
    const title = row['title'] || row['título'] || row['titulo'] || '';
    const category = row['category'] || row['categoría'] || row['categoria'] || '';
    const description = row['description'] || row['descripción'] || row['descripcion'] || '';
    const image = row['image'] || row['imagen'] || row['imageurl'] || row['image url'] || '';
    const videoUrl = row['videourl'] || row['video url'] || row['video'] || '';
    const date = row['date'] || row['fecha'] || '';
    const location = row['location'] || row['ubicación'] || row['ubicacion'] || '';

    if (title) {
      items.push({
        id: `sheet-${i}-${encodeURIComponent(title.slice(0, 10))}`,
        title,
        category,
        description,
        image: image && image.startsWith('http') ? image : `https://picsum.photos/seed/sheet-${i}/800/600`,
        videoUrl,
        date,
        location
      });
    }
  }

  return items;
}

async function getPortfolioData(): Promise<{ items: PortfolioItem[]; source: string }> {
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
      return { items: parsed, source: 'Google Sheets Live Database' };
    }
    
    return { items: FALLBACK_ITEMS, source: 'Local Cache (CSV vacío)' };
  } catch (error) {
    console.error('Error in Edge runtime fetching CSV from Google Sheets:', error);
    return { items: FALLBACK_ITEMS, source: 'Local Fallback (Error de Conexión)' };
  }
}

export default async function HomePage() {
  const { items, source } = await getPortfolioData();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans" id="portfolio-root">
      
      {/* MINIMALIST FIXED HEADER */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900" id="main-header">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3" id="brand-logo-container">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-mono font-black text-sm" id="brand-avatar">
              T
            </div>
            <span className="font-display font-black text-base uppercase tracking-widest" id="brand-name">
              TRINO<span className="text-zinc-500 font-mono text-[10px] ml-1.5 font-normal">PORTFOLIO v3.0</span>
            </span>
          </div>

          {/* Source indicator pill & External Link */}
          <div className="flex items-center gap-4" id="header-right-controls">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 px-3 py-1.5 uppercase tracking-wider" id="db-source-badge">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {source}
            </span>
            <a 
              href="https://docs.google.com/spreadsheets/d/1e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/edit" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-500 px-4 py-2"
              id="sheet-link-btn"
            >
              Google Sheet <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-900 py-24 md:py-32" id="hero-section">
        {/* Subtle background radial light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black -z-10" />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest" id="intro-badge">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            Integración de Datos Serverless en Tiempo Real
          </div>

          <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-[0.9] text-white" id="hero-title">
            Portafolio de Medios<br />
            <span className="text-zinc-500">Música, Teatro & Cultura</span>
          </h1>

          <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-sans" id="hero-desc">
            Visualizador interactivo de obras y proyectos gestionado 100% desde Google Sheets. Cada actualización en la hoja de cálculo se sincroniza automáticamente a través de Edge Computing sin recargar código en GitHub.
          </p>

          {/* Simple specs list */}
          <div className="flex items-center justify-center gap-6 pt-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest" id="specs-bar">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-zinc-400 stroke-1" />
              Imágenes directas
            </span>
            <span className="text-zinc-800">|</span>
            <span className="flex items-center gap-2">
              <Film className="w-4 h-4 text-zinc-400 stroke-1" />
              Lightbox de Video
            </span>
            <span className="text-zinc-800">|</span>
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400 stroke-1" />
              Edge Engine
            </span>
          </div>
        </div>
      </section>

      {/* MAIN PORTFOLIO GRID */}
      <main className="max-w-7xl mx-auto px-6 py-20" id="main-content">
        
        {/* Section title & stats */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-12 pb-6 border-b border-zinc-900" id="section-header">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Galería Pública</span>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white mt-1">
              Proyectos Sincronizados
            </h2>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider" id="items-counter">
            {items.length} {items.length === 1 ? 'PROYECTO DETECTADO' : 'PROYECTOS DETECTADOS'}
          </div>
        </div>

        {/* Dynamic Client Portfolio Component */}
        <PortfolioGrid items={items} />

      </main>

      {/* GOOGLE SHEETS MANAGEMENT BANNER */}
      <section className="bg-zinc-950 border-t border-b border-zinc-900 py-20" id="management-section">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-none flex items-center justify-center mx-auto text-zinc-300" id="banner-icon-container">
            <Info className="w-5 h-5" />
          </div>
          
          <h3 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-white" id="banner-title">
            ¿Cómo se actualiza este portafolio?
          </h3>
          
          <p className="text-zinc-400 text-xs leading-relaxed font-sans max-w-md mx-auto" id="banner-desc">
            Este sitio web lee directamente un archivo CSV publicado desde Google Sheets. Puedes abrir la planilla compartida, agregar o modificar filas, y la web actualizará el contenido al instante de manera global.
          </p>
          
          <div className="pt-2">
            <a
              href="https://docs.google.com/spreadsheets/d/e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/pub?output=csv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black text-xs font-mono font-bold tracking-widest px-6 py-4 uppercase hover:bg-zinc-200 transition-colors"
              id="raw-csv-btn"
            >
              Ver CSV Origen <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 text-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest border-t border-zinc-900 bg-black" id="main-footer">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p>© 2026 Trino S.A. & PaginasPro.cl. Todos los derechos reservados.</p>
          <p className="text-zinc-800">
            Optimizada para Edge Runtime (Cloudflare Pages compatible)
          </p>
        </div>
      </footer>

    </div>
  )
}
