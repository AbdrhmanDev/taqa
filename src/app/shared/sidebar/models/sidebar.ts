export interface SidebarItem {
  name: string;
  icon: string;
  route?: string;
  children?: SidebarItem[];
  expanded?: boolean;
  adminOnly?: boolean;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}
