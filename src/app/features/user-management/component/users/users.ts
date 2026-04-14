import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { AddUser } from '../add-user/add-user';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { User } from '../../services/user';
import { IUser } from '../../models/iuser';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DeleteUser } from '../delete-user/delete-user';
import { Role } from '../../services/role';
import { Area, Claim, IRoles } from '../../models/iroles';
import { CommonModule } from '@angular/common';
import { EditUser } from '../edit-user/edit-user';
import { UpdateUser } from '../update-user/update-user';
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
    CommonModule,
    UpdateUser,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  currentTab: string = '0';
  allUsers: IUser[] = [];

  showEditPopup = false;
  showdeletePopup = false;
  selectedUserId!: number;
  selectedRole!: string;
  selectedRoleData: any;
  selectedUserRole!: any;
  allRoles: IRoles[] = [];
  userId!: string;
  @Input() showdelete = new EventEmitter<void>();

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
  openEdit(role: string) {
    this.selectedRoleData = role;
    this.showEditPopup = true;
  }
  openEditUser(user: string) {
    this.selectedUserRole = user;
    this.showEditPopup = true;
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
