import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { OverView } from '../over-view/over-view';
import { Comprossers } from '../comprossers/comprossers';
import { Dispensers } from '../dispensers/dispensers';
import { StationAlarm } from '../station-alarm/station-alarm';
import { StationTickets } from '../station-tickets/station-tickets';
@Component({
  selector: 'app-station-detatils',
  imports: [TabsModule, OverView, Comprossers, Dispensers, StationAlarm, StationTickets],
  templateUrl: './station-detatils.html',
  styleUrl: './station-detatils.scss',
})
export class StationDetatils {}
