import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQc8AQvB-p3o5582lkJ8VyWAFhkyWYkfzOX5cFie39AQvARJz3eWrbadaon1wSdeT8MBU0QFERBhrhm/pub?output=csv";

// Helper CSV parser inside the API route
function parseCSV(csvText: string) {
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

  const items = [];

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
        id: `sheet-${i}`,
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

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const text = await response.text();
    const items = parseCSV(text);

    return NextResponse.json({
      success: true,
      items: items
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      items: []
    }, { status: 500 });
  }
}
