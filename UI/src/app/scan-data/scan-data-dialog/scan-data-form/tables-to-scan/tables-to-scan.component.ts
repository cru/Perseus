import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { TableToScan } from '@models/scan-data/table-to-scan';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConnectionResult } from '@models/scan-data/connection-result';
import { takeUntil } from 'rxjs/operators';
import { ScanParams } from '@models/scan-data/scan-params';
import { BaseComponent } from '@shared/base/base.component';
import { ScanParamsComponent } from './scan-params/scan-params.component';

@Component({
  selector: 'app-tables-to-scan',
  templateUrl: './tables-to-scan.component.html',
  styleUrls: [
    './tables-to-scan.component.scss',
    '../../../styles/scan-data-step.scss',
    '../../../styles/scan-data-normalize.scss',
    '../../../styles/scan-data-popup.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablesToScanComponent extends BaseComponent implements OnInit, OnDestroy {

  @Input()
  scanParams: ScanParams;

  @Input()
  tablesToScan: TableToScan[];

  @Input()
  filteredTablesToScan: TableToScan[];

  @Input()
  connectionResult: ConnectionResult;

  showScanParamsPopup = false;

  scanParamsForm: FormGroup;

  @Input()
  searchTableName: string;

  @ViewChild(ScanParamsComponent, {read: ElementRef})
  scanParamsPopup: ElementRef;

  @ViewChild('scanParamsButton')
  scanParamsButton: ElementRef;

  private clickOutsideScanParamsUnsub: () => void;

  constructor(private formBuilder: FormBuilder,
              private renderer: Renderer2,
              private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.initScanParamsForm();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.clickOutsideScanParamsUnsub) {
      this.clickOutsideScanParamsUnsub();
    }
  }

  onCheckTable(checkedTable: TableToScan): void {
    this.filteredTablesToScan = this.filteredTablesToScan
      .map(table => table.tableName === checkedTable.tableName ?
        this.changeValueInAllTablesAndReturn(checkedTable) : table
      );
  }

  onSelectAll(): void {
    this.filteredTablesToScan = this.filteredTablesToScan
      .map(table => !table.selected ?
        this.changeValueInAllTablesAndReturn({tableName: table.tableName, selected: true}) : table
      );
  }

  onDeselectAll(): void {
    this.filteredTablesToScan = this.filteredTablesToScan
      .map(table => table.selected ?
        this.changeValueInAllTablesAndReturn({tableName: table.tableName, selected: false}) : table
      );
  }

  onSearchByTableName(value: string) {
    this.searchTableName = value;
    const name = this.searchTableName.toLowerCase();
    this.filteredTablesToScan = this.tablesToScan.filter(table => table.tableName
      .toLowerCase()
      .includes(name)
    );
  }

  onShowScanParams() {
    if (this.showScanParamsPopup) {
      this.unsubOnClickOutsideScanParams();
      this.showScanParamsPopup = false;
    } else {
      this.showScanParamsPopup = true;
      this.clickOutsideScanParamsUnsub = this.renderer.listen('document', 'click', event => {
        const notClickedInside = !this.scanParamsPopup.nativeElement.contains(event.target);
        const notClickedScanParamsButton = !this.scanParamsButton.nativeElement.contains(event.target);
        const dropdown = document.querySelector('.mat-select-panel');

        if (notClickedInside && notClickedScanParamsButton && dropdown === null) {
          this.showScanParamsPopup = false;
          this.unsubOnClickOutsideScanParams();
          this.cdr.detectChanges();
        }
      });
    }
  }

  reset(): void {
    this.searchTableName = '';
  }

  private initScanParamsForm(): void {
    const {sampleSize, scanValues, minCellCount, maxValues, calculateNumericStats, numericStatsSamplerSize} = this.scanParams;

    this.scanParamsForm = this.formBuilder.group({
      sampleSize: {value: sampleSize, disabled: !scanValues},
      scanValues,
      minCellCount: {value: minCellCount, disabled: !scanValues},
      maxValues: {value: maxValues, disabled: !scanValues},
      calculateNumericStats,
      numericStatsSamplerSize: {value: numericStatsSamplerSize, disabled: !calculateNumericStats}
    });

    this.scanParamsForm.get('calculateNumericStats').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(value => value ?
        this.scanParamsForm.get('numericStatsSamplerSize').enable() : this.scanParamsForm.get('numericStatsSamplerSize').disable());

    const controlsDependentOnScanValues = ['sampleSize', 'minCellCount', 'maxValues'];
    this.scanParamsForm.get('scanValues').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(value => {
        if (value) {
          controlsDependentOnScanValues.forEach(controlName =>
            this.scanParamsForm.get(controlName).enable()
          );
        } else {
          controlsDependentOnScanValues.forEach(control =>
            this.scanParamsForm.get(control).disable()
          );
        }
      });
  }

  private changeValueInAllTablesAndReturn(newValue: TableToScan): TableToScan {
    this.tablesToScan = this.tablesToScan
      .map(table => table.tableName === newValue.tableName ? newValue : table);
    return newValue;
  }

  private unsubOnClickOutsideScanParams() {
    this.clickOutsideScanParamsUnsub();
    this.clickOutsideScanParamsUnsub = null;
  }
}
