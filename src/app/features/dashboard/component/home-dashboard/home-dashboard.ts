import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../../../../shared/sidebar/component/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/navbar/component/navbar/navbar';
import { ChartDashboard } from '../chart-dashboard/chart-dashboard';
import { SharedData } from '../../../../shared/service/shared-data';
@Component({
  selector: 'app-home-dashboard',
  imports: [Sidebar, CommonModule, RouterModule, Navbar, ChartDashboard],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard implements OnInit {
  dashboardData: any;
  dashboardRevenueData: any;
  dashboardGasData: any;

  constructor(private sharedData: SharedData) {}
  ngOnInit(): void {
    this.getSummaryData();
    this.getGasData();
    this.getRevenueData();
  }
  getSummaryData() {
    this.sharedData.dashboardSummary$.subscribe({
      next: (data) => {
        this.dashboardData = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Error fetching dashboard summary:', error);
      },
    });
  }

  getGasData() {
    this.sharedData.dashboardGas$.subscribe({
      next: (data) => {
        this.dashboardGasData = data;
      },
      error: (error) => console.log(error),
    });
  }

  getRevenueData() {
    this.sharedData.dashboardRevenue$.subscribe({
      next: (data) => {
        this.dashboardRevenueData = data;
      },
      error: (error) => console.log(error),
    });
  }
}
