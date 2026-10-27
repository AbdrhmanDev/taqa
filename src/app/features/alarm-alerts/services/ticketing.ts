import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../env/environment';
import {
  ActionDelivery,
  AssigneeLookup,
  CompressorLookup,
  CompressorRuleInput,
  DispenserAlarm,
  DispenserRuleInput,
  LookupItem,
  MaintenanceRequest,
  Occurrence,
  PagedResult,
  ParameterLookup,
  RoleLookup,
  RuleResponse,
  SeverityLookup,
  SystemCompressorAlarm,
  TicketSource,
  TicketStatusLookup,
  TicketUpdateInput,
} from '../models/ticketing';

interface PageOptions {
  page?: number;
  pageSize?: number; // the API caps this at 100
}

@Injectable({
  providedIn: 'root',
})
export class Ticketing {
  constructor(private http: HttpClient) {}

  private base(source: TicketSource): string {
    return `${environment.url}${source}-tickets/`;
  }

  // Drops undefined / null / '' so they are not sent as "undefined" in the query string.
  private params(values: Record<string, any>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, value);
    }
    return params;
  }

  // ---- Lookups (both sources) ----

  getStations(source: TicketSource): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(this.base(source) + 'stations');
  }

  getRoles(source: TicketSource): Observable<RoleLookup[]> {
    return this.http.get<RoleLookup[]>(this.base(source) + 'roles');
  }

  getAssignees(
    source: TicketSource,
    options: PageOptions & { roleId?: string; search?: string } = {},
  ): Observable<PagedResult<AssigneeLookup>> {
    return this.http.get<PagedResult<AssigneeLookup>>(this.base(source) + 'assignees', {
      params: this.params({ page: 1, pageSize: 30, ...options }),
    });
  }

  getTicketPriorities(source: TicketSource): Observable<SeverityLookup[]> {
    return this.http.get<SeverityLookup[]>(this.base(source) + 'ticket-priorities');
  }

  getTicketStatuses(source: TicketSource): Observable<TicketStatusLookup[]> {
    return this.http.get<TicketStatusLookup[]>(this.base(source) + 'ticket-statuses');
  }

  getActionTypes(source: TicketSource): Observable<any[]> {
    return this.http.get<any[]>(this.base(source) + 'action-types');
  }

  // ---- Rules (both sources) ----

  getRules(
    source: TicketSource,
    options: PageOptions & { enabled?: boolean | null } = {},
  ): Observable<PagedResult<RuleResponse>> {
    return this.http.get<PagedResult<RuleResponse>>(this.base(source) + 'rules', {
      params: this.params({ page: 1, pageSize: 20, ...options }),
    });
  }

  getRule(source: TicketSource, id: number): Observable<RuleResponse> {
    return this.http.get<RuleResponse>(this.base(source) + 'rules/' + id);
  }

  createRule(
    source: TicketSource,
    body: CompressorRuleInput | DispenserRuleInput,
  ): Observable<RuleResponse> {
    return this.http.post<RuleResponse>(this.base(source) + 'rules', body);
  }

  updateRule(
    source: TicketSource,
    id: number,
    body: CompressorRuleInput | DispenserRuleInput,
  ): Observable<RuleResponse> {
    return this.http.put<RuleResponse>(this.base(source) + 'rules/' + id, body);
  }

  deleteRule(source: TicketSource, id: number): Observable<void> {
    return this.http.delete<void>(this.base(source) + 'rules/' + id);
  }

  setRuleEnabled(source: TicketSource, id: number, isEnabled: boolean): Observable<void> {
    return this.http.patch<void>(this.base(source) + `rules/${id}/enabled`, { isEnabled });
  }

  // ---- Maintenance requests / tickets (both sources) ----

  getMaintenanceRequests(
    source: TicketSource,
    options: PageOptions & { stationId?: number | null; status?: number | null } = {},
  ): Observable<PagedResult<MaintenanceRequest>> {
    return this.http.get<PagedResult<MaintenanceRequest>>(
      this.base(source) + 'maintenance-requests',
      { params: this.params({ page: 1, pageSize: 20, ...options }) },
    );
  }

  getMaintenanceRequest(source: TicketSource, id: number): Observable<MaintenanceRequest> {
    return this.http.get<MaintenanceRequest>(this.base(source) + 'maintenance-requests/' + id);
  }

  /** Returns 409 when rowVersion is stale. */
  updateMaintenanceRequest(
    source: TicketSource,
    id: number,
    body: TicketUpdateInput,
  ): Observable<MaintenanceRequest> {
    return this.http.put<MaintenanceRequest>(
      this.base(source) + 'maintenance-requests/' + id,
      body,
    );
  }

  // ---- Occurrences & action deliveries (both sources) ----

  getOccurrences(
    source: TicketSource,
    options: PageOptions & { ruleId?: number | null; stationId?: number | null } = {},
  ): Observable<PagedResult<Occurrence>> {
    return this.http.get<PagedResult<Occurrence>>(this.base(source) + 'occurrences', {
      params: this.params({ page: 1, pageSize: 20, ...options }),
    });
  }

  getOccurrenceActions(source: TicketSource, occurrenceId: string): Observable<ActionDelivery[]> {
    return this.http.get<ActionDelivery[]>(
      this.base(source) + `occurrences/${occurrenceId}/actions`,
    );
  }

  retryAction(source: TicketSource, occurrenceId: string, actionId: number): Observable<void> {
    return this.http.post<void>(
      this.base(source) + `occurrences/${occurrenceId}/actions/${actionId}/retry`,
      {},
    );
  }

  // ---- Compressor only ----

  getCompressors(): Observable<CompressorLookup[]> {
    return this.http.get<CompressorLookup[]>(this.base('compressor') + 'compressors');
  }

  getClassNames(compressorId: number): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(
      this.base('compressor') + `compressors/${compressorId}/class-names`,
    );
  }

  getSeverityMapping(): Observable<any> {
    return this.http.get<any>(this.base('compressor') + 'severity-mapping');
  }

  /** Server defaults to the last 24 hours; max range 31 days. */
  getSystemAlarms(
    options: PageOptions & { brokerId?: string; from?: string; to?: string } = {},
  ): Observable<PagedResult<SystemCompressorAlarm>> {
    return this.http.get<PagedResult<SystemCompressorAlarm>>(
      this.base('compressor') + 'system-alarms',
      { params: this.params({ page: 1, pageSize: 20, ...options }) },
    );
  }

  // ---- Dispenser only ----

  getParameters(): Observable<ParameterLookup[]> {
    return this.http.get<ParameterLookup[]>(this.base('dispenser') + 'parameters');
  }

  getSeverities(): Observable<SeverityLookup[]> {
    return this.http.get<SeverityLookup[]>(this.base('dispenser') + 'severities');
  }

  getStationScopes(): Observable<any[]> {
    return this.http.get<any[]>(this.base('dispenser') + 'station-scopes');
  }

  getDispenserAlarms(
    options: PageOptions & { stationId?: number | null } = {},
  ): Observable<PagedResult<DispenserAlarm>> {
    return this.http.get<PagedResult<DispenserAlarm>>(this.base('dispenser') + 'alarms', {
      params: this.params({ page: 1, pageSize: 20, ...options }),
    });
  }

  getDispenserAlarm(id: number): Observable<DispenserAlarm> {
    return this.http.get<DispenserAlarm>(this.base('dispenser') + 'alarms/' + id);
  }

  acknowledgeAlarm(id: number): Observable<void> {
    return this.http.patch<void>(this.base('dispenser') + `alarms/${id}/acknowledge`, {});
  }
}
