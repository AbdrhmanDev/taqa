import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RulesList } from '../rules-list/rules-list';
import { TicketSource } from '../../models/ticketing';

@Component({
  selector: 'app-alarm-alerts-home',
  imports: [TabsModule, RulesList],
  templateUrl: './alarm-alerts-home.html',
  styleUrl: './alarm-alerts-home.scss',
})
export class AlarmAlertsHome implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  tab: TicketSource = 'compressor';
  // Tabs are created on first visit and then kept, so switching back keeps page/filters
  visited = new Set<TicketSource>();

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    this.tab = tab === 'dispenser' ? 'dispenser' : 'compressor';
    this.visited.add(this.tab);
  }

  onTabChange(value: string | number | undefined) {
    this.tab = value === 'dispenser' ? 'dispenser' : 'compressor';
    this.visited.add(this.tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: this.tab },
      replaceUrl: true,
    });
  }

  createAlarm() {
    this.router.navigate(['dashboard/alarm-add'], { queryParams: { source: this.tab } });
  }
}
