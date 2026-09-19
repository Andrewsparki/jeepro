export type AppUpdateCategory = 'Feature' | 'Improvement' | 'Fix' | 'Announcement';
export type AppUpdateStatus = 'Live' | 'In Progress' | 'Coming Soon';

export interface AppUpdate {
  id: string;
  title: string;
  description: string;
  category: AppUpdateCategory;
  status: AppUpdateStatus;
  icon_name: string | null;
  image_url: string | null;
  link_url: string | null;
  link_label: string | null;
  is_published: boolean;
  is_archived: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  is_read?: boolean;
}

export interface AppUpdateCreateInput {
  title: string;
  description: string;
  category: AppUpdateCategory;
  status: AppUpdateStatus;
  icon_name?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  is_published?: boolean;
  is_archived?: boolean;
  published_at?: string;
}

export interface AppUpdateUpdateInput extends Partial<AppUpdateCreateInput> {
  id: string;
}
