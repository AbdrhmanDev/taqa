import { Component, OnInit, inject } from '@angular/core';
import { Sidebar } from '../../../../shared/sidebar/component/sidebar/sidebar';
import { Navbar } from '../../../../shared/navbar/component/navbar/navbar';
import { RouterModule } from '@angular/router';
import { TechOpsRealtime } from '../../service/tech-ops-realtime';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Navbar, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private _techOpsRealtime = inject(TechOpsRealtime);

  ngOnInit(): void {
    // Start TechOps connection in the background as soon as dashboard loads
    this._techOpsRealtime.startConnection();
  }
}
