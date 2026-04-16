import { ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AllStation } from '../../service/all-station';
import { StationDetails } from '../../service/station-details';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeStationDetails } from '../../service/realtime-station-details';
import { Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DispenserHistory } from './dispenser-history/dispenser-history';
@Component({
  selector: 'app-dispensers',
  imports: [
    TabsModule,
    SelectModule,
    DatePickerModule,
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    DispenserHistory,
  ],
  templateUrl: './dispensers.html',
  styleUrl: './dispensers.scss',
})
export class Dispensers implements OnInit {
  @Input() stationId!: number;
  @Output() connectionReady = new EventEmitter<void>(); // Keep for compatibility
  @Input() stations: any;
  allDispensers: any[] = [];
  status: string = '';
  private subscription!: Subscription;
  DispenserDetails!: any;
  isLoading: boolean = true;
  selectedStatus: string = '';
  filteredDispensers: any[] = [];
  machineId: any;
  dispenserNo: any;
  paramName: any;
  timeFrom: any;
  date: any;
  timeTo: any;
  intervalMinutes: any;
  dialogVisible = false;
  selectedMachineId: any;
  selectedDispenserNo: any;
  selectedParamName: any;
  constructor(
    private _stationDetails: StationDetails,
    private _Router: Router,
    private activateRoute: ActivatedRoute,
    private realTime: RealtimeStationDetails,

    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.subscribeToRealtimeData();
  }

  ngOnChanges(changes: SimpleChanges): void {}
  allStatus: any[] = [
    { label: 'Online', value: 'Online' },
    { label: 'Offline', value: 'Offline' },
  ];
  getAllDispensers() {
    this._stationDetails.getDispenserById(this.stationId).subscribe({
      next: (res) => {
        console.log(res);
        this.allDispensers = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  subscribeToRealtimeData() {
    this.isLoading = true;
    this.subscription = this.realTime.getDispenserDetails().subscribe({
      next: (data) => {
        if (data) {
          if (this.allDispensers && this.allDispensers.length > 0) {
            this.detectDataChanges(data);
          }
          this.DispenserDetails = data;
          this.allDispensers = data;
          if (this.selectedStatus) {
            this.filterDispensers();
          } else {
            this.filteredDispensers = data;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error(err),
    });
  }
  getComputedStatus(dispenser: any): string {
    if (!dispenser.lastTimeStamp) return 'Offline';

    const lastTime = new Date(dispenser.lastTimeStamp).getTime();
    const now = new Date().getTime();

    const diffInHours = (now - lastTime) / (1000 * 60 * 60);

    return diffInHours <= 3 ? 'Online' : 'Offline';
  }
  formatTimestamp(isoString: string): string {
    if (!isoString) return '--:--:---- -- --';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${hours}:${minutes}:${seconds} ${year}-${month}-${day}`;
    } catch {
      return isoString;
    }
  }
  filterDispensers() {
    if (!this.selectedStatus) {
      this.filteredDispensers = this.DispenserDetails;
    } else {
      this.filteredDispensers = this.DispenserDetails.filter(
        (d: any) => d.status === this.selectedStatus,
      );
    }
  }

  detectDataChanges(newData: any[]) {
    newData.forEach((newDisp) => {
      const oldDisp = this.allDispensers.find((d) => d.id === newDisp.id);
      if (oldDisp) {
        // Check Left Nozzle
        if (newDisp.left && oldDisp.left) {
          if (newDisp.left.chargeVolume !== oldDisp.left.chargeVolume)
            newDisp.left.chargeVolumeChanged = true;
          if (newDisp.left.chargingTime !== oldDisp.left.chargingTime)
            newDisp.left.chargingTimeChanged = true;
          if (newDisp.left.throughput !== oldDisp.left.throughput)
            newDisp.left.throughputChanged = true;
          if (newDisp.left.waitingTime !== oldDisp.left.waitingTime)
            newDisp.left.waitingTimeChanged = true;
        }
        // Check Right Nozzle
        if (newDisp.right && oldDisp.right) {
          if (newDisp.right.chargeVolume !== oldDisp.right.chargeVolume)
            newDisp.right.chargeVolumeChanged = true;
          if (newDisp.right.chargingTime !== oldDisp.right.chargingTime)
            newDisp.right.chargingTimeChanged = true;
          if (newDisp.right.throughput !== oldDisp.right.throughput)
            newDisp.right.throughputChanged = true;
          if (newDisp.right.waitingTime !== oldDisp.right.waitingTime)
            newDisp.right.waitingTimeChanged = true;
        }
      }
    });

    // Clear flags after 2.5 seconds (matching CSS animation)
    setTimeout(() => {
      this.clearChangeFlags();
    }, 2500);
  }

  clearChangeFlags() {
    this.allDispensers.forEach((d) => {
      if (d.left) {
        d.left.chargeVolumeChanged = false;
        d.left.chargingTimeChanged = false;
        d.left.throughputChanged = false;
        d.left.waitingTimeChanged = false;
      }
      if (d.right) {
        d.right.chargeVolumeChanged = false;
        d.right.chargingTimeChanged = false;
        d.right.throughputChanged = false;
        d.right.waitingTimeChanged = false;
      }
    });
    this.cdr.detectChanges();
  }

  openDialog(machineId: any, dispenserNo: any, paramName: string) {
    console.log('Opening dialog with:', { machineId, dispenserNo, paramName });

    this.selectedMachineId = machineId;
    this.selectedDispenserNo = dispenserNo;
    this.selectedParamName = paramName;
    this.dialogVisible = true;
  }
  onGetDispenserHistory() {
    this._stationDetails
      .getHistoryDispenser(this.machineId, this.dispenserNo, this.paramName)
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    // Connections managed globally now
  }
}
