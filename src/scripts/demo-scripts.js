// Real-estate-specific SMS threads + lead summaries shown in the interactive demo.
// Each key matches the `data-ind` attribute on the tab button.
export const DEMO_SCRIPTS = {
  seller: {
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
      ['Est. commission', '$14,400', 'green'], ['Next step', 'Book listing appt'],
    ],
  },
  buyer: {
    biz: 'Harbourline Properties', name: 'Priya Natarajan', phone: '0422 901 377', suburb: 'Bondi',
    thread: [
      ['ai', "Hi Priya — Harbourline Properties, sorry we missed you. Are you buying, selling, or after an appraisal?"],
      ['them', "Buying. Saw the Campbell St listing online"],
      ['ai', "Nice — after an inspection time, or more details on the listing?"],
      ['them', "Want to book an inspection, and I've got finance pre-approved"],
      ['ai', "Great — is a private viewing this Saturday morning OK, or would the open home suit?"],
      ['them', "Private Saturday works. Around 11?"],
      ['ai', "Done. I'll send a confirmation with the address shortly."],
    ],
    summary: [
      ['Intent', 'Buyer · private inspection'], ['Listing', '12 Campbell St'],
      ['Finance', 'Pre-approved', 'green'], ['Suburb', 'Bondi'],
      ['Timing', 'Saturday 11am', 'hot'], ['Next step', 'Confirm inspection'],
    ],
  },
  appraisal: {
    biz: 'Harbourline Properties', name: 'Sarah Chen', phone: '0401 552 089', suburb: 'Coogee',
    thread: [
      ['ai', "Hi Sarah — Harbourline Properties, sorry we missed you. What are you after?"],
      ['them', "Want a free appraisal on my townhouse"],
      ['ai', "Happy to help. What suburb, and roughly when were you thinking of selling?"],
      ['them', "Coogee. Maybe later this year, depends on the price"],
      ['ai', "Got it. How many beds/baths, and any recent updates?"],
      ['them', "3-bed, 2-bath. New kitchen last year"],
      ['ai', "Perfect. I'll book an agent to pop by this week for an on-site appraisal."],
    ],
    summary: [
      ['Intent', 'Market appraisal'], ['Suburb', 'Coogee'],
      ['Property', '3-bed townhouse'], ['Recent updates', 'New kitchen'],
      ['Timing', 'Later 2026', 'hot'], ['Next step', 'On-site appraisal'],
    ],
  },
  openhome: {
    biz: 'Harbourline Properties', name: 'Jane Morley', phone: '0419 552 311', suburb: 'Surry Hills',
    thread: [
      ['ai', "Hi Jane — Harbourline Properties, sorry we missed you. Are you calling about an open home?"],
      ['them', "Yes — the Bourke St apartment this Saturday"],
      ['ai', "It's running 11:30am–12pm. Want me to hold a spot for you?"],
      ['them', "Yes please. Running about 15 mins late"],
      ['ai', "No worries — agent will be onsite til 12:15 for you."],
      ['them', "Also, is the price negotiable?"],
      ['ai', "Best to chat with the agent on the day — I'll flag your interest."],
    ],
    summary: [
      ['Intent', 'Open home attendee'], ['Listing', '14 Bourke St'],
      ['Suburb', 'Surry Hills'], ['Timing', 'Sat 11:45am', 'hot'],
      ['Buyer signal', 'Price question', 'green'], ['Next step', 'Brief agent onsite'],
    ],
  },
  rental: {
    biz: 'Harbourline Properties', name: 'Tom Grady', phone: '0418 664 512', suburb: 'Clovelly',
    thread: [
      ['ai', "Hey Tom — Harbourline Properties, sorry we missed your call. Rental enquiry?"],
      ['them', "Yeah, got an investment property I want to lease out"],
      ['ai', "Great. Is it vacant now, or tenant leaving soon?"],
      ['them', "Tenant out next month"],
      ['ai', "Got it. Any updates planned, or ready to list as-is?"],
      ['them', "Fresh paint, otherwise as-is"],
      ['ai', "Perfect. We'll book a rental appraisal this week."],
    ],
    summary: [
      ['Intent', 'List rental'], ['Suburb', 'Clovelly'],
      ['Property', 'Investment · 2-bed'], ['Available', 'Next month', 'hot'],
      ['Est. mgmt fee', '$2,880 / yr', 'green'], ['Next step', 'Rental appraisal'],
    ],
  },
  listing: {
    biz: 'Harbourline Properties', name: 'Hannah Wu', phone: '0431 008 290', suburb: 'Waverley',
    thread: [
      ['ai', "Hi Hannah — Harbourline Properties, sorry we missed your call. What's going on?"],
      ['them', "We've had two agents out already. Want a third opinion"],
      ['ai', "Happy to help. What have you been quoted, and when do you want to list?"],
      ['them', "$2.1–2.3m range. Ideally on market in six weeks"],
      ['ai', "Got it. Full listing presentation with comparable sales — mornings or afternoons?"],
      ['them', "Wednesday afternoon if possible"],
      ['ai', "Locked in. I'll send the meeting invite and a prep email shortly."],
    ],
    summary: [
      ['Intent', 'Listing presentation'], ['Prior quotes', '$2.1–2.3m'],
      ['Timing', 'On market in 6 wks', 'hot'], ['Suburb', 'Waverley'],
      ['Est. commission', '$44,000', 'green'], ['Booking', 'Wed afternoon'],
    ],
  },
};

// Hue per scenario, used to tint the avatar circle in the summary pane.
export const INDUSTRY_HUES = {
  seller: 265, buyer: 210, appraisal: 170, openhome: 35, rental: 140, listing: 320,
};
