import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { Ticketing } from '../../services/ticketing';
import { apiErrorMessage } from '../../services/api-error';
import { LookupItem, RuleResponse, SeverityLookup, TicketSource } from '../../models/ticketing';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-rules-list',
  imports: [CommonModule, FormsModule, SelectModule, ToggleSwitchModule, ConfirmDialog],
  templateUrl: './rules-list.html',
})
export class RulesList implements OnInit {
  @Input({ required: true }) source!: TicketSource;

  constructor(
    private _Ticketing: Ticketing,
    private router: Router,
    private messageService: MessageService,
  ) {}

  rules: RuleResponse[] = [];
  totalCount = 0;
  page = 1;
  readonly pageSize = 20;
  loading = true;
  error = '';

  // Filters: search is applied to the loaded page, enabled is sent to the API
  search = '';
  enabledFilter: boolean | null = null;
  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  severities: SeverityLookup[] = [];
  stations: LookupItem[] = [];

  // Rows with a toggle / delete request in flight
  busyIds = new Set<number>();
  ruleToDelete: RuleResponse | null = null;

  ngOnInit(): void {
    this._Ticketing.getTicketPriorities(this.source).subscribe({
      next: (res) => (this.severities = res ?? []),
      error: (err) => console.log(err),
    });
    if (this.source === 'dispenser') {
      this._Ticketing.getStations(this.source).subscribe({
        next: (res) => (this.stations = res ?? []),
        error: (err) => console.log(err),
      });
    }
    this.onGetRules();
  }

  onGetRules() {
    this.loading = true;
    this.error = '';
    this._Ticketing
      .getRules(this.source, { page: this.page, pageSize: this.pageSize, enabled: this.enabledFilter })
      .subscribe({
        next: (res) => {
          this.rules = res?.items ?? [];
          this.totalCount = res?.totalCount ?? 0;
          this.loading = false;
        },
        error: (err) => {
          console.log(err);
          this.rules = [];
          this.error = apiErrorMessage(err, 'Could not load alarm rules');
          this.loading = false;
        },
      });
  }

  onFilterChange() {
    this.page = 1;
    this.onGetRules();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.onGetRules();
  }

  get filteredRules(): RuleResponse[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.rules;
    return this.rules.filter(
      (rule) =>
        rule.name?.toLowerCase().includes(term) ||
        rule.description?.toLowerCase().includes(term) ||
        rule.compressorName?.toLowerCase().includes(term) ||
        rule.className?.toLowerCase().includes(term),
    );
  }

  // ---- Display helpers ----

  severityName(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return this.severities.find((s) => s.value === value)?.name ?? '';
  }

  severityClass(value: number): string {
    switch (this.severityName(value)) {
      case 'Critical':
        return 'bg-red-100 text-red-600';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  stationsLabel(rule: RuleResponse): string {
    if (rule.stationScope === 'All') return 'All Stations';
    const ids = rule.stationIds ?? [];
    if (!ids.length) return '';
    const names = ids.map((id) => this.stations.find((s) => s.id === id)?.name).filter(Boolean);
    if (names.length === ids.length && names.length <= 2) return names.join(', ');
    return ids.length === 1 ? '1 Station' : `${ids.length} Stations`;
  }

  windowLabel(seconds: number): string {
    if (seconds % 3600 === 0) return `${seconds / 3600} h`;
    if (seconds % 60 === 0) return `${seconds / 60} min`;
    return `${seconds} s`;
  }

  enabledActions(rule: RuleResponse): number {
    return (rule.actions ?? []).filter((a) => a.isEnabled).length;
  }

  // ---- Actions ----

  onToggleEnabled(rule: RuleResponse, isEnabled: boolean) {
    this.busyIds.add(rule.id);
    rule.isEnabled = isEnabled; // optimistic; reverted on error
    this._Ticketing.setRuleEnabled(this.source, rule.id, isEnabled).subscribe({
      next: () => {
        this.busyIds.delete(rule.id);
        // Keep the list consistent with an active/inactive filter
        if (this.enabledFilter !== null && this.enabledFilter !== isEnabled) this.onGetRules();
      },
      error: (err) => {
        console.log(err);
        rule.isEnabled = !isEnabled;
        this.busyIds.delete(rule.id);
        this.showError(apiErrorMessage(err, 'Could not update the rule'));
      },
    });
  }

  askDelete(rule: RuleResponse) {
    this.ruleToDelete = rule;
  }

  onDeleteConfirmed() {
    const rule = this.ruleToDelete;
    this.ruleToDelete = null;
    if (!rule) return;
    this.busyIds.add(rule.id);
    this._Ticketing.deleteRule(this.source, rule.id).subscribe({
      next: () => {
        this.busyIds.delete(rule.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `"${rule.name}" was deleted`,
          life: 2000,
        });
        // Step back a page if this was the last row on it
        if (this.rules.length === 1 && this.page > 1) this.page--;
        this.onGetRules();
      },
      error: (err) => {
        console.log(err);
        this.busyIds.delete(rule.id);
        this.showError(apiErrorMessage(err, 'Could not delete the rule'));
      },
    });
  }

  editRule(rule: RuleResponse) {
    this.router.navigate(['dashboard/alarm-add'], {
      queryParams: { source: this.source, id: rule.id },
    });
  }

  goViewAlarmDetails(rule: RuleResponse) {
    this.router.navigate(['dashboard/alarm-view'], {
      queryParams: { source: this.source, id: rule.id },
    });
  }

  private showError(detail: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail, life: 3000 });
  }
}
