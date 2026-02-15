export type Roles = IRoles[];

export interface IRoles {
  roleId: string;
  roleName: string;
  claims: Claim[];
  areas: Area[];
}

export interface Claim {
  type: string;
  value: string;
}

export interface Area {
  zoneId: number;
  name: string;
  areaId: number;
  areaName: string;
}
export interface IAddRole {
  roleName: string;
  claims: Claim[];
  zoneIds: number[];
}

export interface Claim {
  type: string;
  value: string;
}
