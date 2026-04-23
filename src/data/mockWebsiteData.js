const mkChecklist = () => [
  { id: 'cl-1', item: 'Page Speed Test', type: 'score', value: '', notes: '', completionDate: '', completed: false },
  { id: 'cl-2', item: 'Mobile Responsiveness', type: 'pass-fail', value: '', notes: '', completionDate: '', completed: false },
  { id: 'cl-3', item: 'Booking Integration', type: 'pass-fail', value: '', notes: '', completionDate: '', completed: false },
  { id: 'cl-4', item: 'Contact Form', type: 'pass-fail', value: '', notes: '', completionDate: '', completed: false },
  { id: 'cl-5', item: 'SSL Certificate Active', type: 'yes-no', value: '', notes: '', completionDate: '', completed: false },
  { id: 'cl-6', item: 'Google Analytics Connected', type: 'yes-no', value: '', notes: '', completionDate: '', completed: false },
  { id: 'cl-7', item: 'SEO Basics Complete', type: 'yes-no', value: '', notes: '', completionDate: '', completed: false },
]

export const seedWebsite = {
  c1: {
    project: { id: 'wp-c1', name: 'Bloom Wellness — Website Redesign 2026', startDate: '2026-01-15', targetLaunchDate: '2026-04-30', actualLaunchDate: '', status: 'In Progress' },
    phases: [
      { id: 'ph-c1-1', name: 'Discovery', status: 'Complete', startDate: '2026-01-15', completionDate: '2026-01-31', tasks: [
        { id: 't-c1-1-1', name: 'Stakeholder brief call', owner: 'Sonia', due: '2026-01-17', status: 'Complete', notes: '' },
        { id: 't-c1-1-2', name: 'Competitor site audit', owner: 'Jehangir', due: '2026-01-24', status: 'Complete', notes: 'Benchmarked 5 competitor sites' },
        { id: 't-c1-1-3', name: 'SEO keyword research', owner: 'Sonia', due: '2026-01-31', status: 'Complete', notes: '42 target keywords identified' },
      ]},
      { id: 'ph-c1-2', name: 'Design', status: 'Complete', startDate: '2026-02-01', completionDate: '2026-02-28', tasks: [
        { id: 't-c1-2-1', name: 'Wireframes — all pages', owner: 'Jehangir', due: '2026-02-10', status: 'Complete', notes: '' },
        { id: 't-c1-2-2', name: 'Hi-fi mockups', owner: 'Jehangir', due: '2026-02-21', status: 'Complete', notes: 'Client approved 3rd revision' },
        { id: 't-c1-2-3', name: 'Design sign-off call', owner: 'Sonia', due: '2026-02-28', status: 'Complete', notes: '' },
      ]},
      { id: 'ph-c1-3', name: 'Development', status: 'In Progress', startDate: '2026-03-01', completionDate: '', tasks: [
        { id: 't-c1-3-1', name: 'Homepage build', owner: 'Jehangir', due: '2026-03-14', status: 'Complete', notes: '' },
        { id: 't-c1-3-2', name: 'Class schedule integration', owner: 'Jehangir', due: '2026-03-28', status: 'Complete', notes: 'Mindbody iframe embedded' },
        { id: 't-c1-3-3', name: 'Inner pages build', owner: 'Jehangir', due: '2026-04-10', status: 'In Progress', notes: 'About, Instructors, Timetable done. Pricing page remaining.' },
        { id: 't-c1-3-4', name: 'Mobile optimisation', owner: 'Jehangir', due: '2026-04-14', status: 'Not Started', notes: '' },
        { id: 't-c1-3-5', name: 'Speed optimisation', owner: 'Jehangir', due: '2026-04-17', status: 'Not Started', notes: '' },
      ]},
      { id: 'ph-c1-4', name: 'Client Review', status: 'Not Started', startDate: '', completionDate: '', tasks: [
        { id: 't-c1-4-1', name: 'Staging link sent to client', owner: 'Sonia', due: '2026-04-20', status: 'Not Started', notes: '' },
        { id: 't-c1-4-2', name: 'Client feedback call', owner: 'Sonia', due: '2026-04-24', status: 'Not Started', notes: '' },
        { id: 't-c1-4-3', name: 'Amends applied', owner: 'Jehangir', due: '2026-04-27', status: 'Not Started', notes: '' },
      ]},
      { id: 'ph-c1-5', name: 'Launch', status: 'Not Started', startDate: '', completionDate: '', tasks: [
        { id: 't-c1-5-1', name: 'DNS transfer', owner: 'Jehangir', due: '2026-04-29', status: 'Not Started', notes: '' },
        { id: 't-c1-5-2', name: 'Go-live check', owner: 'Sonia', due: '2026-04-30', status: 'Not Started', notes: '' },
      ]},
      { id: 'ph-c1-6', name: 'Post-Launch', status: 'Not Started', startDate: '', completionDate: '', tasks: [
        { id: 't-c1-6-1', name: 'Analytics verification', owner: 'Sonia', due: '2026-05-07', status: 'Not Started', notes: '' },
        { id: 't-c1-6-2', name: '2-week check-in call', owner: 'Sonia', due: '2026-05-14', status: 'Not Started', notes: '' },
      ]},
    ],
    feedback: [
      { id: 'fb-c1-1', description: 'Hero image feels too dark on mobile — needs a lighter overlay', dateReceived: '2026-02-24', phase: 'Design', priority: 'High', status: 'Resolved', resolutionNotes: 'Overlay opacity reduced to 35%, client happy', dateResolved: '2026-02-26' },
      { id: 'fb-c1-2', description: 'Pricing page needs a comparison table instead of listed bullets', dateReceived: '2026-02-28', phase: 'Design', priority: 'Medium', status: 'In Progress', resolutionNotes: 'Redesigning pricing section with table layout', dateResolved: '' },
      { id: 'fb-c1-3', description: 'Add Instagram feed widget to the homepage', dateReceived: '2026-03-12', phase: 'Development', priority: 'Low', status: 'Pending', resolutionNotes: '', dateResolved: '' },
    ],
    checklist: mkChecklist(),
  },
  c4: {
    project: { id: 'wp-c4', name: 'Nourish Platform v2', startDate: '2025-10-01', targetLaunchDate: '2025-12-15', actualLaunchDate: '2025-12-20', status: 'Maintenance' },
    phases: [
      { id: 'ph-c4-1', name: 'Discovery', status: 'Complete', startDate: '2025-10-01', completionDate: '2025-10-12', tasks: [
        { id: 't-c4-1-1', name: 'Brief and scope call', owner: 'Sonia', due: '2025-10-03', status: 'Complete', notes: '' },
        { id: 't-c4-1-2', name: 'Audit existing site', owner: 'Jehangir', due: '2025-10-10', status: 'Complete', notes: '' },
      ]},
      { id: 'ph-c4-2', name: 'Design', status: 'Complete', startDate: '2025-10-13', completionDate: '2025-10-31', tasks: [
        { id: 't-c4-2-1', name: 'Brand refresh guidelines', owner: 'Sonia', due: '2025-10-20', status: 'Complete', notes: '' },
        { id: 't-c4-2-2', name: 'Mockups — all pages', owner: 'Jehangir', due: '2025-10-28', status: 'Complete', notes: '' },
      ]},
      { id: 'ph-c4-3', name: 'Development', status: 'Complete', startDate: '2025-11-01', completionDate: '2025-11-28', tasks: [
        { id: 't-c4-3-1', name: 'Full site build', owner: 'Jehangir', due: '2025-11-20', status: 'Complete', notes: '' },
        { id: 't-c4-3-2', name: 'Programme enrolment integration', owner: 'Jehangir', due: '2025-11-28', status: 'Complete', notes: '' },
      ]},
      { id: 'ph-c4-4', name: 'Client Review', status: 'Complete', startDate: '2025-11-29', completionDate: '2025-12-08', tasks: [
        { id: 't-c4-4-1', name: 'Staging review call', owner: 'Sonia', due: '2025-12-01', status: 'Complete', notes: '' },
        { id: 't-c4-4-2', name: 'Final amends', owner: 'Jehangir', due: '2025-12-08', status: 'Complete', notes: '' },
      ]},
      { id: 'ph-c4-5', name: 'Launch', status: 'Complete', startDate: '2025-12-09', completionDate: '2025-12-20', tasks: [
        { id: 't-c4-5-1', name: 'DNS and go-live', owner: 'Jehangir', due: '2025-12-20', status: 'Complete', notes: '' },
      ]},
      { id: 'ph-c4-6', name: 'Post-Launch', status: 'Complete', startDate: '2025-12-20', completionDate: '2026-01-10', tasks: [
        { id: 't-c4-6-1', name: 'Analytics setup', owner: 'Sonia', due: '2025-12-22', status: 'Complete', notes: '' },
        { id: 't-c4-6-2', name: '2-week review call', owner: 'Sonia', due: '2026-01-10', status: 'Complete', notes: '' },
      ]},
    ],
    feedback: [
      { id: 'fb-c4-1', description: 'Add new supplement product page', dateReceived: '2026-02-10', phase: 'Post-Launch', priority: 'Medium', status: 'Resolved', resolutionNotes: 'New product page added and published', dateResolved: '2026-02-20' },
    ],
    checklist: [
      { id: 'cl-1', item: 'Page Speed Test', type: 'score', value: '91/100', notes: 'Desktop 91, Mobile 84', completionDate: '2025-12-20', completed: true },
      { id: 'cl-2', item: 'Mobile Responsiveness', type: 'pass-fail', value: 'Pass', notes: 'Tested on iPhone 14, Samsung S23', completionDate: '2025-12-20', completed: true },
      { id: 'cl-3', item: 'Booking Integration', type: 'pass-fail', value: 'Pass', notes: 'Programme enrolment tested end-to-end', completionDate: '2025-12-20', completed: true },
      { id: 'cl-4', item: 'Contact Form', type: 'pass-fail', value: 'Pass', notes: 'Confirmation email delivering correctly', completionDate: '2025-12-20', completed: true },
      { id: 'cl-5', item: 'SSL Certificate Active', type: 'yes-no', value: 'Yes', notes: '', completionDate: '2025-12-20', completed: true },
      { id: 'cl-6', item: 'Google Analytics Connected', type: 'yes-no', value: 'Yes', notes: 'GA4 + Search Console connected', completionDate: '2025-12-21', completed: true },
      { id: 'cl-7', item: 'SEO Basics Complete', type: 'yes-no', value: 'Yes', notes: 'Meta titles, descriptions, H1s, sitemap submitted', completionDate: '2025-12-21', completed: true },
    ],
  },
  c2: {
    project: { id: 'wp-c2', name: 'Serene Health — New Website', startDate: '2026-04-01', targetLaunchDate: '2026-06-30', actualLaunchDate: '', status: 'Planning' },
    phases: [
      { id: 'ph-c2-1', name: 'Discovery', status: 'In Progress', startDate: '2026-04-01', completionDate: '', tasks: [
        { id: 't-c2-1-1', name: 'Initial brief call', owner: 'Sonia', due: '2026-04-03', status: 'Complete', notes: '' },
        { id: 't-c2-1-2', name: 'Site audit and competitor review', owner: 'Jehangir', due: '2026-04-15', status: 'In Progress', notes: '' },
        { id: 't-c2-1-3', name: 'SEO keyword research', owner: 'Sonia', due: '2026-04-20', status: 'Not Started', notes: '' },
      ]},
      { id: 'ph-c2-2', name: 'Design', status: 'Not Started', startDate: '', completionDate: '', tasks: [] },
      { id: 'ph-c2-3', name: 'Development', status: 'Not Started', startDate: '', completionDate: '', tasks: [] },
      { id: 'ph-c2-4', name: 'Client Review', status: 'Not Started', startDate: '', completionDate: '', tasks: [] },
      { id: 'ph-c2-5', name: 'Launch', status: 'Not Started', startDate: '', completionDate: '', tasks: [] },
      { id: 'ph-c2-6', name: 'Post-Launch', status: 'Not Started', startDate: '', completionDate: '', tasks: [] },
    ],
    feedback: [],
    checklist: mkChecklist(),
  },
}
