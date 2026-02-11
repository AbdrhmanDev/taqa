import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { AddUser } from '../add-user/add-user';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { User } from '../../services/user';
import { IUser } from '../../models/iuser';
import { EditUser } from '../edit-user/edit-user';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DeleteUser } from '../delete-user/delete-user';
import { Role } from '../../services/role';
import { Area, Claim, IRoles } from '../../models/iroles';
@Component({
  selector: 'app-users',
  imports: [
    TabsModule,
    TableModule,
    SelectModule,
    EditUser,
    AddUser,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DeleteUser,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  currentTab: string = '0';
  allUsers: IUser | any;
  showEditPopup = false;
  showdeletePopup = false;
  selectedUserId!: number;
  selectedRole!: string;
  allRoles: IRoles[] | any;
  userType = [
    { label: 'Admin', value: 'Admin' },
    { label: 'User', value: 'User' },
  ];
  constructor(
    private router: Router,
    private _User: User,
    private _Role: Role,
  ) {}
  ngOnInit() {
    this.onGetAllUsers();
    this.onGetAllRoles();
  }

  openDelete(userId: number) {
    this.selectedUserId = userId;
    this.showdeletePopup = true;
  }
  deleteRole(roleName: string) {
    this.selectedRole = roleName;
    this.showdeletePopup = true;
  }
  onGetAllUsers() {
    this._User.getAllUsers().subscribe({
      next: (res) => {
        this.allUsers = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllRoles() {
    this._Role.getAllRoles().subscribe({
      next: (res) => {
        this.allRoles = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getClaimValues(claims: Claim[]): string {
    return claims?.map((c) => c.value).join(', ') || '';
  }

  getAreaNames(areas: Area[]): string {
    return areas?.map((a) => a.areaName).join(', ') || '';
  }

  onTabChange(event: any) {
    this.currentTab = event;
  }
  handleButtonClick() {
    if (this.currentTab === '0') {
      this.addUserComponent();
    } else {
      this.addRoleComponent();
    }
  }
  addUserComponent() {
    this.router.navigate(['/dashboard/add-user']);
  }
  addRoleComponent() {
    this.router.navigate(['/dashboard/add-role']);
  }
}
