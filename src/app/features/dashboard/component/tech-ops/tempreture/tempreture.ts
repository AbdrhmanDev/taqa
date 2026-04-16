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

  get dispenserGroups(): any[] {
    if (!this.station?.dispensers) return [];

    const groupMap = new Map<string, any>();

    for (const d of this.station.dispensers) {
      const parts = d.despId.split('_');
      // AUC02_1_01 → parts = ['AUC02', '1', '01']
      const groupId = parts.slice(0, 2).join('_'); // 'AUC02_1'
      const nozzleNum = parts[2]; // '01' or '02'
      const side: 'Left' | 'Right' = nozzleNum === '01' ? 'Left' : 'Right';

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          groupId,
          left: null,
          right: null,
          maxValue: 0,
        });
      }

      const group = groupMap.get(groupId)!;
      const nozzle: any = { label: d.despId, value: d.gasVolumeSold, side };

      if (side === 'Left') group.left = nozzle;
      else group.right = nozzle;

      group.maxValue = Math.max(group.maxValue, d.gasVolumeSold);
    }

    return Array.from(groupMap.values());
  }

  getFillPercentage(value: number, maxValue: number): number {
    if (!maxValue) return 0;
    return Math.min(Math.max((value / maxValue) * 100, 0), 100);
  }

  readonly barIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // From top (0) to bottom (9)

  getBars(value: number, maxValue: number) {
    if (!maxValue) return this.barIndices.map(() => false);
    const filledCount = Math.round((value / maxValue) * 10);
    return this.barIndices.map((i) => (9 - i) < filledCount);
  }

  getBarClass(index: number, active: boolean): string {
    if (!active) return 'bg-gray-200 opacity-20';

    const level = 9 - index; // 0 is bottom, 9 is top
    if (level < 2) return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'; // 0-20% Blue
    if (level < 5) return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'; // 20-50% Green
    if (level < 8) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]'; // 50-80% Yellow
    return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'; // 80-100% Red
  }
}
