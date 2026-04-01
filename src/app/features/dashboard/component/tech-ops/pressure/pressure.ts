import { ChangeDetectorRef, Component, input } from '@angular/core';
import { Input, SimpleChanges } from '@angular/core';
import { Sensor } from '../../../../stations/model/sensor';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pressure',
  imports: [CommonModule],
  templateUrl: './pressure.html',
  styleUrl: './pressure.scss',
})
export class Pressure {
  @Input() station: any;
  sensors: Sensor[] = [];
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}
  readonly minPressure = 0.1;
  readonly maxPressure = 486;
  get stages() {
    if (!this.station) return [];
    return [1, 2, 3, 4, 5, 6].map((i) => ({
      label: `Stage ${i}`,
      value: this.station[`stage${i}_Pressure`] ?? null,
    }));
  }
  isInvalidValue(value: any): boolean {
    return value === null || value === undefined || value === 0 || value === -1;
  }
  getRatio(value: number | null): number {
    if (value === null || value === undefined) return 0;
    return Math.min(
      Math.max((value - this.minPressure) / (this.maxPressure - this.minPressure), 0),
      1,
    );
  }

  getNeedleRotation(value: number | null): number {
    const ratio = this.getRatio(value);
    return -90 + ratio * 180;
  }

  getArcPath(value: number | null): string {
    const ratio = this.getRatio(value);
    if (ratio <= 0) return '';

    const cx = 80,
      cy = 80,
      r = 60;

    const startX = cx - r; // = 20
    const startY = cy; // = 80

    const angleRad = Math.PI - ratio * Math.PI;
    const endX = cx + r * Math.cos(angleRad);
    const endY = cy + r * Math.sin(angleRad);

    const largeArc = ratio > 0.5 ? 1 : 0;

    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  }

  getColor(value: number | null): string {
    if (this.isInvalidValue(value)) return '#DDDDDD';

    const v = value as number;

    if (v >= 0.1 && v <= 50) return '#38d3fa';
    if (v >= 51 && v <= 150) return '#0663f9';
    if (v >= 151 && v <= 300) return '#045ff1';
    if (v >= 301 && v <= 486) return '#010355';

    return '#DDDDDD';
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['station']) {
      this.cd.detectChanges();
    }
  }
}
