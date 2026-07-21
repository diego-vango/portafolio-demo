import React from 'react'
import { Camera, Film, Layers } from 'lucide-react'
import PortfolioGrid, { PortfolioItem } from '../components/PortfolioGrid'

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/pub?output=csv";

// Helper super robusto para limpiar URLs, quitando paréntesis y corchetes Markdown
const cleanUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.replace(/^[\[\(]+|[\]\)]+$/g, '').trim(); // Quita [ ] ( ) de los extremos
  cleaned = cleaned.replace(/^"|"$/g, '').trim(); // Quita comillas
  // Si la celda de google sheets exportó un markdown de link: [https...](https...)
  const mdMatch = cleaned.match(/\((https?:\/\/[^\)]+)\)/);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1];
  }
  return cleaned;
};

// Parser robusto usando Regex en lugar de loops manuales frágiles
function parseCSV(csvText: string): PortfolioItem[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  const items: PortfolioItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Regex magico que parte por comas pero ignora las que están dentro de comillas
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      let val = values[idx] || '';
      val = val.replace(/^"|"$/g, '').trim(); // Limpia comillas perimetrales
      row[header] = val;
    });

    const title = row['title'] || '';
    if (!title) continue; // Si no hay titulo, descarta fila (evita columnas vacias o arrastres)

    const category = row['category'] || '';
    const description = row['description'] || '';
    const image = cleanUrl(row['image'] || '');
    const videoUrl = cleanUrl(row['videourl'] || '');
    const date = row['date'] || '';
    const location = row['location'] || '';

    const rawGallery = row['gallery'] || '';
    const gallery = rawGallery
      ? rawGallery.split(',').map(u => cleanUrl(u)).filter(u => u.startsWith('http'))
      : [];

    const rawHighlights = row['highlights'] || '';
    const highlights = rawHighlights
      ? rawHighlights.split(';').map(h => h.trim()).filter(Boolean)
      : [];

    items.push({
      id: `sheet-${i}-${title.replace(/\s+/g, '-').slice(0, 10).toLowerCase()}`,
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
    const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL || DEFAULT_SHEET_URL;
    const response = await fetch(sheetUrl, {
      cache: 'no-store', // Elimina la cache para que se actualice en vivo
      next: { revalidate: 0 },
      headers: { 'Accept': 'text/csv' }
    });
    
    if (!response.ok) throw new Error('Error de conexión');

    const text = await response.text();
    const parsed = parseCSV(text);
    return parsed.length > 0 ? parsed : [];
  } catch (error) {
    console.error('Error procesando CSV:', error);
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

      {/* HERO CINEMATOGRÁFICO CORREGIDO */}
      <section className="relative overflow-hidden border-b border-zinc-900/60 min-h-[65vh] flex flex-col justify-center py-24 md:py-32">
        {/* Capa de Video (Fondo real) */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-4k-12240-large.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Capa de Oscurecimiento (Para legibilidad) */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {/* Contenido (Textos flotando arriba) */}
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-20">
          <h1 className="font-sans font-black text-5xl md:text-8xl uppercase tracking-tighter leading-[0.85] text-white">
            TRINO<br />
            <span className="text-zinc-300 font-serif italic text-4xl md:text-6xl tracking-tight block mt-4 lowercase font-medium">Música, Teatro & Cultura</span>
          </h1>

          <p className="text-zinc-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans font-light text-shadow-sm">
            Dirección artística, curatoría de contenidos y producción ejecutiva. Creamos y promovemos experiencias culturales de primer nivel con un enfoque estético impecable.
          </p>

          <div className="flex items-center justify-center gap-6 pt-6 text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Camera className="w-4.5 h-4.5 stroke-[1.2]" />
              Dirección de Arte
            </span>
            <span className="text-zinc-500">|</span>
            <span className="flex items-center gap-2">
              <Film className="w-4.5 h-4.5 stroke-[1.2]" />
              Producción de Escena
            </span>
            <span className="text-zinc-500">|</span>
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
            {items.length} {items.length === 1 ? 'PROYECTO EXPENDIDO' : 'PROYECTOS EXPENDIDOS'}
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
