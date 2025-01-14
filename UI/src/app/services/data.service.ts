import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Row, RowOptions } from 'src/app/models/row';
import { ITableOptions, Table } from 'src/app/models/table';
import { Mapping } from '@models/mapping';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { BridgeService } from './bridge.service';
import { removeExtension } from '@utils/file';
import { ColumnInfo } from '@models/column-info/column-info';
import { State } from '@models/state';
import { COLUMNS_TO_EXCLUDE_FROM_TARGET } from '@app/app.constants';

@Injectable()
export class DataService {
  batch = [];

  constructor(
    private httpService: HttpService,
    private storeService: StoreService,
    private bridgeService: BridgeService
  ) {
  }

  _normalize(data, area) {
    const tables = [];
    const uniqueIdentifierFields = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const id = i;
      const name = item.table_name.toLowerCase();
      const rows = [];

      for (let j = 0; j < item.column_list.length; j++) {
        let unique;
        if (area === 'target') {
          const upperCaseColumnName = item.column_list[j].column_name.toUpperCase();
          unique = upperCaseColumnName.indexOf('_ID') !== -1 && upperCaseColumnName.replace('_ID', '') === item.table_name.toUpperCase();
          if (unique) {
            uniqueIdentifierFields.push(upperCaseColumnName);
          }
        }
        const rowOptions: RowOptions = {
          id: j,
          tableId: i,
          tableName: item.table_name.toLowerCase(),
          name: item.column_list[j].column_name,
          type: item.column_list[j].column_type,
          isNullable: item.column_list[j].is_column_nullable ?
            item.column_list[j].is_column_nullable.toUpperCase() === 'YES' : true,
          comments: [],
          uniqueIdentifier: unique,
          area
        };

        const row = new Row(rowOptions);

        rows.push(row);
      }

      const tableOptions: ITableOptions = {
        id,
        area,
        name,
        rows
      };

      tables.push(new Table(tableOptions));
    }

    if (area === 'target') {
      const IsUniqueIdentifierRow = (row) => uniqueIdentifierFields.includes(row.name.toUpperCase());
      this.bridgeService.updateRowsProperties(tables, IsUniqueIdentifierRow, (row: any) => { row.uniqueIdentifier = true; });
    }

    return tables;
  }

  getZippedXml(mapping: Mapping): Observable<any> {
    const reportName = removeExtension(this.storeService.state.report) ?? 'mapping'
    return this.getXmlPreview(mapping)
      .pipe(
        switchMap(() => this.httpService.getZipXml(reportName))
      )
  }

  getXmlPreview(mapping: Mapping): Observable<any> {
    return this.httpService.getXmlPreview(mapping);
  }

  getSqlPreview(sourceTable: string): Observable<any> {
    return this.httpService.getSqlPreview(sourceTable);
  }

  getCDMVersions() {
    return this.httpService.getCDMVersions();
  }

  getTargetData(version) {
    return this.httpService.getTargetData(version).pipe(
      map(data => {
        const filteredData = data.filter(it => !COLUMNS_TO_EXCLUDE_FROM_TARGET.includes(it.table_name.toUpperCase()));
        const tables = this.prepareTables(filteredData, 'target');
        this.storeService.add('version', version);
        this.prepareTargetConfig(filteredData);
        return tables;
      })
    );
  }

  getSourceSchema(path) {
    return this.httpService.getSourceSchema(path).pipe(
      map(data => this.prepareTables(data, 'source'))
    );
  }

  getSourceSchemaData(name: string): Observable<any> {
    return this.httpService.getSourceSchemaData(name).pipe(
      map(data => this.prepareTables(data, 'source'))
    );
  }

  getColumnInfo(reportName: string, tableName: string, columnName: string): Observable<ColumnInfo> {
    return this.httpService.getColumnInfo(reportName, tableName, columnName)
      .pipe(
        map(info => {
          if (info.top_10[info.top_10.length - 1] === 'List truncated...') {
            info.top_10.pop();
          }

          return {
            name: info.Field,
            type: info.Type,
            uniqueValues: info['N unique values'],
            topValues: info.percentage
              .map((percentage, index) => ({
                value: info.top_10[index],
                frequency: info.frequency[index],
                percentage
              }))
          };
        })
      );
  }

  saveSourceSchemaToDb(sourceTables: any): Observable<any> {
    return this.httpService.saveSourceSchemaToDb(sourceTables);
  }

  getView(sql: any): Observable<any> {
    return this.httpService.getView(sql);
  }

  prepareTargetConfig(data) {

    const targetConfig = {};
    data.map(table => {
      const tableName = table.table_name.toLowerCase();
      targetConfig[ tableName ] = {
        name: `target-${tableName}`,
        first: tableName,
        data: [ tableName ]
      };
    });

    this.storeService.add('targetConfig', targetConfig);
  }

  prepareTables(data, key: keyof State) {
    const tables = this._normalize(data, key);
    this.storeService.add(key, tables);
    return tables;
  }

  saveReportName(data, key) {
    this.storeService.add(key, data);
  }
}
