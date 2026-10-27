import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { Ticketing } from '../../services/ticketing';
import { apiErrorMessage } from '../../services/api-error';
import {
  ActionType,
  AssigneeLookup,
  CompressorLookup,
  CompressorRuleInput,
  DispenserParameter,
  DispenserRuleInput,
  LookupItem,
  ParameterLookup,
  RuleAction,
  RuleResponse,
  SeverityLookup,
  StationScope,
  TicketSource,
} from '../../models/ticketing';

type WindowUnit = 'seconds' | 'minutes' | 'hours';

interface ActionForm {
  actionType: ActionType;
  isEnabled: boolean;
  ticketPriority: number | null; // null = inherit the occurrence severity
  assignedToUserId: string | null; // null = unassigned
  emailRecipients: string[];
}

const UNIT_SECONDS: Record<WindowUnit, number> = { seconds: 1, minutes: 60, hours: 3600 };
const MAX_WINDOW_SECONDS = 86400;
const MAX_OCCURRENCES = 10000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-alar-add',
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    ToggleSwitchModule,
  ],
  templateUrl: './alarm-add.html',
  styleUrl: './alarm-add.scss',
})
export class AlarmAdd implements OnInit, OnDestroy {
  constructor(
    private _Ticketing: Ticketing,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
  ) {}

  source: TicketSource = 'compressor';
  ruleId: number | null = null; // set when editing
  step = 1;
  readonly steps = ['Rule Details', 'Alert Actions', 'Review'];
  loadingRule = false;
  saving = false;
  saveError = '';
  // Errors are shown only after the user tries to continue from a step
  attempted = new Set<number>();

  // ---- Form ----
  name = '';
  description = '';
  isEnabled = true;
  occurrenceCount: number | null = 1;
  windowValue: number | null = 10;
  windowUnit: WindowUnit = 'minutes';

  // Compressor
  compressorId: number | null = null;
  classNameId: number | null = null;

  // Dispenser
  parameter: DispenserParameter | null = null;
  thresholdValue: number | null = null;
  severity: number | null = null;
  stationScope: StationScope = 'Single';
  stationIds: number[] = [];
  stationSearch = '';

  actions: ActionForm[] = [];
  emailDraft = '';
  emailDraftError = '';

  // ---- Lookups ----
  compressors: CompressorLookup[] = [];
  classNames: LookupItem[] = [];
  classNamesLoading = false;
  parameters: ParameterLookup[] = [];
  severities: SeverityLookup[] = [];
  priorities: SeverityLookup[] = [];
  stations: LookupItem[] = [];
  assignees: AssigneeLookup[] = [];

  windowUnits = [
    { label: 'Seconds', value: 'seconds' },
    { label: 'Minutes', value: 'minutes' },
    { label: 'Hours', value: 'hours' },
  ];

  /** "All stations" is restricted to Admin / SuperAdmin by the API. */
  readonly canUseAllStations = ['Admin', 'SuperAdmin'].includes(localStorage.getItem('roles') ?? '');

  private assigneeSearch = new Subject<string>();
  private subs = new Subscription();

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.source = params.get('source') === 'dispenser' ? 'dispenser' : 'compressor';
    const id = Number(params.get('id'));
    this.ruleId = Number.isInteger(id) && id > 0 ? id : null;

    this.actions = this.defaultActions();
    this.loadLookups();
    if (this.ruleId) this.loadRule(this.ruleId);

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
        .subscribe((res) => this.mergeAssignees(res?.items ?? [], true)),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get isEdit(): boolean {
    return this.ruleId !== null;
  }

  /** Source can only be switched while creating; a rule's source is fixed by its controller. */
  setSource(source: TicketSource) {
    if (this.isEdit || source === this.source) return;
    this.source = source;
    this.attempted.clear();
    this.actions = this.defaultActions();
    this.loadLookups();
  }

  // ---- Loading ----

  private loadLookups() {
    const log = (err: unknown) => console.log(err);
    this._Ticketing.getTicketPriorities(this.source).subscribe({
      next: (res) => (this.priorities = res ?? []),
      error: log,
    });
    this._Ticketing.getAssignees(this.source, { pageSize: 100 }).subscribe({
      next: (res) => this.mergeAssignees(res?.items ?? [], true),
      error: log,
    });

    if (this.source === 'compressor') {
      this._Ticketing.getCompressors().subscribe({
        next: (res) => (this.compressors = res ?? []),
        error: log,
      });
    } else {
      this._Ticketing.getParameters().subscribe({
        next: (res) => (this.parameters = res ?? []),
        error: log,
      });
      this._Ticketing.getSeverities().subscribe({
        next: (res) => (this.severities = res ?? []),
        error: log,
      });
      this._Ticketing.getStations(this.source).subscribe({
        next: (res) => (this.stations = res ?? []),
        error: log,
      });
    }
  }

