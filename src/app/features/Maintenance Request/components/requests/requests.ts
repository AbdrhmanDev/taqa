import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TicketsList } from '../tickets-list/tickets-list';
import { TicketSource } from '../../../alarm-alerts/models/ticketing';

@Component({
  selector: 'app-requests',
  imports: [TabsModule, TicketsList],
  templateUrl: './requests.html',
  styleUrl: './requests.scss',
})
export class Requests implements OnInit {
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
}
