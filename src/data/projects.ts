import data from './projects.json';

export type Project = {
  slug: string;
  title: string;
  tag: 'MURAL' | 'ILLUSTRATION';
  cover: string;
  images: string[];
  blurb?: string;
  featured?: boolean;
};

export const projects = (data as Project[]);

// handy filters
export const murals = projects.filter(p => p.tag === 'MURAL');
export const illustrations = projects.filter(p => p.tag === 'ILLUSTRATION');

// homepage: featured in the same order as projects.json
export const featured = projects.filter(p => p.featured);
