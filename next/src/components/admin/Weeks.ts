// A week's route of the admin, which shows that week's deliverable: its base path and the sections its tabs link to
export interface AdminSection {
  label: string;
  // The section's path under the base; '' is the week's home
  path: string;
}

export interface AdminWeek {
  base: string;
  sections: AdminSection[];
}

const CoreSections: AdminSection[] = [
  {label: 'Overview', path: ''},
  {label: 'Photos', path: '/photos'},
  {label: 'Users', path: '/users'},
  {label: 'Votes', path: '/votes'},
];

export const Week6: AdminWeek = {base: '/w6', sections: CoreSections};

export const Week7: AdminWeek = {
  base: '/w7',
  sections: [
    ...CoreSections,
    {label: 'Chains', path: '/chains'},
    {label: 'Models', path: '/models'},
    {label: 'Terms', path: '/terms'},
    {label: 'Examples', path: '/examples'},
    {label: 'Requests', path: '/requests'},
    {label: 'Access', path: '/access'},
  ],
};

// The week the root redirects to
export const LatestWeek = Week7;
