import { TestBed } from '@angular/core/testing';

import { RealtimeAlarmsDashboard } from './realtime-alarms-dashboard';

describe('RealtimeAlarmsDashboard', () => {
  let service: RealtimeAlarmsDashboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealtimeAlarmsDashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
