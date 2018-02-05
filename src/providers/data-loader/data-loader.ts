import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';


// User and PhotoPost data modelling and smart provider to make the data available to modules that implement.
// Documentation and Type safety benefits.
interface User {
  // userID?: string,   // email should be a unique identifier.
  email: string,
  firstName: string,
  lastName: string
  // PhotoPostCollection // simplify test user and photo collection.
}

/*
  Generated class for the DataLoaderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
/**
 * The DataLoaderProvider provider is responsible for loading json and file data into the requisite
 * data model to make the user, photo and post info available to the app.
 *
 * @export
 * @class DataLoaderProvider
/**
 * For the basic user and photocollection .json
 *
 * @export
 * @class DataLoaderProvider
 */
@Injectable()
export class DataLoaderProvider {

  constructor(public http: HttpClient) {
    console.log('Hello DataLoaderProvider Provider');
  }

}
