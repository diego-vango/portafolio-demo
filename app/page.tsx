import React from 'react'
import { Camera, Film, Layers } from 'lucide-react'
import PortfolioGrid, { PortfolioItem } from '../components/PortfolioGrid'

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/pub?output=csv";

// Sanitizador universal de URLs (remueve corchetes, comillas y formatos Markdown)
const cleanUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.replace(/^[\[\(\s"']+|[\]\)\s"']+$/g, '').trim();
  const mdMatch = cleaned.match(/\((https?:\/\/[^\)]+)\)/);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1];
  }
  return cleaned;
};

// Sanitizador de cadenas de texto
const cleanStringValue = (val: string): string => {
  if (!val) return '';
  let s = val.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }
  s = s.replace(/""/g, '"');
  return s.trim();
};

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
      // Ignorar
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length <= 1) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQ = false;
    let idx = 0;
    while (idx < line.length) {
      const char = line[idx];
      if (char === '"') {
        if (inQ && idx + 1 < line.length && line[idx + 1] === '"') {
          current += '"';
          idx++;
        } else {
          inQ = !inQ;
        }
      } else if (char === ',' && !inQ) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
      idx++;
    }
    result.push(current);
    return result;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map(h => cleanStringValue(h).toLowerCase());

  const items: PortfolioItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, idx) => {
      row[header] = cleanStringValue(values[idx] || '');
    });

    // Capturamos cualquier valor sobrante por columnas sin nombre (Unnamed)
    const extraValues = values.slice(headers.length).map(v => cleanStringValue(v)).filter(Boolean);

    const title = row['title'] || row['título'] || row['titulo'] || row['nombre'] || '';
    if (!title) continue;

    const category = row['category'] || row['categoría'] || row['categoria'] || row['rubro'] || '';
    const description = row['description'] || row['descripción'] || row['descripcion'] || row['resumen'] || '';
    
    let image = cleanUrl(row['image'] || row['imagen'] || row['foto'] || row['portada'] || '');
    let videoUrl = cleanUrl(row['videourl'] || row['video url'] || row['video'] || row['link'] || '');

    let date = row['date'] || row['fecha'] || '';
    let location = row['location'] || row['ubicación'] || row['ubicacion'] || row['lugar'] || '';
    let rawGallery = row['gallery'] || row['galería'] || row['galeria'] || row['fotos'] || '';
    let rawHighlights = row['highlights'] || row['destacados'] || row['tags'] || '';

    // INTELECTA DE AUTOCORRECCIÓN: Si videoUrl no vino en su columna, búscalo en date/location/highlights
    const allFields = [date, location, rawHighlights, rawGallery, ...extraValues];
    for (const field of allFields) {
      if (field && (field.includes('youtube.com') || field.includes('vimeo.com') || field.includes('youtu.be'))) {
        const foundUrl = cleanUrl(field);
        if (foundUrl.startsWith('http')) {
          videoUrl = foundUrl;
          if (field === date) date = '';
          if (field === location) location = '';
          if (field === rawHighlights) rawHighlights = '';
        }
      }
    }

    // INTELECTA DE AUTOCORRECCIÓN: Si la galeria vino descalzada en date/location
    for (const field of [date, location]) {
      if (field && (field.includes('unsplash.com') || field.includes('.jpg') || field.includes('.png') || field.includes(','))) {
        if (!rawGallery) rawGallery = field;
        if (field === date) date = '';
        if (field === location) location = '';
      }
    }

    // Reubicar date / location si se desplazaron a extraValues
    if (!date && location && !location.startsWith('http')) {
      // date está bien en location
    } else if (!date && extraValues.length > 0) {
      date = extraValues.find(v => !v.startsWith('http')) || date;
    }

    if (!location && extraValues.length > 0) {
      location = extraValues.find(v => !v.startsWith('http') && v !== date) || location;
    }

    if (!rawHighlights && extraValues.length > 0) {
      rawHighlights = extraValues.filter(v => !v.startsWith('http') && v !== date && v !== location).join('; ');
    }

    const gallery = rawGallery
      ? rawGallery.split(/[,;]/).map(u => cleanUrl(u)).filter(u => u.startsWith('http'))
      : [];

    const highlights = rawHighlights
      ? rawHighlights.split(';').map(h => cleanStringValue(h)).filter(Boolean)
      : [];

    items.push({
      id: `sheet-${i}-${encodeURIComponent(title.slice(0, 10))}`,
      title,
      category,
      description,
      image: image.startsWith('http') ? image : 'https://images.unsplash.com/photo-1460881680858-30d872d5b530?q=80&w=1200&auto=format&fit=crop',
      gallery: gallery.length > 0 ? gallery : (image.startsWith('http') ? [image] : []),
      videoUrl,
      date,
      location,
      highlights
    });
  }

  return items;
}

