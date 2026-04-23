export const seedResearch = {
  c1: {
    surveys: [
      { id: 's1-1', name: 'Post-Class Pulse — March', type: 'Post-Class Pulse', dateSent: '2026-03-15', numSent: 245, numResponses: 142, avgScore: 8.7, keyThemes: 'Teachers praised, parking issues mentioned, more evening classes requested' },
      { id: 's1-2', name: 'Quarterly NPS — Q1 2026', type: 'Quarterly NPS', dateSent: '2026-01-10', numSent: 245, numResponses: 178, avgScore: 9.1, keyThemes: 'Community feel is the top reason for referrals, music playlist upgrades wanted' },
      { id: 's1-3', name: 'Post-Class Pulse — Feb', type: 'Post-Class Pulse', dateSent: '2026-02-12', numSent: 240, numResponses: 130, avgScore: 8.4, keyThemes: 'Sauna wait times flagged, love the new Sunday flow class' },
    ],
    nps: [
      { id: 'n1-1', quarter: 'Q2 2025', score: 54, respondents: 160, promotersPct: 72, passivesPct: 10, detractorsPct: 18, topDetractorReason: 'Limited class variety at peak hours' },
      { id: 'n1-2', quarter: 'Q3 2025', score: 58, respondents: 168, promotersPct: 74, passivesPct: 10, detractorsPct: 16, topDetractorReason: 'App booking experience is clunky' },
      { id: 'n1-3', quarter: 'Q4 2025', score: 62, respondents: 172, promotersPct: 76, passivesPct: 10, detractorsPct: 14, topDetractorReason: 'Parking availability on weekends' },
      { id: 'n1-4', quarter: 'Q1 2026', score: 67, respondents: 178, promotersPct: 79, passivesPct: 9, detractorsPct: 12, topDetractorReason: 'Price increase not communicated clearly' },
    ],
    reviews: [
      { id: 'r1-1', platform: 'Google', avgScore: 4.8, totalReviews: 312, newThisMonth: 14, posThemes: 'Welcoming staff, clean studio, great instructors', negThemes: 'Parking, booking app', actionTaken: 'Parking sign-up sheet introduced, app feedback sent to Mindbody' },
      { id: 'r1-2', platform: 'Facebook', avgScore: 4.7, totalReviews: 88, newThisMonth: 4, posThemes: 'Community events, class variety', negThemes: 'Occasional class cancellations', actionTaken: 'Cancellation policy communicated via email campaign' },
      { id: 'r1-3', platform: 'Yelp', avgScore: 4.6, totalReviews: 54, newThisMonth: 2, posThemes: 'Ambiance, instructors', negThemes: 'Pricing', actionTaken: 'None yet' },
    ],
    competitors: [
      { id: 'comp1-1', name: 'Flow State Yoga', googleReviewAvg: 4.5, estMemberCount: 180, strongestChannel: 'Instagram', theyDoBetter: 'Online classes library', weDoBetter: 'In-studio experience, community events', monthlyNotes: 'Launched a 30-day challenge series in April' },
      { id: 'comp1-2', name: 'Zen Den Studio', googleReviewAvg: 4.3, estMemberCount: 120, strongestChannel: 'Facebook', theyDoBetter: 'Pricing — lower drop-in rate', weDoBetter: 'Instructor quality, class variety', monthlyNotes: 'Still running same content as Q4' },
      { id: 'comp1-3', name: 'The Collective Wellness', googleReviewAvg: 4.6, estMemberCount: 210, strongestChannel: 'TikTok', theyDoBetter: 'Short-form video content', weDoBetter: 'Member retention, loyalty programme', monthlyNotes: 'TikTok hitting 50k views per reel' },
    ],
    responseTime: [
      { id: 'rt1-1', month: 'Jan 2026', avgHours: 3.1 },
      { id: 'rt1-2', month: 'Feb 2026', avgHours: 2.8 },
      { id: 'rt1-3', month: 'Mar 2026', avgHours: 2.4 },
    ],
    findings: [
      { id: 'f1-1', month: 'April 2026', text: 'Bloom continues to lead on NPS, now at 67 — up 13 points since Q2 2025. Member sentiment is strong with community feel cited as the primary referral driver. Key watch area: parking capacity and the Mindbody app UX. Competitors are increasing short-form video output; recommend doubling Reels cadence in May. Response time is trending in the right direction at 2.4hrs average, nearing the 2hr benchmark.' },
    ],
  },
  c2: {
    surveys: [
      { id: 's2-1', name: 'Quarterly NPS — Q1 2026', type: 'Quarterly NPS', dateSent: '2026-01-15', numSent: 180, numResponses: 98, avgScore: 7.4, keyThemes: 'Doctor communication strong, wait times too long, reception desk friendliness improved' },
      { id: 's2-2', name: 'Post-Visit Pulse — Feb', type: 'Post-Class Pulse', dateSent: '2026-02-20', numSent: 180, numResponses: 82, avgScore: 7.1, keyThemes: 'Appointment reminders appreciated, phone hold times frustrating' },
    ],
    nps: [
      { id: 'n2-1', quarter: 'Q3 2025', score: 28, respondents: 90, promotersPct: 52, passivesPct: 24, detractorsPct: 24, topDetractorReason: 'Long wait times at reception' },
      { id: 'n2-2', quarter: 'Q4 2025', score: 34, respondents: 95, promotersPct: 55, passivesPct: 24, detractorsPct: 21, topDetractorReason: 'Difficulty reaching clinic by phone' },
      { id: 'n2-3', quarter: 'Q1 2026', score: 38, respondents: 98, promotersPct: 58, passivesPct: 22, detractorsPct: 20, topDetractorReason: 'Appointment availability — long lead times' },
    ],
    reviews: [
      { id: 'r2-1', platform: 'Google', avgScore: 4.2, totalReviews: 198, newThisMonth: 8, posThemes: 'Knowledgeable doctors, clean facility', negThemes: 'Wait times, phone hold times', actionTaken: 'Online booking promoted to reduce phone volume' },
      { id: 'r2-2', platform: 'Healthgrades', avgScore: 4.4, totalReviews: 67, newThisMonth: 3, posThemes: 'Thorough consultations', negThemes: 'Parking validated only 30 mins', actionTaken: 'Extended parking validation to 1hr' },
    ],
    competitors: [
      { id: 'comp2-1', name: 'Harmony Health Centre', googleReviewAvg: 4.6, estMemberCount: 220, strongestChannel: 'Google My Business', theyDoBetter: 'Online booking experience', weDoBetter: 'Specialist knowledge, patient education content', monthlyNotes: 'Running a spring detox promotion' },
      { id: 'comp2-2', name: 'Vitality Medical Spa', googleReviewAvg: 4.4, estMemberCount: 140, strongestChannel: 'Instagram', theyDoBetter: 'Aesthetic treatments range', weDoBetter: 'Clinical credibility, review volume', monthlyNotes: 'New IV drip therapy launch getting traction' },
    ],
    responseTime: [
      { id: 'rt2-1', month: 'Jan 2026', avgHours: 8.4 },
      { id: 'rt2-2', month: 'Feb 2026', avgHours: 7.8 },
      { id: 'rt2-3', month: 'Mar 2026', avgHours: 7.2 },
    ],
    findings: [
      { id: 'f2-1', month: 'April 2026', text: 'Serene Health NPS has improved to 38 — heading in the right direction but still in the amber zone. Wait times remain the top detractor. The 1-star Google review from March has been addressed with a drafted response (pending approval). Response time is significantly above the 2hr benchmark at 7.2hrs — recommend a same-day social reply process be introduced. Competitor Harmony Health is gaining ground on online booking experience.' },
    ],
  },
  c4: {
    surveys: [
      { id: 's4-1', name: 'Quarterly NPS — Q1 2026', type: 'Quarterly NPS', dateSent: '2026-01-08', numSent: 310, numResponses: 242, avgScore: 9.4, keyThemes: 'Recipe content top rated, love the app integration, want more meal prep guides' },
      { id: 's4-2', name: 'Post-Programme Pulse', type: 'Post-Class Pulse', dateSent: '2026-03-01', numSent: 310, numResponses: 198, avgScore: 9.2, keyThemes: 'Accountability structure praised, coaching calls are the highlight, more video content wanted' },
      { id: 's4-3', name: 'Ad Hoc — Product Launch', type: 'Ad Hoc', dateSent: '2026-04-05', numSent: 310, numResponses: 175, avgScore: 8.9, keyThemes: 'New supplement line well received, pricing slightly high, packaging loved' },
    ],
    nps: [
      { id: 'n4-1', quarter: 'Q2 2025', score: 61, respondents: 220, promotersPct: 77, passivesPct: 7, detractorsPct: 16, topDetractorReason: 'Content frequency could be higher' },
      { id: 'n4-2', quarter: 'Q3 2025', score: 68, respondents: 228, promotersPct: 80, passivesPct: 8, detractorsPct: 12, topDetractorReason: 'More personalised meal plans needed' },
      { id: 'n4-3', quarter: 'Q4 2025', score: 72, respondents: 235, promotersPct: 82, passivesPct: 8, detractorsPct: 10, topDetractorReason: 'App loading speed' },
      { id: 'n4-4', quarter: 'Q1 2026', score: 76, respondents: 242, promotersPct: 84, passivesPct: 8, detractorsPct: 8, topDetractorReason: 'Supplement pricing' },
    ],
    reviews: [
      { id: 'r4-1', platform: 'Google', avgScore: 4.9, totalReviews: 445, newThisMonth: 22, posThemes: 'Transformational results, supportive community, great coaches', negThemes: 'Supplement cost', actionTaken: 'Bundle discount introduced for supplement line' },
      { id: 'r4-2', platform: 'Trustpilot', avgScore: 4.8, totalReviews: 312, newThisMonth: 18, posThemes: 'Life-changing programmes, clear nutrition guidance', negThemes: 'Onboarding could be smoother', actionTaken: 'Onboarding email sequence revamped' },
      { id: 'r4-3', platform: 'Facebook', avgScore: 4.9, totalReviews: 201, newThisMonth: 11, posThemes: 'Community support, inspiration', negThemes: 'None significant', actionTaken: 'N/A' },
    ],
    competitors: [
      { id: 'comp4-1', name: 'NutriPeak Co.', googleReviewAvg: 4.5, estMemberCount: 260, strongestChannel: 'YouTube', theyDoBetter: 'Long-form educational content', weDoBetter: 'Community engagement, NPS score, programme results', monthlyNotes: 'Launched a new 12-week weight loss challenge' },
      { id: 'comp4-2', name: 'Clean Plate Club', googleReviewAvg: 4.4, estMemberCount: 180, strongestChannel: 'Instagram', theyDoBetter: 'Visual food photography', weDoBetter: 'Scientific credibility, coaching depth', monthlyNotes: 'Partnership with a meal kit delivery company announced' },
    ],
    responseTime: [
      { id: 'rt4-1', month: 'Jan 2026', avgHours: 2.1 },
      { id: 'rt4-2', month: 'Feb 2026', avgHours: 1.9 },
      { id: 'rt4-3', month: 'Mar 2026', avgHours: 1.8 },
    ],
    findings: [
      { id: 'f4-1', month: 'April 2026', text: 'Nourish is the top-performing research account with NPS at 76 and climbing every quarter. Review averages across all three platforms exceed 4.8. The new supplement line has landed well despite some price sensitivity. Response time is below the 2hr benchmark — best in portfolio. Key opportunity: expand long-form educational content to compete with NutriPeak on YouTube. Recommend a quarterly video series tied to the 12-week programme.' },
    ],
  },
  c7: {
    surveys: [
      { id: 's7-1', name: 'Quarterly NPS — Q1 2026', type: 'Quarterly NPS', dateSent: '2026-01-20', numSent: 155, numResponses: 104, avgScore: 8.5, keyThemes: 'Infrared sauna launch praised, staff warmth is standout, treatment menu could expand' },
      { id: 's7-2', name: 'Post-Treatment Pulse — Mar', type: 'Post-Class Pulse', dateSent: '2026-03-10', numSent: 155, numResponses: 88, avgScore: 8.2, keyThemes: 'Relaxing atmosphere, appointment ease, pricing feels premium but fair' },
    ],
    nps: [
      { id: 'n7-1', quarter: 'Q3 2025', score: 44, respondents: 95, promotersPct: 62, passivesPct: 20, detractorsPct: 18, topDetractorReason: 'Limited appointment slots' },
      { id: 'n7-2', quarter: 'Q4 2025', score: 52, respondents: 99, promotersPct: 67, passivesPct: 18, detractorsPct: 15, topDetractorReason: 'Treatment menu not updated frequently enough' },
      { id: 'n7-3', quarter: 'Q1 2026', score: 57, respondents: 104, promotersPct: 70, passivesPct: 17, detractorsPct: 13, topDetractorReason: 'Parking in the area' },
    ],
    reviews: [
      { id: 'r7-1', platform: 'Google', avgScore: 4.7, totalReviews: 224, newThisMonth: 10, posThemes: 'Luxurious experience, infrared sauna, expert staff', negThemes: 'Appointment availability, parking', actionTaken: 'Added extra weekend slots, valet option being explored' },
      { id: 'r7-2', platform: 'TripAdvisor', avgScore: 4.8, totalReviews: 78, newThisMonth: 5, posThemes: 'Worth every cent, world-class relaxation', negThemes: 'Could extend operating hours', actionTaken: 'Late Friday sessions trialled' },
    ],
    competitors: [
      { id: 'comp7-1', name: 'Serenity Day Spa', googleReviewAvg: 4.5, estMemberCount: 130, strongestChannel: 'Instagram', theyDoBetter: 'Package deals and promotions', weDoBetter: 'Infrared technology, overall experience quality', monthlyNotes: 'Running a Mother\'s Day bundle campaign' },
      { id: 'comp7-2', name: 'The Urban Retreat', googleReviewAvg: 4.6, estMemberCount: 140, strongestChannel: 'Facebook', theyDoBetter: 'Couples treatments', weDoBetter: 'Solo wellness experience, NPS score', monthlyNotes: 'Expanded to a second location in March' },
    ],
    responseTime: [
      { id: 'rt7-1', month: 'Jan 2026', avgHours: 4.2 },
      { id: 'rt7-2', month: 'Feb 2026', avgHours: 3.9 },
      { id: 'rt7-3', month: 'Mar 2026', avgHours: 3.6 },
    ],
    findings: [
      { id: 'f7-1', month: 'April 2026', text: 'Vita Spa NPS reached 57 in Q1 2026 — approaching the green zone. The infrared sauna launch continues to generate strong review sentiment and referral activity. Appointment availability remains the top friction point; the weekend slot expansion should start showing in Q2 data. Response time at 3.6hrs is improving but above benchmark — focus on morning DM checks. Competitor Urban Retreat\'s second location launch is worth monitoring.' },
    ],
  },
}
