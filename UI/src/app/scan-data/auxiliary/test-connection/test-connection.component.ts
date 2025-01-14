import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConnectionResult } from '@models/scan-data/connection-result';

@Component({
  selector: 'app-test-connection',
  templateUrl: './test-connection.component.html',
  styleUrls: ['./test-connection.component.scss']
})
export class TestConnectionComponent {

  @Input()
  connectionResult: ConnectionResult;

  @Input()
  disabled: boolean;

  @Output()
  testConnection = new EventEmitter<void>();
}
