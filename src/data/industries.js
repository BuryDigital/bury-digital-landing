// Single source of truth for the demo industry list.
// Used by the client (src/scripts/demo-request.js) to build the dropdown,
// and by the server route (functions/api/demo.js) to validate input.
// value (v) = industry_key the n8n workflow expects; label (l) = shown to user;
// group (g) = heading the option sits under in the dropdown.
// Keys/labels mirror the Supabase `industry_templates` table.

// Group display order in the dropdown.
export const INDUSTRY_GROUPS = [
  'Trades & Construction',
  'Home Services',
  'Outdoor & Garden',
  'Automotive',
  'Health & Wellness',
  'Professional Services',
  'Other',
];

export const INDUSTRIES = [
  // — Trades & Construction —
  { v: 'builders', l: 'Builders', g: 'Trades & Construction' },
  { v: 'concreters', l: 'Concreters', g: 'Trades & Construction' },
  { v: 'electricians', l: 'Electricians', g: 'Trades & Construction' },
  { v: 'fencing', l: 'Fencing', g: 'Trades & Construction' },
  { v: 'garage_doors', l: 'Garage Doors', g: 'Trades & Construction' },
  { v: 'glaziers', l: 'Glaziers', g: 'Trades & Construction' },
  { v: 'hvac', l: 'HVAC / Air Conditioning', g: 'Trades & Construction' },
  { v: 'locksmiths', l: 'Locksmiths', g: 'Trades & Construction' },
  { v: 'painters', l: 'Painters', g: 'Trades & Construction' },
  { v: 'plasterers', l: 'Plasterers', g: 'Trades & Construction' },
  { v: 'plumbers', l: 'Plumbers', g: 'Trades & Construction' },
  { v: 'roofing', l: 'Roofing', g: 'Trades & Construction' },
  { v: 'tilers', l: 'Tilers', g: 'Trades & Construction' },

  // — Home Services —
  { v: 'carpet_cleaning', l: 'Carpet Cleaning', g: 'Home Services' },
  { v: 'cleaning', l: 'Cleaning Services', g: 'Home Services' },
  { v: 'pest_control', l: 'Pest Control', g: 'Home Services' },
  { v: 'removalists', l: 'Removalists', g: 'Home Services' },
  { v: 'rubbish_removal', l: 'Rubbish Removal', g: 'Home Services' },
  { v: 'skip_bins', l: 'Skip Bins', g: 'Home Services' },

  // — Outdoor & Garden —
  { v: 'landscapers', l: 'Landscapers', g: 'Outdoor & Garden' },
  { v: 'pool_services', l: 'Pool Services', g: 'Outdoor & Garden' },
  { v: 'tree_loppers', l: 'Tree Services', g: 'Outdoor & Garden' },

  // — Automotive —
  { v: 'auto_mechanics', l: 'Auto Mechanics', g: 'Automotive' },
  { v: 'panel_beaters', l: 'Panel Beaters', g: 'Automotive' },
  { v: 'tow_trucks', l: 'Tow Trucks', g: 'Automotive' },

  // — Health & Wellness —
  { v: 'chiropractors', l: 'Chiropractors', g: 'Health & Wellness' },
  { v: 'dentists', l: 'Dentists', g: 'Health & Wellness' },
  { v: 'physios', l: 'Physiotherapists', g: 'Health & Wellness' },
  { v: 'vets', l: 'Veterinarians', g: 'Health & Wellness' },

  // — Professional Services —
  { v: 'accountants', l: 'Accountants', g: 'Professional Services' },
  { v: 'lawyers', l: 'Lawyers / Solicitors', g: 'Professional Services' },
  { v: 'mortgage_brokers', l: 'Mortgage Brokers', g: 'Professional Services' },
  { v: 'photographers', l: 'Photographers', g: 'Professional Services' },
  { v: 'real_estate', l: 'Real Estate', g: 'Professional Services' },

  // — Other —
  { v: 'general', l: 'General / Other', g: 'Other' },
];
