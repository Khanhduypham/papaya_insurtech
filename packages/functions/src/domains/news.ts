export interface News {
  id: string;
  title: string;
  content: string;
  publisherId: string;
  createdDate: Date;
  updatedDate: Date;
  categoryNames?: string[];
  categoryIds?: string[];
  publisherName?: string;
}

export interface Category {
  id: string;
  name: string;
}
