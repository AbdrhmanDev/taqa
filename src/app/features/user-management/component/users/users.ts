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
  userType = [
    { label: 'Admin', value: 'Admin' },
    { label: 'User', value: 'User' },
  ];
  constructor(
    private router: Router,
    private _User: User,
  ) {}
  ngOnInit() {
    this.onGetAllUsers();
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
