import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Entry, File } from '@ionic-native/file';

/*
  Generated class for the CameraAccessProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CameraAccessProvider {

  constructor(public http: HttpClient,
    public file: File,
    public camera: Camera) {
    console.log('Hello CameraAccessProvider Provider');
  }
  // Initial function to take photo and respond with imagePath (since it's FILE_URI)
  transferImage(): Promise<any> {
    let options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG
    }
    return this.camera.getPicture(options)
      .then((imagePath) => imagePath)
      .catch(err => err.message)
  }
  createFileEntry(imagePath: string): Promise<any> {
    let cleansedPath = imagePath.replace(/^.*[\\\/]/, '');
    let d = new Date();
    let t = d.getTime();
    let newFileName: string = t + ".jpg";
    
    return this.file.moveFile(this.file.tempDirectory, cleansedPath, this.file.dataDirectory, newFileName)
      .then((entry: Entry) => entry)
      .catch((err) => err.message)
  }
}
