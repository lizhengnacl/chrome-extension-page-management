export interface Page {
  id: string;
  url: string;
  title: string;
  favicon: string;
  groupId: string | null;
  tags: string[];
  isFavorite: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Group {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface StorageData {
  version: string;
  pages: Page[];
  groups: Group[];
  tags: Tag[];
  tagColorsMigrationVersion?: number;
}

export interface ExportData extends StorageData {
  exportedAt: string;
}
