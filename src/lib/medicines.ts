// src/lib/medicines.ts
export type MedicineSummary = { id: string; name: string; price: string };
export type MedicineSection = { section: string; title: string; content: string };
export type MedicineDetails = { id: string; name: string; price: string; sections: MedicineSection[] };

const SECTION_ORDER = [
  'uses', 'dose', 'how_to_use', 'ingredients', 'description',
  'side_effects', 'when_not_use', 'precautions', 'over_dose',
  'missed_dose', 'drug_interactions', 'food_interaction', 'storage'
];

function cleanContent(text: string): string {
  if (!text) return '';
  let cleaned = text.replace(/Powered by Froala Editor/gi, '').trim();
  cleaned = cleaned.replace(/([.!?])([A-Z])/g, '$1 $2');
  cleaned = cleaned.replace(/(:)([A-Z])/g, '$1 $2');
  return cleaned;
}

function orderSections(sections: MedicineSection[]): MedicineSection[] {
  return [...sections].sort((a, b) => {
    const idxA = SECTION_ORDER.indexOf(a.section.toLowerCase());
    const idxB = SECTION_ORDER.indexOf(b.section.toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });
}

export async function searchMedicines(q: string): Promise<{ results: MedicineSummary[]; total: number }> {
  const res = await fetch(`https://freeapi.pro/api/search?q=${encodeURIComponent(q)}`, {
    headers: { 'User-Agent': 'SehatSathi/1.0' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Upstream failed');
  const data = await res.json();
  return {
    results: data.results || [],
    total: data.count || 0,
  };
}

export async function getMedicineDetails(id: string): Promise<MedicineDetails> {
  const res = await fetch(`https://freeapi.pro/api/details?id=${encodeURIComponent(id)}`, {
    headers: { 'User-Agent': 'SehatSathi/1.0' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Upstream failed');
  const data = await res.json();
  const med = data.medicine;
  const sections: MedicineSection[] = (med.details || []).map((d: any) => ({
    section: d.section || '',
    title: d.title || '',
    content: cleanContent(d.content || ''),
  }));
  
  return {
    id: med.id,
    name: med.name,
    price: med.price,
    sections: orderSections(sections),
  };
}