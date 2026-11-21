export const CEBU_PRESETS = [
  { name: 'Cebu Institute of Technology - University (CIT-U)', lat: 10.2945, lng: 123.8811 },
  { name: 'Fuente Osmeña Circle', lat: 10.3103, lng: 123.8935 },
  { name: 'Colon Street (Downtown Cebu)', lat: 10.2966, lng: 123.8995 },
  { name: 'Ayala Center Cebu', lat: 10.3181, lng: 123.9052 },
  { name: 'SM Seaside City Cebu', lat: 10.2816, lng: 123.8816 },
  { name: 'Cebu IT Park', lat: 10.3292, lng: 123.9061 },
  { name: "Magellan's Cross", lat: 10.2937, lng: 123.9021 },
  { name: 'Carbon Public Market', lat: 10.2913, lng: 123.8981 },
  { name: 'Fort San Pedro', lat: 10.2925, lng: 123.9056 },
  { name: 'Basilica Minore del Santo Niño', lat: 10.2942, lng: 123.9022 },
  { name: 'Cebu Provincial Capitol', lat: 10.3168, lng: 123.8906 },
  { name: 'Mactan-Cebu International Airport', lat: 10.3075, lng: 123.9794 },
  { name: 'SM City Cebu (North Reclamation)', lat: 10.3119, lng: 123.9181 },
  { name: 'Temple of Leah (Busay)', lat: 10.3693, lng: 123.8724 },
  { name: 'Tops Lookout (Busay)', lat: 10.3712, lng: 123.8705 },
  { name: 'University of San Carlos - Talamban', lat: 10.3521, lng: 123.9132 },
  { name: 'Cebu South Bus Terminal', lat: 10.2981, lng: 123.8931 },
  { name: 'Plaza Independencia', lat: 10.2932, lng: 123.9045 },
];

export const DEMO_TRIPS = [
  {
    id: 'citu-to-ayala',
    name: 'CIT-U to Ayala Center Cebu (Scenic Detour)',
    origin: { name: 'Cebu Institute of Technology - University (CIT-U)', lat: 10.2945, lng: 123.8811 },
    destination: { name: 'Ayala Center Cebu', lat: 10.3181, lng: 123.9052 },
    mode: 'drive',
  },
  {
    id: 'fuente-to-sm-seaside',
    name: 'Fuente Osmeña to SM Seaside (Extra Kilometers)',
    origin: { name: 'Fuente Osmeña Circle', lat: 10.3103, lng: 123.8935 },
    destination: { name: 'SM Seaside City Cebu', lat: 10.2816, lng: 123.8816 },
    mode: 'drive',
  },
  {
    id: 'colon-to-capitol',
    name: 'Colon Street to Cebu Capitol (Lakaw Mode)',
    origin: { name: 'Colon Street (Downtown Cebu)', lat: 10.2966, lng: 123.8995 },
    destination: { name: 'Cebu Provincial Capitol', lat: 10.3168, lng: 123.8906 },
    mode: 'walk',
  },
];
