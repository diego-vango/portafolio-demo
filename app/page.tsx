import React from 'react'
import { Camera, Film, Layers, Sparkles } from 'lucide-react'
import PortfolioGrid, { PortfolioItem } from '../components/PortfolioGrid'

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/pub?output=csv";

// Sanitizador de URLs
const cleanUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.replace(/^[\[\(\s"']+|[\]\)\s"']+$/g, '').trim();
  const mdMatch = cleaned.match(/\((https?:\/\/[^\)]+)\)/);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1];
  }
  return cleaned;
};

// Sanitizador de texto
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
      // Ignorar \r
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
      if (header) {
        row[header] = cleanStringValue(values[idx] || '');
      }
    });

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

    // Autocorrección de campos desplazados
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

    for (const field of [date, location]) {
      if (field && (field.includes('unsplash.com') || field.includes('ibb.co') || field.includes('.jpg') || field.includes('.png') || field.includes(','))) {
        if (!rawGallery) rawGallery = field;
        if (field === date) date = '';
        if (field === location) location = '';
      }
    }

    if (!date && extraValues.length > 0) {
      date = extraValues.find(v => !v.startsWith('http')) || date;
    }

    if (!location && extraValues.length > 0) {
      location = extraValues.find(v => !v.startsWith('http') && v !== date) || location;
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
    console.error('Error fetching CSV:', error);
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
    <div className="w-full min-h-screen bg-black text-white selection:bg-[#C2FF01] selection:text-black font-sans overflow-x-hidden">
      
      {/* HEADER ADAPTABLE CON ACCENT VERDE */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-sans font-black text-xl sm:text-2xl uppercase tracking-[0.2em] text-[#C2FF01]">
              TRINO
            </span>
            <span className="text-zinc-500 font-serif italic text-xs sm:text-sm tracking-normal">
              Estudio
            </span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-mono tracking-widest text-zinc-400 uppercase">
            <span>Santiago, CL</span>
            <span className="text-[#C2FF01]">•</span>
            <span>Est. 2026</span>
          </div>
        </div>
      </header>

      {/* HERO SECTION CON LOGO OFICIAL & ESTÉTICA VERDE ÁCIDO */}
      <section className="relative overflow-hidden border-b border-zinc-900 py-16 sm:py-24 px-4">
        {/* Glow de fondo verdoso sin opacar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-[#C2FF01]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10">
          
          {/* ISOLOGO OFICIAL TRINO CON FALLBACK ROBUSTO */}
          <div className="relative inline-block mx-auto max-w-[240px] sm:max-w-[340px] md:max-w-[400px] px-2">
            <img 
              src="/logo.png" 
              alt="TRINO" 
              className="w-full h-auto object-contain mx-auto filter drop-shadow-[0_0_20px_rgba(194,255,1,0.25)]"
            />
          </div>

          {/* SUBTÍTULO CULTURAL */}
          <h1 className="font-serif italic text-2xl sm:text-4xl md:text-5xl text-zinc-200 font-normal tracking-tight">
            música, teatro & cultura
          </h1>

          {/* DESCRIPCIÓN 100% RESPONSIVE EN MÓVILES */}
          <p className="text-xs sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed font-sans font-light px-2">
            Dirección artística, curatoría de contenidos y producción ejecutiva. Creamos y promovemos experiencias culturales de primer nivel con un enfoque estético impecable.
          </p>

          {/* BADGES RESPONSIVAS (SE ADAPTAN EN LÍNEAS INDEPENDIENTES EN CELULARES) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-4 text-[10px] sm:text-xs font-mono uppercase tracking-wider">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Camera className="w-3.5 h-3.5 text-[#C2FF01]" />
              Dirección de Arte
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Film className="w-3.5 h-3.5 text-[#C2FF01]" />
              Producción de Escena
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-[#C2FF01]" />
              Curatoría Cultural
            </span>
          </div>

        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 bg-black">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-12 pb-6 border-b border-zinc-900">
          <div>
            <span className="text-[10px] font-mono text-[#C2FF01] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Colección Seleccionada
            </span>
            <h2 className="font-serif italic text-2xl sm:text-4xl text-white mt-1 font-normal">
              Obras & Producciones
            </h2>
          </div>
          <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#C2FF01]/10 border border-[#C2FF01]/30 text-[#C2FF01] text-[10px] font-mono tracking-widest uppercase">
            {items.length} {items.length === 1 ? 'PROYECTO' : 'PROYECTOS'}
          </div>
        </div>

        {items.length > 0 ? (
          <PortfolioGrid items={items} />
        ) : (
          <div className="text-center py-20 text-zinc-500 font-mono text-sm uppercase">
            Cargando proyectos en cartelera...
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-16 text-center border-t border-zinc-900 bg-black px-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            © 2026 <span className="text-[#C2FF01]">TRINO</span>. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <p className="text-[9px] font-sans text-zinc-600 uppercase tracking-widest font-light">
            SANTIAGO • VALPARAÍSO • DIRECCIÓN ARTÍSTICA
          </p>
        </div>
      </footer>

    </div>
  )
}
