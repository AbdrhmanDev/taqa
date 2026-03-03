import { TestBed } from '@angular/core/testing';

import { TechOpsRealtime } from './tech-ops-realtime';

describe('TechOpsRealtime', () => {
  let service: TechOpsRealtime;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TechOpsRealtime);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
