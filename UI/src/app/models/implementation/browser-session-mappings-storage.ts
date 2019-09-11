import { Injectable } from '@angular/core';
import { isString, isObject } from 'src/app/infrastructure/utility';
import {
  compressObjectToString,
  decompressStringToObject
} from 'src/app/infrastructure/text-utility';
import { IMappingsStorage } from '../interface/mappings-storage';
import { Configuration } from '../configuration';

@Injectable()
export class BrowserSessionStorage implements IMappingsStorage {
  configuration: any;

  constructor() {
    this.configuration = {};

    this.get('mappings').then(configuration => {
      this.configuration = configuration;
    }).catch(error => console.log(error));
  }

  save(mapping: Configuration) {
    this.configuration[mapping.name] = mapping;

    this.add('mappings', this.configuration);
  }

  open(name: string): Configuration {
    return Object.setPrototypeOf(this.configuration[name], Configuration.prototype);
  }

  add(key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let prepareValue = '';
        if (isString(value)) {
          prepareValue = value;
        } else if (isObject(value)) {
          prepareValue = compressObjectToString(value);
        }

        if (sessionStorage.getItem(key)) {
          this.remove(key);
          sessionStorage.setItem(key, prepareValue); // update
        } else {
          sessionStorage.setItem(key, prepareValue);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  get(key): Promise<any> {
    return new Promise((resolve, reject) => {
      const value = sessionStorage.getItem(key);

      if (value) {
        try {
          const configText = decompressStringToObject(value);
          const parsed = JSON.parse(configText);
          resolve(parsed);
        } catch (error) {
          try {
            resolve(JSON.parse(value));
          } catch (error) {
            resolve(value);
          }
        }
      } else {
        reject('storage has no saved reports');
      }
    });
  }

  remove(key: string): void {
    // Check if key exists
    sessionStorage.removeItem(key);
  }
}
