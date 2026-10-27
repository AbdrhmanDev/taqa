import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { Ticketing } from '../../../alarm-alerts/services/ticketing';
import { apiErrorMessage } from '../../../alarm-alerts/services/api-error';
import {
  AssigneeLookup,
  LookupItem,
  MaintenanceRequest,
  SeverityLookup,
  TicketSource,
  TicketStatusLookup,
} from '../../../alarm-alerts/models/ticketing';

interface StatusOption extends TicketStatusLookup {
  /** Display text; `name` keeps the server spelling (e.g. "Wavied", "solved"). */
  label: string;
}

// Server status spellings are preserved by the API; these only tidy what the user sees.
const STATUS_LABELS: Record<string, string> = {
  InProgress: 'In Progress',
  Wavied: 'Waived',
  solved: 'Solved',
};

@Component({
  selector: 'app-tickets-list',
  imports: [CommonModule, FormsModule, TableModule, SelectModule, DialogModule, DatePickerModule, TextareaModule],
  templateUrl: './tickets-list.html',
})
export class TicketsList implements OnInit, OnDestroy {
  @Input({ required: true }) source!: TicketSource;

  constructor(
    private _Ticketing: Ticketing,
    private messageService: MessageService,
  ) {}

  tickets: MaintenanceRequest[] = [];
  totalCount = 0;
  page = 1;
  readonly pageSize = 20;
  loading = true;
  error = '';

  // Filters (sent to the API)
  stationId: number | null = null;
  status: number | null = null;

  // Lookups
  stations: LookupItem[] = [];
  statuses: StatusOption[] = [];
  priorities: SeverityLookup[] = [];
  assignees: AssigneeLookup[] = [];
  // Names seen so far, so the table can show who a ticket is assigned to
  private assigneeNames = new Map<string, string>();

  // Edit dialog
  editing: MaintenanceRequest | null = null;
  editLoading = false;
  saving = false;
  editError = '';
  form = {
    status: null as number | null,
    priority: null as number | null,
    assignedToUserId: null as string | null,
    description: '',
    dueDate: null as Date | null,
  };
  private assigneeSearch = new Subject<string>();
  private subs = new Subscription();

