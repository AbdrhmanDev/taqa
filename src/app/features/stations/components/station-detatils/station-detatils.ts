import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { OverView } from '../over-view/over-view';
import { Comprossers } from '../comprossers/comprossers';
import { Dispensers } from '../dispensers/dispensers';
import { StationAlarm } from '../station-alarm/station-alarm';
import { StationTickets } from '../station-tickets/station-tickets';
import { Router } from '@angular/router';
@Component({
  selector: 'app-station-detatils',
  imports: [TabsModule, OverView, Comprossers, Dispensers, StationAlarm, StationTickets],
  templateUrl: './station-detatils.html',
  styleUrl: './station-detatils.scss',
})
export class StationDetatils implements OnInit {
  constructor(private _Router: Router) {}
  goBack() {
    this._Router.navigate(['/dashboard/station']);
  }
  ngOnInit(): void {}
}
