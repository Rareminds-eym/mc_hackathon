export interface Term {
  id: string;
  text: string;
  correctCategory: string;
  currentCategory?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface GameMode {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  terms: Term[];
}