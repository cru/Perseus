import { Injectable } from '@angular/core';
import { DbSettings } from '@models/scan-data/db-settings';
import { StateService } from '@services/state/state.service';

const initialState: DbSettings = {
  dbType: null,
  server: null,
  port: null,
  database: null,
  schema: null,
  user: null,
  password: null
};

@Injectable()
export class DqdConnectionSettingsStateService implements StateService {

  private dqdState: DbSettings;

  constructor() {
    this.dqdState = {...initialState}
  }

  get state() {
    return this.dqdState;
  }

  set state(value: DbSettings) {
    this.dqdState = value;
  }

  reset() {
    this.state = {...initialState}
  }
}
