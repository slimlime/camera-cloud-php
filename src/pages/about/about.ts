import { Camera } from '@ionic-native/camera';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  imageSrc: string;

  constructor(public navCtrl: NavController,
    public camera: Camera) {

  }


  openGallery (): void {
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,      
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG,      
      correctOrientation: true
    }
  
    this.camera.getPicture(cameraOptions)
      .then(file_uri => {
        this.imageSrc = file_uri;
        console.log(this.imageSrc); // file:///storage/emulated/0/Android/data/io.ionic.starter/cache/IMG_20180323_155959.jpg?1521801512948 works only with livereload disabled.
        // this.imageSrc = this.imageSrc.replace(/^file:\/\//, ''); // may help in iOS case. unclear in testing.
      }, 
      err => console.log(err));   
  }


}
