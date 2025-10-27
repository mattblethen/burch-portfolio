import data from './projects.json';

export type Project = {
  slug: string;
  title: string;
  tag: 'MURAL' | 'ILLUSTRATION';
  cover: string;
  images: string[];
  blurb?: string;
};

export const projects = (data as Project[]);

// handy filters
export const murals = projects.filter(p => p.tag === 'MURAL');
export const illustrations = projects.filter(p => p.tag === 'ILLUSTRATION');

// homepage featured (edit as you like)
export const featured = ['undersea-classroom','volcano-progress','trash-wave']
  .map(slug => projects.find(p => p.slug === slug)!)
  .filter(Boolean);
