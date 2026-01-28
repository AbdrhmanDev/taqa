import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { AddUser } from '../add-user/add-user';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-users',
  imports: [TabsModule, TableModule, SelectModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  currentTab: string = '0';

  constructor(private router: Router) {}
  ngOnInit() {}
  products = [
    {
      id: '1000',
      code: 'f230fh0g',
      name: 'Aya',

      team: 'team1',
    },
    {
      id: '2000',
      code: 'f230fh0g',
      name: 'Moussan',

      team: 'team1',
    },
    {
      id: '3000',
      code: 'f230fh0g',
      name: 'Khaled',

      team: 'team2',
    },
  ];
  roles = [
    {
      id: '1000',
      name: 'Ammar',
      role: 'admin',
      claims: 'All',
    },
    {
      id: '2000',
      name: 'Anwar',
      role: 'super admin',
      claims: 'All',
    },
    {
      id: '3000',
      name: 'Eslam',
      role: 'user',
      claims: 'limited',
    },
  ];
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
