import * as XLSX from 'xlsx';
import type { IntelRecord } from '@/contexts/intel-context';

function parseDMS(grados: any, minutos: any, segundos: any, isLon: boolean): number {
  const g = parseFloat(String(grados ?? 0)) || 0;
  const m = parseFloat(String(minutos ?? 0)) || 0;
  const s = parseFloat(String(segundos ?? 0)) || 0;
  const decimal = g + m / 60 + s / 3600;
  return isLon ? -Math.abs(decimal) : decimal;
}

function parseDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0] ?? '';
  if (typeof val === 'number') {
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) {
        const yr = String(d?.y ?? 2020);
        const mo = String(d?.m ?? 1).padStart(2, '0');
        const dy = String(d?.d ?? 1).padStart(2, '0');
        return `${yr}-${mo}-${dy}`;
      }
    } catch { /* ignore */ }
    return '';
  }
  if (typeof val === 'string') {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0] ?? '';
    return val;
  }
  return '';
}

export function parseExcelFile(buffer: ArrayBuffer): IntelRecord[] {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook?.SheetNames?.[0] ?? '';
  const sheet = workbook?.Sheets?.[sheetName];
  if (!sheet) return [];

  const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) ?? [];
  const rows = jsonData?.slice(1) ?? [];

  const records: IntelRecord[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    const row = rows[i];
    if (!row || (row?.length ?? 0) < 10) continue;

    let lat = parseFloat(String(row[10] ?? 0));
    let lon = parseFloat(String(row[11] ?? 0));

    if (isNaN(lat) || lat === 0) {
      lat = parseDMS(row[4], row[5], row[6], false);
    }
    if (isNaN(lon) || lon === 0) {
      lon = parseDMS(row[7], row[8], row[9], true);
    }

    if (lat === 0 && lon === 0) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

    records.push({
      id: i + 1,
      departamento: String(row[1] ?? '').trim(),
      municipio: String(row[2] ?? '').trim(),
      vereda: String(row[3] ?? '').trim(),
      latGrados: parseFloat(String(row[4] ?? 0)) || 0,
      latMinutos: parseFloat(String(row[5] ?? 0)) || 0,
      latSegundos: parseFloat(String(row[6] ?? 0)) || 0,
      lonGrados: parseFloat(String(row[7] ?? 0)) || 0,
      lonMinutos: parseFloat(String(row[8] ?? 0)) || 0,
      lonSegundos: parseFloat(String(row[9] ?? 0)) || 0,
      latitud: lat,
      longitud: lon,
      fecha: parseDate(row[12]),
      tipologia: String(row[13] ?? '').trim(),
      informacionHecho: String(row[14] ?? '').trim(),
      fenomenoCriminalidad: String(row[15] ?? '').trim(),
      medios: String(row[16] ?? '').trim(),
      genero: String(row[18] ?? '').trim(),
      estructura: String(row[19] ?? '').trim(),
      respuestaAccion: String(row[20] ?? '').trim(),
      accionEnemiga: String(row[21] ?? '').trim(),
      resTipo: String(row[22] ?? '').trim(),
    });
  }

  return records;
}

export function parseCSVFile(text: string): IntelRecord[] {
  const workbook = XLSX.read(text, { type: 'string' });
  const sheetName = workbook?.SheetNames?.[0] ?? '';
  const sheet = workbook?.Sheets?.[sheetName];
  if (!sheet) return [];
  const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) ?? [];
  const rows = jsonData?.slice(1) ?? [];
  const records: IntelRecord[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    const row = rows[i];
    if (!row || (row?.length ?? 0) < 10) continue;
    let lat = parseFloat(String(row[10] ?? 0));
    let lon = parseFloat(String(row[11] ?? 0));
    if (isNaN(lat) || lat === 0) lat = parseDMS(row[4], row[5], row[6], false);
    if (isNaN(lon) || lon === 0) lon = parseDMS(row[7], row[8], row[9], true);
    if (lat === 0 && lon === 0) continue;
    records.push({
      id: i + 1,
      departamento: String(row[1] ?? '').trim(),
      municipio: String(row[2] ?? '').trim(),
      vereda: String(row[3] ?? '').trim(),
      latGrados: parseFloat(String(row[4] ?? 0)) || 0,
      latMinutos: parseFloat(String(row[5] ?? 0)) || 0,
      latSegundos: parseFloat(String(row[6] ?? 0)) || 0,
      lonGrados: parseFloat(String(row[7] ?? 0)) || 0,
      lonMinutos: parseFloat(String(row[8] ?? 0)) || 0,
      lonSegundos: parseFloat(String(row[9] ?? 0)) || 0,
      latitud: lat,
      longitud: lon,
      fecha: parseDate(row[12]),
      tipologia: String(row[13] ?? '').trim(),
      informacionHecho: String(row[14] ?? '').trim(),
      fenomenoCriminalidad: String(row[15] ?? '').trim(),
      medios: String(row[16] ?? '').trim(),
      genero: String(row[18] ?? '').trim(),
      estructura: String(row[19] ?? '').trim(),
      respuestaAccion: String(row[20] ?? '').trim(),
      accionEnemiga: String(row[21] ?? '').trim(),
      resTipo: String(row[22] ?? '').trim(),
    });
  }
  return records;
}
