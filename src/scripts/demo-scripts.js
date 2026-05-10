// SMS threads + lead summaries shown in the interactive demo.
// Each key matches the `data-ind` attribute on the tab button.
export const DEMO_SCRIPTS = {
  realestate: {
    biz: 'Harbourline Properties', name: 'Alex Romano', phone: '0424 100 872', suburb: 'Balmain NSW',
    thread: [
      ['ai', "Hi Alex — Harbourline Properties, sorry we missed your call. How can we help?"],
      ['them', "Thinking about selling our apartment"],
      ['ai', "Got it. Are you after a listing presentation, appraisal, or price check first?"],
      ['them', "Listing presentation. Want to move in spring"],
      ['ai', "Perfect. What suburb, and how many beds?"],
      ['them', "Balmain, 2-bed apartment with water views"],
      ['ai', "Great. We can book one of our directors to come by this week."],
    ],
    summary: [
      ['Intent', 'Listing presentation'], ['Timing', 'Spring 2026', 'hot'],
      ['Suburb', 'Balmain'], ['Property', '2-bed apartment'],
      ['Priority', 'High', 'green'], ['Next step', 'Book listing appt'],
    ],
  },
  dental: {
    biz: 'Bayside Dental', name: 'Jamie Thornton', phone: '0411 882 543', suburb: 'St Kilda',
    thread: [
      ['ai', "Hi Jamie — Bayside Dental, sorry we missed your call. Are you a new or existing patient?"],
      ['them', "New patient. Need a general checkup and clean"],
      ['ai', "Great — do you have private health cover?"],
      ['them', "Yes, with Bupa"],
      ['ai', "Perfect. Are mornings or afternoons better for you?"],
      ['them', "Afternoons, ideally this week or next"],
      ['ai', "Got it. I'll have our reception confirm a time shortly."],
    ],
    summary: [
      ['Intent', 'New patient · checkup & clean'], ['Health fund', 'Bupa', 'green'],
      ['Preferred time', 'Afternoons'], ['Availability', 'This week / next', 'hot'],
      ['Priority', 'High', 'green'], ['Next step', 'Book appointment'],
    ],
  },
  trades: {
    biz: 'Apex Plumbing & Gas', name: 'Marcus Webb', phone: '0432 671 904', suburb: 'Footscray',
    thread: [
      ['ai', "Hi Marcus — Apex Plumbing, sorry we missed your call. What's the job?"],
      ['them', "Got a burst pipe under the kitchen sink. Pretty urgent"],
      ['ai', "On it. What suburb are you in?"],
      ['them', "Footscray"],
      ['ai', "Got it — are you home now, or what's the best time for someone to come?"],
      ['them', "Home all afternoon"],
      ['ai', "Perfect. I'll get a plumber to you within the hour."],
    ],
    summary: [
      ['Intent', 'Burst pipe · urgent repair'], ['Suburb', 'Footscray'],
      ['Availability', 'Home all afternoon', 'hot'], ['Urgency', 'Immediate', 'hot'],
      ['Priority', 'High', 'green'], ['Next step', 'Dispatch technician'],
    ],
  },
  allied: {
    biz: 'Parkside Physio', name: 'Chloe Ngu', phone: '0408 215 763', suburb: 'Richmond',
    thread: [
      ['ai', "Hi Chloe — Parkside Physio, sorry we missed you. Are you an existing patient or new?"],
      ['them', "New patient. Got lower back pain, been going on for a week"],
      ['ai', "Got it. Do you have a referral from your GP, or self-referring?"],
      ['them', "Self-referring, no referral"],
      ['ai', "No problem. Do you have private health cover for physio?"],
      ['them', "Yes, Medibank"],
      ['ai', "Great — I'll have our team book you in for an initial assessment."],
    ],
    summary: [
      ['Intent', 'New patient · lower back pain'], ['Referral', 'Self-referring'],
      ['Health fund', 'Medibank', 'green'], ['Duration', '1 week'],
      ['Priority', 'High', 'green'], ['Next step', 'Book initial assessment'],
    ],
  },
  legal: {
    biz: 'Lander & Co Lawyers', name: 'Dani Osei', phone: '0425 330 617', suburb: 'Melbourne CBD',
    thread: [
      ['ai', "Hi Dani — Lander & Co, sorry we missed your call. What area of law can we help with?"],
      ['them', "Family law. Going through a separation and need advice"],
      ['ai', "Understood. Are you an existing client, or is this your first time contacting us?"],
      ['them', "First time. Things are getting urgent — court date in three weeks"],
      ['ai', "Got it. I'll flag this as urgent and have a solicitor call you back today."],
    ],
    summary: [
      ['Intent', 'Family law · separation'], ['Status', 'New client'],
      ['Urgency', 'Court date in 3 weeks', 'hot'], ['Suburb', 'Melbourne CBD'],
      ['Priority', 'High', 'green'], ['Next step', 'Solicitor callback today'],
    ],
  },
};

// Hue per scenario, used to tint the avatar circle in the summary pane.
export const INDUSTRY_HUES = {
  realestate: 265, dental: 210, trades: 35, allied: 140, legal: 320,
};