async function getPortfolioData(): Promise<PortfolioItem[]> {
  try {
    let sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL || DEFAULT_SHEET_URL;
    sheetUrl = cleanUrl(sheetUrl);
    
    if (!sheetUrl || !sheetUrl.startsWith('http')) {
      sheetUrl = DEFAULT_SHEET_URL;
    }

    const response = await fetch(sheetUrl, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: { 'Accept': 'text/csv' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const text = await response.text();
    const parsed = parseCSV(text);

    return parsed.length > 0 ? parsed : [];
  } catch (error) {
    console.error('Error fetching/parsing CSV:', error);
    try {
      const fallbackRes = await fetch(DEFAULT_SHEET_URL, { cache: 'no-store' });
      if (fallbackRes.ok) {
        const text = await fallbackRes.text();
        return parseCSV(text);
      }
    } catch (e) {
      console.error('Fallback fetch error:', e);
    }
    return [];
  }
}

export default async function HomePage() {
  const items = await getPortfolioData();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      
      {/* HEADER MINIMALISTA */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-sans font-black text-xl uppercase tracking-[0.25em]">
              TRINO <span className="text-zinc-600 font-serif italic text-sm tracking-normal ml-1">Estudio</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            <span>Santiago, CL</span>
            <span className="hidden sm:inline-block text-zinc-700">•</span>
            <span className="hidden sm:inline-block">Est. 2026</span>
          </div>
        </div>
      </header>

      {/* HERO CON VIDEO CINEMATOGRÁFICO DE FONDO GARANTIZADO */}
      <section className="relative overflow-hidden border-b border-zinc-900/60 min-h-[65vh] flex flex-col justify-center py-24 md:py-32">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-40 scale-105 transform"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-20">
          <h1 className="font-sans font-black text-5xl md:text-8xl uppercase tracking-tighter leading-[0.85] text-white">
            TRINO<br />
            <span className="text-zinc-300 font-serif italic text-4xl md:text-6xl tracking-tight block mt-4 lowercase font-medium">Música, Teatro & Cultura</span>
          </h1>

          <p className="text-zinc-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans font-light">
            Dirección artística, curatoría de contenidos y producción ejecutiva. Creamos y promovemos experiencias culturales de primer nivel con un enfoque estético impecable.
          </p>

          <div className="flex items-center justify-center gap-6 pt-6 text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Camera className="w-4.5 h-4.5 stroke-[1.2]" />
              Dirección de Arte
            </span>
            <span className="text-zinc-600">|</span>
            <span className="flex items-center gap-2">
              <Film className="w-4.5 h-4.5 stroke-[1.2]" />
              Producción de Escena
            </span>
            <span className="text-zinc-600">|</span>
            <span className="flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 stroke-[1.2]" />
              Curatoría Cultural
            </span>
          </div>
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <main className="max-w-7xl mx-auto px-6 py-24 relative z-20 bg-black">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-16 pb-6 border-b border-zinc-900/60">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Colección Seleccionada</span>
            <h2 className="font-serif italic text-3xl text-white mt-2 font-normal">Obras & Producciones</h2>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            {items.length} {items.length === 1 ? 'PROYECTO' : 'PROYECTOS'}
          </div>
        </div>

        {items.length > 0 ? (
          <PortfolioGrid items={items} />
        ) : (
          <div className="text-center py-20 text-zinc-500 font-mono text-sm uppercase">Cargando proyectos en cartelera...</div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-24 text-center border-t border-zinc-900/60 bg-black relative z-20">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">© 2026 TRINO. TODOS LOS DERECHOS RESERVADOS.</p>
          <p className="text-[9px] font-sans text-zinc-700 uppercase tracking-widest font-light">SANTIAGO • VALPARAÍSO • DIRECCIÓN ARTÍSTICA</p>
        </div>
      </footer>
    </div>
  )
}
