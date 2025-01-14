import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TableToScan } from '@models/scan-data/table-to-scan';

@Component({
  selector: 'app-table-to-scan',
  templateUrl: './table-to-scan.component.html',
  styleUrls: ['./table-to-scan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableToScanComponent {
  @Output()
  checkTable = new EventEmitter<TableToScan>();

  @Input()
  private table: TableToScan;

  get tableName() {
    return this.table.tableName;
  }

  get selected() {
    return this.table.selected;
  }

  set selected(value: boolean) {
    if (value !== this.table.selected) {
      this.checkTable.emit({tableName: this.table.tableName, selected: value});
    }
  }
}
