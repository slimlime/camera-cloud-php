import { CameraAccessProvider } from './../../providers/camera-access/camera-access';
import { Component } from '@angular/core';
import { NavController, NavParams, Slides, normalizeURL } from 'ionic-angular';
import { Entry } from '@ionic-native/file';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  normalizedUrl: string = "";

  constructor(public cameraProvider: CameraAccessProvider) {
    this.normalizedUrl = "";
  }

  /** function to takePicture */
  getImage() {
    this.cameraProvider.transferImage()
      .then((res: string) => this.cameraProvider.createFileEntry(res))
      .then((entry: Entry) => {this.normalizedUrl = normalizeURL(entry.nativeURL); 
        console.log(entry);
        console.log(this.normalizedUrl);
      });
  }
}