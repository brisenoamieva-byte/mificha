/**
 * Centroides aproximados (lat, lng) por estado de México.
 * Suficiente para mapa de calor agregado; no es geocoding oficial.
 */
export const MEXICO_STATE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  Aguascalientes: { lat: 21.8853, lng: -102.2916 },
  "Baja California": { lat: 30.8406, lng: -115.2838 },
  "Baja California Sur": { lat: 26.0444, lng: -111.6661 },
  Campeche: { lat: 19.8301, lng: -90.5349 },
  Chiapas: { lat: 16.7569, lng: -93.1292 },
  Chihuahua: { lat: 28.633, lng: -106.0691 },
  "Ciudad de México": { lat: 19.4326, lng: -99.1332 },
  Coahuila: { lat: 27.0587, lng: -101.7068 },
  Colima: { lat: 19.2452, lng: -103.7241 },
  Durango: { lat: 24.0277, lng: -104.6532 },
  "Estado de México": { lat: 19.4969, lng: -99.7233 },
  Guanajuato: { lat: 21.019, lng: -101.2574 },
  Guerrero: { lat: 17.4392, lng: -99.5451 },
  Hidalgo: { lat: 20.0911, lng: -98.7624 },
  Jalisco: { lat: 20.6595, lng: -103.3494 },
  Michoacán: { lat: 19.5665, lng: -101.7068 },
  Morelos: { lat: 18.6813, lng: -99.1013 },
  Nayarit: { lat: 21.7514, lng: -104.8455 },
  "Nuevo León": { lat: 25.5922, lng: -99.9962 },
  Oaxaca: { lat: 17.0732, lng: -96.7266 },
  Puebla: { lat: 19.0414, lng: -98.2063 },
  Querétaro: { lat: 20.5888, lng: -100.3899 },
  "Quintana Roo": { lat: 19.1817, lng: -88.4791 },
  "San Luis Potosí": { lat: 22.1565, lng: -100.9855 },
  Sinaloa: { lat: 25.1721, lng: -107.4795 },
  Sonora: { lat: 29.2972, lng: -110.3309 },
  Tabasco: { lat: 17.8409, lng: -92.6189 },
  Tamaulipas: { lat: 24.2669, lng: -98.8363 },
  Tlaxcala: { lat: 19.3182, lng: -98.2375 },
  Veracruz: { lat: 19.1738, lng: -96.1342 },
  Yucatán: { lat: 20.7099, lng: -89.0943 },
  Zacatecas: { lat: 22.7709, lng: -102.5832 },
};

/** Municipios frecuentes en MiFicha / Bajío (coords aproximadas). */
export const MEXICO_CITY_POINTS: Record<string, { lat: number; lng: number }> = {
  Querétaro: { lat: 20.5888, lng: -100.3899 },
  "Santiago de Querétaro": { lat: 20.5888, lng: -100.3899 },
  Corregidora: { lat: 20.5409, lng: -100.3865 },
  "El Marqués": { lat: 20.6903, lng: -100.2606 },
  "San Juan del Río": { lat: 20.3889, lng: -99.995 },
  Cortazar: { lat: 20.4833, lng: -100.9667 },
  Celaya: { lat: 20.528, lng: -100.812 },
  Irapuato: { lat: 20.6767, lng: -101.3563 },
  León: { lat: 21.125, lng: -101.686 },
  Salamanca: { lat: 20.5694, lng: -101.2 },
  Silao: { lat: 20.9439, lng: -101.427 },
  "San Miguel de Allende": { lat: 20.9144, lng: -100.7452 },
  Guadalajara: { lat: 20.6597, lng: -103.3496 },
  Zapopan: { lat: 20.7211, lng: -103.3918 },
  "Ciudad de México": { lat: 19.4326, lng: -99.1332 },
  Monterrey: { lat: 25.6866, lng: -100.3161 },
  Puebla: { lat: 19.0414, lng: -98.2063 },
  Toluca: { lat: 19.2826, lng: -99.6557 },
  Morelia: { lat: 19.7008, lng: -101.1844 },
  "San Luis Potosí": { lat: 22.1565, lng: -100.9855 },
  Aguascalientes: { lat: 21.8853, lng: -102.2916 },
  Pachuca: { lat: 20.1011, lng: -98.7591 },
  Cancún: { lat: 21.1619, lng: -86.8515 },
  Mérida: { lat: 20.9674, lng: -89.5926 },
  Veracruz: { lat: 19.1738, lng: -96.1342 },
  Tampico: { lat: 22.2331, lng: -97.8611 },
  Chihuahua: { lat: 28.6353, lng: -106.0889 },
  Tijuana: { lat: 32.5149, lng: -117.0382 },
  Mexicali: { lat: 32.6245, lng: -115.4523 },
  Hermosillo: { lat: 29.0729, lng: -110.9559 },
  Culiacán: { lat: 24.8091, lng: -107.394 },
  Torreón: { lat: 25.5428, lng: -103.4068 },
  Saltillo: { lat: 25.4383, lng: -100.9737 },
  Durango: { lat: 24.0277, lng: -104.6532 },
  Oaxaca: { lat: 17.0732, lng: -96.7266 },
  Tuxtla: { lat: 16.751, lng: -93.116 },
  "Tuxtla Gutiérrez": { lat: 16.751, lng: -93.116 },
  Villahermosa: { lat: 17.9892, lng: -92.9475 },
  Cuernavaca: { lat: 18.9242, lng: -99.2216 },
  "Ciudad Juárez": { lat: 31.6904, lng: -106.4245 },
};

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const CITY_BY_NORM = new Map(
  Object.entries(MEXICO_CITY_POINTS).map(([name, point]) => [
    normalizeKey(name),
    { name, ...point },
  ]),
);

const STATE_BY_NORM = new Map(
  Object.entries(MEXICO_STATE_CENTROIDS).map(([name, point]) => [
    normalizeKey(name),
    { name, ...point },
  ]),
);

export function resolveStateCentroid(state: string | null | undefined) {
  if (!state?.trim()) return null;
  return STATE_BY_NORM.get(normalizeKey(state)) ?? null;
}

export function resolveCityPoint(
  city: string | null | undefined,
  state?: string | null,
) {
  if (!city?.trim()) return null;
  const direct = CITY_BY_NORM.get(normalizeKey(city));
  if (direct) return direct;
  // Fallback: centroide del estado con jitter estable por nombre de ciudad.
  const statePoint = resolveStateCentroid(state);
  if (!statePoint) return null;
  const hash = [...normalizeKey(city)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.12 + (hash % 7) * 0.02;
  return {
    name: city.trim(),
    lat: statePoint.lat + Math.sin(angle) * radius,
    lng: statePoint.lng + Math.cos(angle) * radius,
  };
}
