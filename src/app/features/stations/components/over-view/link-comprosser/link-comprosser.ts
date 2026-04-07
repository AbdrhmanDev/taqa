import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StationDetails } from '../../../service/station-details';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-link-comprosser',
  imports: [DialogModule, SelectModule, FormsModule, CommonModule],
  templateUrl: './link-comprosser.html',
  styleUrl: './link-comprosser.scss',
})
export class LinkComprosser {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirmLink = new EventEmitter<any>();

  @Input() availableCompressors: any[] = [];
  @Input() availableAssets: any[] = [];
  comproserId!: number;
  selectedCompressor: any = null;
  selectedAsset: any = null;
  reason: string = '';
  allComprosers: any[] = [];
  stationId!: number;
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
  }
  isFormValid(): boolean {
    return !!(this.selectedCompressor && this.selectedAsset);
  }
  onGetComproser() {
    this.stationDetails.getComroserById(this.comproserId).subscribe({
      next: (res) => {
        this.allComprosers = [res];
        console.log('Compressor details:', this.allComprosers);
      },
      error: (err) => {},
    });
  }
  confirmLink() {
    if (this.isFormValid()) {
      this.onConfirmLink.emit({
        compressor: this.selectedCompressor,
        asset: this.selectedAsset,
        reason: this.reason,
      });
      this.resetForm();
      this.visibleChange.emit(false);
    }
  }

  resetForm() {
    this.selectedCompressor = null;
    this.selectedAsset = null;
    this.reason = '';
  }
}
