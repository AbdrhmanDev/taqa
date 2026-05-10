import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StationDetails } from '../../../service/station-details';
import { ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-link-comprosser',
  imports: [DialogModule, SelectModule, FormsModule, CommonModule, InputTextModule],
  templateUrl: './link-comprosser.html',
  styleUrl: './link-comprosser.scss',
})
export class LinkComprosser {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirmLink = new EventEmitter<any>();

  comproserId!: number;
  selectedCompressor: any = null;
  selectedAsset: any = null;
  reason: string = '';
  allComprosers: any[] = [];
  availableAssets: any[] = [];
  availableStations: any[] = [];
  addAssetVisible: boolean = false;

  newAsset = {
    name: '',
    serialNumber: '',
    stationId: null as number | null,
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private stationDetails: StationDetails,
    private activateRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((params) => {
      this.comproserId = Number(params.get('id'));
    });
    this.onGetComproser();
    this.onGetAvaliableAssets();
    this.onGetAvailableStations();
  }

  isFormValid(): boolean {
    return !!(this.selectedCompressor && this.selectedAsset);
  }

  isNewAssetValid(): boolean {
    return !!(this.newAsset.name && this.newAsset.serialNumber && this.newAsset.stationId);
  }

  onGetComproser() {
    this.stationDetails.getComroserById(this.comproserId).subscribe({
      next: (res) => {
        this.allComprosers = [res];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  onGetAvaliableAssets() {
    this.stationDetails.getAvaliavleAssets().subscribe({
      next: (res) => {
        this.availableAssets = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  onGetAvailableStations() {
    this.stationDetails.getAvailableStations().subscribe({
      next: (res) => {
        this.availableStations = res.items;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  openAddAssetDialog() {
    this.newAsset = { name: '', serialNumber: '', stationId: null };
    this.addAssetVisible = true;
  }

  confirmAddAsset() {
    if (!this.isNewAssetValid()) return;

    const body = {
      name: this.newAsset.name,
      serialNumber: this.newAsset.serialNumber,
      stationId: this.newAsset.stationId!,
    };

    this.stationDetails.addAsset(body).subscribe({
      next: (res) => {
        const newAssetItem = res?.id ? res : { ...body, id: res?.id ?? Date.now() };
        this.availableAssets = [...this.availableAssets, newAssetItem];
        this.selectedAsset = newAssetItem.id;
        this.addAssetVisible = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Add asset error:', err),
    });
  }

  confirmLink() {
    if (!this.isFormValid()) return;

    this.stationDetails.linkComproser(this.selectedCompressor, this.selectedAsset).subscribe({
      next: (res) => {
        this.onConfirmLink.emit({
          compressor: this.selectedCompressor,
          asset: this.selectedAsset,
          reason: this.reason,
        });
        this.resetForm();
        this.visibleChange.emit(false);
      },
      error: (err) => console.error('Link error:', err),
    });
  }

  resetForm() {
    this.selectedCompressor = null;
    this.selectedAsset = null;
    this.reason = '';
  }
}