  private loadRule(id: number) {
    this.loadingRule = true;
    this._Ticketing.getRule(this.source, id).subscribe({
      next: (rule) => {
        this.fillForm(rule);
        this.loadingRule = false;
      },
      error: (err) => {
        console.log(err);
        this.loadingRule = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: apiErrorMessage(err, 'Could not load the rule'),
          life: 3000,
        });
        this.goBack();
      },
    });
  }

  private fillForm(rule: RuleResponse) {
    this.name = rule.name;
    this.description = rule.description ?? '';
    this.isEnabled = rule.isEnabled;
    this.occurrenceCount = rule.occurrenceCount;
    this.setWindowFromSeconds(rule.windowSeconds);

    if (this.source === 'compressor') {
      this.compressorId = rule.compressorId;
      this.classNameId = rule.classNameId;
      if (rule.compressorId) this.loadClassNames(rule.compressorId, false);
    } else {
      this.parameter = rule.parameter;
      this.thresholdValue = rule.thresholdValue;
      this.severity = rule.severity;
      this.stationScope = rule.stationScope;
      this.stationIds = [...(rule.stationIds ?? [])];
    }

    // Start from the defaults so both action types are always shown, then apply saved ones
    this.actions = this.defaultActions();
    const saved = [...(rule.actions ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const ordered: ActionForm[] = [];
    for (const action of saved) {
      const form = this.actions.find((a) => a.actionType === action.actionType);
      if (!form || ordered.includes(form)) continue;
      form.isEnabled = action.isEnabled;
      form.ticketPriority = action.ticketPriority ?? null;
      form.assignedToUserId = action.assignedToUserId ?? null;
      form.emailRecipients = [...(action.emailRecipients ?? [])];
      ordered.push(form);
    }
    this.actions = [...ordered, ...this.actions.filter((a) => !ordered.includes(a))];
  }

  private defaultActions(): ActionForm[] {
    return [
      {
        actionType: 'MaintenanceTicket',
        isEnabled: true,
        ticketPriority: null,
        assignedToUserId: null,
        emailRecipients: [],
      },
      {
        actionType: 'Email',
        isEnabled: false,
        ticketPriority: null,
        assignedToUserId: null,
        emailRecipients: [],
      },
    ];
  }

  // ---- Compressor ----

  onCompressorChange() {
    this.classNameId = null;
    this.classNames = [];
    if (this.compressorId) this.loadClassNames(this.compressorId, true);
  }

  private loadClassNames(compressorId: number, resetIfMissing: boolean) {
    this.classNamesLoading = true;
    this._Ticketing.getClassNames(compressorId).subscribe({
      next: (res) => {
        this.classNames = res ?? [];
        this.classNamesLoading = false;
        if (resetIfMissing && !this.classNames.some((c) => c.id === this.classNameId)) {
          this.classNameId = null;
        }
      },
      error: (err) => {
        console.log(err);
        this.classNames = [];
        this.classNamesLoading = false;
      },
    });
  }

  compressorName(id: number | null): string {
    return this.compressors.find((c) => c.id === id)?.name ?? (id ? `Compressor #${id}` : '');
  }

  className(id: number | null): string {
    return this.classNames.find((c) => c.id === id)?.name ?? (id ? `Class #${id}` : '');
  }

  // ---- Dispenser ----

  setScope(scope: StationScope) {
    if (scope === 'All' && !this.canUseAllStations) return;
    this.stationScope = scope;
    if (scope === 'All') this.stationIds = [];
    if (scope === 'Single' && this.stationIds.length > 1) this.stationIds = [this.stationIds[0]];
  }

  get filteredStations(): LookupItem[] {
    const term = this.stationSearch.trim().toLowerCase();
    return term ? this.stations.filter((s) => s.name?.toLowerCase().includes(term)) : this.stations;
  }

  isStationSelected(id: number): boolean {
    return this.stationIds.includes(id);
  }

  toggleStation(id: number) {
    if (this.stationScope === 'Single') {
      this.stationIds = [id];
    } else if (this.isStationSelected(id)) {
      this.stationIds = this.stationIds.filter((s) => s !== id);
    } else {
      this.stationIds = [...this.stationIds, id];
    }
  }

  stationName(id: number): string {
    return this.stations.find((s) => s.id === id)?.name ?? `Station #${id}`;
  }

  get selectedStationNames(): string {
    return this.stationIds.map((id) => this.stationName(id)).join(', ');
  }

  get enabledActions(): ActionForm[] {
    return this.actions.filter((a) => a.isEnabled);
  }

  get parameterOperator(): string {
    return this.parameters.find((p) => p.id === this.parameter)?.operator ?? '>';
  }

  severityName(value: number | null): string {
    return this.severities.find((s) => s.value === value)?.name ?? '';
  }

  // ---- Actions ----

  moveAction(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= this.actions.length) return;
    const next = [...this.actions];
    [next[index], next[target]] = [next[target], next[index]];
    this.actions = next;
  }

  addEmail(action: ActionForm) {
    const parts = this.emailDraft
      .split(/[,;\s]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const invalid = parts.filter((p) => !EMAIL_PATTERN.test(p));
    for (const email of parts.filter((p) => EMAIL_PATTERN.test(p))) {
      if (!action.emailRecipients.some((e) => e.toLowerCase() === email.toLowerCase())) {
        action.emailRecipients = [...action.emailRecipients, email];
      }
    }
    this.emailDraft = invalid.join(', ');
    this.emailDraftError = invalid.length ? `Not a valid email: ${invalid.join(', ')}` : '';
  }

  removeEmail(action: ActionForm, email: string) {
    action.emailRecipients = action.emailRecipients.filter((e) => e !== email);
  }

  onEmailKeydown(event: KeyboardEvent, action: ActionForm) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addEmail(action);
    }
  }

  onAssigneeFilter(event: { filter?: string }) {
    this.assigneeSearch.next((event.filter ?? '').trim());
  }

  assigneeName(id: string | null): string {
    if (!id) return 'Unassigned';
    const user = this.assignees.find((a) => a.id === id);
    return user?.name || user?.email || 'Selected user';
  }

  priorityName(value: number | null): string {
    if (value === null) return 'Same as alarm severity';
    return this.priorities.find((p) => p.value === value)?.name ?? `#${value}`;
  }

  private mergeAssignees(items: AssigneeLookup[], keepSelected: boolean) {
    const selected = keepSelected
      ? this.assignees.filter((a) => this.actions.some((x) => x.assignedToUserId === a.id))
      : [];
    const byId = new Map<string, AssigneeLookup>();
    for (const a of [...selected, ...items]) if (a.id) byId.set(a.id, a);
    this.assignees = [...byId.values()];
  }

  // ---- Validation ----

  get windowSeconds(): number | null {
    if (!this.windowValue) return null;
    return Math.round(this.windowValue * UNIT_SECONDS[this.windowUnit]);
  }

  private setWindowFromSeconds(seconds: number) {
    if (seconds % 3600 === 0) {
      this.windowUnit = 'hours';
      this.windowValue = seconds / 3600;
    } else if (seconds % 60 === 0) {
      this.windowUnit = 'minutes';
      this.windowValue = seconds / 60;
    } else {
      this.windowUnit = 'seconds';
      this.windowValue = seconds;
    }
  }

  windowLabel(): string {
    if (!this.windowValue) return '';
    const unit = this.windowValue === 1 ? this.windowUnit.slice(0, -1) : this.windowUnit;
    return `${this.windowValue} ${unit}`;
  }

  /** Validation messages for step 1, keyed by field. */
  get detailErrors(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!this.name.trim()) e['name'] = 'Name is required';
    else if (this.name.trim().length > 200) e['name'] = 'Name must be at most 200 characters';

    const count = this.occurrenceCount;
    if (!count || count < 1 || count > MAX_OCCURRENCES || !Number.isInteger(count)) {
      e['occurrenceCount'] = `Enter a whole number from 1 to ${MAX_OCCURRENCES}`;
    }
    const window = this.windowSeconds;
    if (!window || window < 1 || window > MAX_WINDOW_SECONDS) {
      e['window'] = 'The time window must be between 1 second and 24 hours';
    }

    if (this.source === 'compressor') {
      if (!this.compressorId) e['compressorId'] = 'Select a compressor';
      if (!this.classNameId) e['classNameId'] = 'Select a class';
    } else {
      if (!this.parameter) e['parameter'] = 'Select a parameter';
      if (this.thresholdValue === null || this.thresholdValue === undefined) {
        e['thresholdValue'] = 'Threshold is required';
      } else if (this.parameter !== 'Temperature' && this.thresholdValue < 0) {
        e['thresholdValue'] = `${this.parameter ?? 'This'} threshold cannot be negative`;
      }
      if (this.severity === null) e['severity'] = 'Select a severity';
      if (this.stationScope === 'Single' && this.stationIds.length !== 1) {
        e['stations'] = 'Select one station';
      } else if (this.stationScope === 'Multiple' && new Set(this.stationIds).size < 2) {
        e['stations'] = 'Select at least two stations';
      }
    }
    return e;
  }

  get actionErrors(): Record<string, string> {
    const e: Record<string, string> = {};
    const enabled = this.actions.filter((a) => a.isEnabled);
    if (this.source === 'compressor' && !enabled.length) {
      e['actions'] = 'Compressor rules need at least one enabled action';
    }
    const email = this.actions.find((a) => a.actionType === 'Email');
    if (email?.isEnabled && !email.emailRecipients.length) {
      e['email'] = 'Add at least one recipient';
    }
    return e;
  }

  hasErrors(errors: Record<string, string>): boolean {
    return Object.keys(errors).length > 0;
  }

  showError(step: number, errors: Record<string, string>, key: string): string {
    return this.attempted.has(step) ? (errors[key] ?? '') : '';
  }

  // ---- Navigation ----

  next() {
    this.attempted.add(this.step);
    if (this.step === 1 && this.hasErrors(this.detailErrors)) return;
    if (this.step === 2) {
      if (this.emailDraft.trim()) {
        const email = this.actions.find((a) => a.actionType === 'Email');
        if (email) this.addEmail(email);
      }
      if (this.hasErrors(this.actionErrors) || this.emailDraftError) return;
    }
    this.step = Math.min(this.step + 1, this.steps.length);
  }

  back() {
    this.step = Math.max(this.step - 1, 1);
  }

  goToStep(target: number) {
    // Jump back freely; forward only through next() so each step's validation runs
    if (target <= this.step) {
      this.step = target;
      return;
    }
    while (this.step < target) {
      const before = this.step;
      this.next();
      if (this.step === before) break; // validation stopped us
    }
  }

  goBack() {
    this.router.navigate(['dashboard/alarm-alert'], { queryParams: { tab: this.source } });
  }

  // ---- Save ----

  private buildActions(): RuleAction[] {
    // Only enabled actions are sent; a disabled Email with no recipients would fail validation
    return this.actions
      .filter((a) => a.isEnabled)
      .map((a, index) => {
        const action: RuleAction = { actionType: a.actionType, sortOrder: index + 1, isEnabled: true };
        if (a.actionType === 'MaintenanceTicket') {
          action.ticketPriority = a.ticketPriority;
          action.assignedToUserId = a.assignedToUserId;
        } else {
          action.emailRecipients = a.emailRecipients;
        }
        return action;
      });
  }

  private buildBody(): CompressorRuleInput | DispenserRuleInput {
    const base = {
      name: this.name.trim(),
      description: this.description.trim() || null,
      occurrenceCount: this.occurrenceCount!,
      windowSeconds: this.windowSeconds!,
      isEnabled: this.isEnabled,
      actions: this.buildActions(),
    };
    if (this.source === 'compressor') {
      return { ...base, compressorId: this.compressorId!, classNameId: this.classNameId! };
    }
    return {
      ...base,
      parameter: this.parameter!,
      thresholdValue: this.thresholdValue!,
      severity: this.severity!,
      stationScope: this.stationScope,
      stationIds: this.stationScope === 'All' ? [] : [...new Set(this.stationIds)],
    };
  }

  onSave() {
    if (this.saving) return;
    this.attempted.add(1).add(2);
    if (this.hasErrors(this.detailErrors)) {
      this.step = 1;
      return;
    }
    if (this.hasErrors(this.actionErrors)) {
      this.step = 2;
      return;
    }

    this.saving = true;
    this.saveError = '';
    const body = this.buildBody();
    const request = this.ruleId
      ? this._Ticketing.updateRule(this.source, this.ruleId, body)
      : this._Ticketing.createRule(this.source, body);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: this.isEdit ? 'Alarm rule updated' : 'Alarm rule created',
          life: 2000,
        });
        this.goBack();
      },
      error: (err) => {
        console.log(err);
        this.saving = false;
        this.saveError = apiErrorMessage(err, 'Could not save the rule');
      },
    });
  }
}
