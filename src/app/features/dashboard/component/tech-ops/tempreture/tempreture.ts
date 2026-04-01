import { Component, Input, SimpleChanges } from '@angular/core';
import { Sensor } from '../../../../stations/model/sensor';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-tempreture',
  imports: [CommonModule, FormsModule],
  templateUrl: './tempreture.html',
  styleUrl: './tempreture.scss',
})
export class Tempreture {
  @Input() station: any;
  sensors: Sensor[] = [];
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }
  readonly minTemp = 51;
  readonly maxTemp = 392;
  isInvalidValue(value: any): boolean {
    return value === null || value === undefined || value === 0 || value === -1;
  }
  // convert the stations data to array , ex {label: 'Stage 1', value: 155}
  get stages() {
    if (!this.station) return [];
    return [1, 2, 3, 4, 5, 6].map((i) => ({
      label: `Stage ${i}`,
      value: this.station[`stage${i}_Temprature`] ?? null,
    }));
  }
  // convert temprature value to fill ratio between 0 and 1, 0 -> 0% , 150 -> 50% , 300 -> 100%
  getFillRatio(value: number | null): number {
    if (value === null || value === undefined) return 0;
    return Math.min(Math.max((value - this.minTemp) / (this.maxTemp - this.minTemp), 0), 1);
  }
  // ui
  getFillHeight(value: number | null): number {
    return this.getFillRatio(value) * 43;
  }

  getFillY(value: number | null): number {
    return 78 - this.getFillHeight(value);
  }

  getColor(value: number | null): string {
    if (this.isInvalidValue(value)) return '#DDDDDD';

    const v = value as number;

    if (v >= 51 && v <= 150) return '#09ae30';
    if (v >= 151 && v <= 250) return '#F97316';
    if (v >= 251 && v <= 350) return '#EF4444';
    if (v >= 351 && v <= 392) return '#EF4444';

    return '#DDDDDD';
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['station']) {
      this.cd.detectChanges();
    }
  }
}
