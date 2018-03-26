import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Phost } from './../../providers/photo-server-handler/photo-server-handler';

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataCallback } from '../home/home';

/**
 * Generated class for the PostDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-post-detail',
  templateUrl: 'post-detail.html',
})
export class PostDetailPage {
  data: Phost;
  masterCallback: DataCallback;
  keys; 
  imgSrc: SafeResourceUrl = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public domSanitizer: DomSanitizer) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PostDetailPage');
    this.loadDetailsData();
  }
  loadDetailsData() {
    this.data = this.navParams.get('data') || [];
    this.masterCallback = this.navParams.get('callback');
    this.keys = Object.keys(this.data);
    // this.printOutDataReceived();
    
  }
  printOutDataReceived() {
    const dataa = this.navParams.get('data') || [];
    const keyys = Object.keys(dataa);
    for (let i in keyys) {
      console.log("PhotopostDetailFound::", keyys[i], dataa[keyys[i]]);
    }
  }
  // Submit data and pop back to the previous page.
  submitDetailsToPageCallback() {
    this.masterCallback(this.data)
      .then((res) => {
        console.log(":PostDetail: Submitted details data", this.data, res);
      });
  }
  submitDetailsAndPop(){
    this.masterCallback(this.data)
    .then((res) => {
      console.log(":PostDetail: Submitted details data", this.data, res); // - FIXME cascade promise return properly.
    });
    this.navCtrl.pop();
  }
  loadSanitisedBase64ImageUrl(data_url: string) {
    const base64jpgPrefix = "data:image/png;base64, ";
    console.log("data URL leadingtrailing", data_url.slice(0, 20), data_url.slice(data_url.length - 20));
    this.imgSrc = this.domSanitizer.bypassSecurityTrustUrl((base64jpgPrefix + data_url));
    console.log("sanitized", this.imgSrc);
}
  ionViewDidLeave(){
    this.submitDetailsToPageCallback();
  }
  pass() {
    console.log("pass");
  }
}