  ngOnInit(): void {
    this._Ticketing.getStations(this.source).subscribe({
      next: (res) => (this.stations = res ?? []),
      error: (err) => console.log(err),
    });
    this._Ticketing.getTicketStatuses(this.source).subscribe({
      next: (res) =>
        (this.statuses = (res ?? []).map((s) => ({ ...s, label: STATUS_LABELS[s.name] ?? s.name }))),
      error: (err) => console.log(err),
    });
    this._Ticketing.getTicketPriorities(this.source).subscribe({
      next: (res) => (this.priorities = res ?? []),
      error: (err) => console.log(err),
    });
    this.loadAssignees('');

    this.subs.add(
      this.assigneeSearch
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((search) =>
            this._Ticketing
              .getAssignees(this.source, { search, pageSize: 30 })
              .pipe(catchError((err) => (console.log(err), of(null)))),
          ),
        )
        .subscribe((res) => this.setAssignees(res?.items ?? [])),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ---- List ----

  onLazyLoad(event: TableLazyLoadEvent) {
    this.page = Math.floor((event.first ?? 0) / this.pageSize) + 1;
    this.onGetTickets();
  }

  onFilterChange() {
    this.page = 1;
    this.onGetTickets();
  }

  onGetTickets() {
    this.loading = true;
    this.error = '';
    this._Ticketing
      .getMaintenanceRequests(this.source, {
        page: this.page,
        pageSize: this.pageSize,
        stationId: this.stationId,
        status: this.status,
      })
      .subscribe({
        next: (res) => {
          this.tickets = res?.items ?? [];
          this.totalCount = res?.totalCount ?? 0;
          this.loading = false;
        },
        error: (err) => {
          console.log(err);
          this.tickets = [];
          this.totalCount = 0;
          this.error = apiErrorMessage(err, 'Could not load maintenance requests');
          this.loading = false;
        },
      });
  }

  // ---- Display helpers ----

  statusName(value: number): string {
    return this.statuses.find((s) => s.value === value)?.label ?? `#${value}`;
  }

  isTerminal(value: number): boolean {
    return !!this.statuses.find((s) => s.value === value)?.terminal;
  }

  priorityName(value: number | null): string {
    if (value === null || value === undefined) return '';
    return this.priorities.find((p) => p.value === value)?.name ?? `#${value}`;
  }

  priorityClass(value: number): string {
    switch (this.priorityName(value)) {
      case 'Critical':
        return 'bg-red-100 text-red-600';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  statusClass(value: number): string {
    const name = (this.statuses.find((s) => s.value === value)?.name ?? '').toLowerCase();
    if (this.isTerminal(value)) return 'bg-gray-100 text-gray-600';
    if (name === 'inprogress') return 'bg-blue-100 text-blue-700';
    if (name === 'solved') return 'bg-green-100 text-green-700';
    return 'bg-teal-100 text-teal-700';
  }

  assigneeName(userId: string | null): string {
    if (!userId) return 'Unassigned';
    return this.assigneeNames.get(userId) ?? 'Assigned';
  }

  // ---- Edit dialog ----

  openEdit(ticket: MaintenanceRequest) {
    this.editing = ticket;
    this.editError = '';
    this.editLoading = true;
    // Always edit the latest version so rowVersion is fresh
    this._Ticketing.getMaintenanceRequest(this.source, ticket.id).subscribe({
      next: (latest) => {
        this.editing = latest;
        this.fillForm(latest);
        this.editLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.editError = apiErrorMessage(err, 'Could not load this request');
        this.editLoading = false;
      },
    });
  }

  closeEdit() {
    this.editing = null;
  }

  get editLocked(): boolean {
    // Terminal tickets cannot be reopened or changed
    return !!this.editing && this.isTerminal(this.editing.status);
  }

  onAssigneeFilter(event: { filter?: string }) {
    this.assigneeSearch.next((event.filter ?? '').trim());
  }

  onSave() {
    const ticket = this.editing;
    if (!ticket || this.saving || this.editLocked) return;
    if (this.form.status === null || this.form.priority === null) {
      this.editError = 'Status and priority are required';
      return;
    }
    if (!ticket.rowVersion) {
      this.editError = 'This request has no version stamp; reload and try again';
      return;
    }

    this.saving = true;
    this.editError = '';
    this._Ticketing
      .updateMaintenanceRequest(this.source, ticket.id, {
        rowVersion: ticket.rowVersion,
        status: this.form.status,
        priority: this.form.priority,
        assignedToUserId: this.form.assignedToUserId,
        description: this.form.description.trim() || null,
        dueDate: this.form.dueDate ? this.form.dueDate.toISOString() : null,
      })
      .subscribe({
        next: (updated) => {
          this.saving = false;
          this.editing = null;
          const index = this.tickets.findIndex((t) => t.id === ticket.id);
          if (index > -1 && updated) this.tickets[index] = updated;
          this.messageService.add({
            severity: 'success',
            summary: 'Saved',
            detail: `Request #${ticket.id} was updated`,
            life: 2000,
          });
          // A status change can move it out of the current status filter
          if (this.status !== null && updated?.status !== this.status) this.onGetTickets();
        },
        error: (err) => {
          console.log(err);
          this.saving = false;
          this.editError = apiErrorMessage(err, 'Could not save the request');
          if (err instanceof HttpErrorResponse && err.status === 409) this.reloadAfterConflict(ticket.id);
        },
      });
  }

  /** On 409, pull the latest version so the user sees the other change and can save again. */
  private reloadAfterConflict(id: number) {
    this._Ticketing.getMaintenanceRequest(this.source, id).subscribe({
      next: (latest) => {
        this.editing = latest;
        this.fillForm(latest);
        this.editError = 'Someone else updated this request. The latest values are now shown; review and save again.';
        const index = this.tickets.findIndex((t) => t.id === id);
        if (index > -1) this.tickets[index] = latest;
      },
      error: (err) => console.log(err),
    });
  }

  private fillForm(ticket: MaintenanceRequest) {
    this.form = {
      status: ticket.status,
      priority: ticket.priority,
      assignedToUserId: ticket.assignedToUserId,
      description: ticket.description ?? '',
      dueDate: ticket.dueDate ? new Date(ticket.dueDate) : null,
    };
    // Make sure the current assignee is selectable even if not in the loaded page
    if (ticket.assignedToUserId && !this.assignees.some((a) => a.id === ticket.assignedToUserId)) {
      this.assignees = [
        { id: ticket.assignedToUserId, name: this.assigneeName(ticket.assignedToUserId), email: null, roles: null },
        ...this.assignees,
      ];
    }
  }

  private loadAssignees(search: string) {
    this._Ticketing.getAssignees(this.source, { search, pageSize: 100 }).subscribe({
      next: (res) => this.setAssignees(res?.items ?? []),
      error: (err) => console.log(err),
    });
  }

  private setAssignees(items: AssigneeLookup[]) {
    this.assignees = items.filter((a) => !!a.id);
    for (const a of this.assignees) this.assigneeNames.set(a.id!, a.name || a.email || 'User');
  }
}
