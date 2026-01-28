import { Component } from '@angular/core';
import { Sidebar } from '../../../../shared/sidebar/component/sidebar/sidebar';
import { Navbar } from '../../../../shared/navbar/component/navbar/navbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Navbar, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
