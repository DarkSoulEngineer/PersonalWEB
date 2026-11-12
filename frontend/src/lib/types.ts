export interface PostListItem {
  id: string;
  title: string;
  author: string;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
  excerpt: string;
}

export interface PostDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
}

export interface Tag {
  id: string;
  name: string;
  posts_count: number;
}

export interface Stats {
  posts: number;
  tags: number;
}

export interface Profile {
  name: string;
  aliases: string[];
  photo: string;
  headline: string;
  location: string;
  bio: string;
  education: {
    school: string;
    faculty: string;
    domain: string;
    extracurriculars: string[];
  };
  roles: { organization: string; role: string; current: boolean }[];
  skills: string[];
  github: {
    login: string;
    name: string;
    avatar: string;
    url: string;
    company: string;
    public_repos: number;
    followers: number;
    created_at: string;
  };
  links: { linkedin: string; github: string };
}

export interface Project {
  id: number;
  name: string;
  description: string;
  language: string;
  category: string;
  /** Short list of the main tools and platforms, shown next to the project. */
  stack?: string[];
  url: string;
  stars: number;
  forks: number;
  featured: boolean;
  github_updated_at: string | null;
}

export interface LanguageCount {
  language: string;
  count: number;
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  date: string | null;
  category: string;
  url: string | null;
  featured: boolean;
}

export interface CvExperience {
  organization: string;
  role: string;
  period: string;
  current: boolean;
  points: string[];
}

export interface CvSkillGroup {
  group: string;
  items: string[];
}

/** What the one-page printed CV shows, picked from the site's own data. */
export interface CvPrintSelection {
  /** Roles printed with their bullet points; later ones print as one line. */
  detailedRoles: number;
  projects: Project[];
  achievements: Milestone[];
}

export interface Cv {
  profile: Profile;
  photo?: string;
  summary: string;
  contact: { email: string };
  experience: CvExperience[];
  skillGroups: CvSkillGroup[];
  achievements: Milestone[];
  featuredProjects: Project[];
  print: CvPrintSelection;
}
