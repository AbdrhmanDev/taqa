import { Roles } from './../../models/iroles';
import { Component, Input, OnInit } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { EditorModule } from 'primeng/editor';
import { IRoles } from '../../models/iroles';
import { Role } from '../../services/role';
@Component({
  selector: 'app-add-role',
  imports: [SelectModule, EditorModule],
  templateUrl: './add-role.html',
  styleUrl: './add-role.scss',
})
export class AddRole implements OnInit {
  allRoles: IRoles[] = [];
  allClaims: any;
  allAreas: any;

  constructor(private _Role: Role) {}
  ngOnInit(): void {
    this.onGetAllRoles();
  }
  onGetAllRoles() {
    this._Role.getAllRoles().subscribe({
      next: (res: any) => {
        this.allRoles = res.map((role: { roleName: string; roleId: string }) => ({
          label: role.roleName,
          value: role.roleId,
        }));
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllClaims() {
    this._Role.getAllClaims().subscribe({
      next: (res: any) => {
        this.allClaims = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllAreas() {
    this._Role.getAllAreas().subscribe({
      next: (res: any) => {
        this.allAreas = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
