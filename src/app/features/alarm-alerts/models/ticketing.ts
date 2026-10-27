// Contracts for the Compressor / Dispenser ticketing API
// (base URLs: compressor-tickets/ and dispenser-tickets/), taken from the v1 Swagger schemas.

export type TicketSource = 'compressor' | 'dispenser';

export type ActionType = 'MaintenanceTicket' | 'Email';
export type SourceType = 'Legacy' | 'Compressor' | 'Dispenser';
export type DispenserParameter = 'Density' | 'Pressure' | 'Temperature';
export type StationScope = 'All' | 'Single' | 'Multiple';
export type DeliveryStatus = 'Pending' | 'Completed' | 'Failed';

/** AlarmSeverity is sent as a number; names come from /ticket-priorities or /severities. */
export type Severity = number;
/** TicketStatus is sent as a number; names come from /ticket-statuses. */
export type TicketStatus = number;

export interface PagedResult<T> {
  items: T[] | null;
  totalCount: number;
  page: number;
  pageSize: number;
}

// ---- Lookups ----

export interface LookupItem {
  id: number;
  name: string | null;
}

export interface CompressorLookup extends LookupItem {
  brokerId: string | null;
  stationId: number | null;
}

export interface RoleLookup {
  id: string | null;
  name: string | null;
}

export interface AssigneeLookup {
  id: string | null;
  name: string | null;
  email: string | null;
  roles: string[] | null;
}

export interface SeverityLookup {
  name: string | null;
  value: number;
}

/** /ticket-statuses (untyped in Swagger), e.g. { name: "Closed", value: 5, terminal: true }. */
export interface TicketStatusLookup {
  name: string;
  value: number;
  /** Terminal tickets cannot be reopened or edited. */
  terminal: boolean;
}

export interface ParameterLookup {
  id: DispenserParameter;
  name: string | null;
  operator: string | null;
}

// ---- Rules ----

export interface RuleAction {
  actionType: ActionType;
  sortOrder: number;
  isEnabled: boolean;
  /** MaintenanceTicket only. Null inherits the occurrence severity. */
  ticketPriority?: Severity | null;
  /** MaintenanceTicket only. Null means unassigned. */
  assignedToUserId?: string | null;
  /** Email only. */
  emailRecipients?: string[] | null;
}

interface RuleInputBase {
  name: string;
  description?: string | null;
  occurrenceCount: number; // 1..10000
  windowSeconds: number; // 1..86400
  isEnabled: boolean;
  actions: RuleAction[];
}

export interface CompressorRuleInput extends RuleInputBase {
  compressorId: number;
  classNameId: number;
}

export interface DispenserRuleInput extends RuleInputBase {
  parameter: DispenserParameter;
  thresholdValue: number;
  severity: Severity;
  stationScope: StationScope;
  /** Single: exactly 1, Multiple: at least 2 distinct, All: empty. */
  stationIds: number[];
}

export interface RuleResponse {
  id: number;
  name: string;
  description: string | null;
  occurrenceCount: number;
  windowSeconds: number;
  isEnabled: boolean;
  actions: RuleAction[] | null;
  sourceType: SourceType;
  revision: number;
  // Compressor
  compressorId: number | null;
  compressorName: string | null;
  classNameId: number | null;
  className: string | null;
  // Dispenser
  parameter: DispenserParameter;
  thresholdValue: number | null;
  severity: Severity;
  severitySource: string | null;
  stationScope: StationScope;
  stationIds: number[] | null;
}

// ---- Alarms & occurrences ----

export interface SystemCompressorAlarm {
  id: number;
  compressorId: string | null;
  className: string | null;
  name: string | null;
  flag: number;
  stationId: number | null;
  stationName: string | null;
  timeStamp: string;
}

export interface DispenserAlarm {
  id: number;
  alarmSettingId: number | null;
  occurrenceId: string | null;
  stationId: number | null;
  stationName: string | null;
  despId: string | null;
  alarmName: string | null;
  severity: string | null;
  status: string | null;
  triggeredValue: number | null;
  triggeredAtUtc: string | null;
  clearedAtUtc: string | null;
  maintenanceRequestId: number | null;
}

export interface Occurrence {
  id: string;
  alarmSettingId: number;
  sourceType: SourceType;
  ruleName: string | null;
  deviceKey: string | null;
  stationId: number;
  stationName: string | null;
  sourceAlarmName: string | null;
  sourceAlarmFlag: number | null;
  severity: string | null;
  triggeredValue: number | null;
  matchingCount: number;
  occurredAtUtc: string;
  clearedAtUtc: string | null;
}

export interface ActionDelivery {
  id: number;
  occurrenceId: string;
  actionType: ActionType;
  sortOrder: number;
  status: DeliveryStatus;
  attempts: number;
  nextAttemptAtUtc: string;
  completedAtUtc: string | null;
  lastError: string | null;
}

// ---- Maintenance requests (tickets) ----

export interface MaintenanceRequest {
  id: number;
  sourceType: SourceType;
  alarmSettingId: number | null;
  occurrenceId: string | null;
  stationId: number | null;
  stationName: string | null;
  deviceKey: string | null;
  description: string | null;
  status: TicketStatus;
  priority: Severity;
  assignedToUserId: string | null;
  openedAt: string | null;
  closedAtUtc: string | null;
  dueDate: string | null;
  /** Base64; send back unchanged on PUT. A stale value returns 409. */
  rowVersion: string | null;
}

export interface TicketUpdateInput {
  rowVersion: string;
  status: TicketStatus;
  priority: Severity;
  assignedToUserId: string | null;
  description: string | null;
  dueDate: string | null;
}
