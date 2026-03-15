import { TestBed } from '@angular/core/testing';

import { AlarmsStationDetails } from './alarms-station-details';

describe('AlarmsStationDetails', () => {
  let service: AlarmsStationDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlarmsStationDetails);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
