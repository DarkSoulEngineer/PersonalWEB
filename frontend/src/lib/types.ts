export interface PostListItem {
  id: string;
  title: string;
  author: string;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
  excerpt: string;
}

export interface PostDetail extends PostListItem {
  content: string;
}

export interface Tag {
  id: string;
  name: string;
  posts_count: number;
}

export interface Profile {
  name: string;
  aliases: string[];
  photo: string;
  avatar: string;
  jobTitle: string;
  headline: string;
  location: string;
  bio: string;
  worksFor: string[];
  memberOf: string[];
  education: {
    school: string;
    faculty: string;
    domain: string;
    extracurriculars: string[];
  };
  skills: string[];
  github: {
    login: string;
    url: string;
  };
  links: { linkedin: string; github: string };
}

export interface Project {
  id: number;
  name: string;
  description: string;
  language: string;
  category: string;
  url: string;
  featured: boolean;
  github_updated_at: string | null;
}

export interface LanguageCount {
  language: string;
  count: number;
}

export interface ProjectCaseStudy {
  slug: string;
  title: string;
  description: string;
  reviewedAt: string;
  sources: { url: string }[];
  license?: string;
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

export interface Cv {
  profile: Profile;
  photo?: string;
  title?: string;
  summary: string;
  contact: { email: string };
  experience: CvExperience[];
  skillGroups: CvSkillGroup[];
  interests: string[];
  achievements: Milestone[];
  featuredProjects: Project[];
}
