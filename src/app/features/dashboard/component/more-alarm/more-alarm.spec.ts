import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreAlarm } from './more-alarm';

describe('MoreAlarm', () => {
  let component: MoreAlarm;
  let fixture: ComponentFixture<MoreAlarm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoreAlarm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoreAlarm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
