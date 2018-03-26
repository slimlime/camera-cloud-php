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
  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PostDetailPage');
    this.loadDetailsData();
  }
  loadDetailsData() {
    this.data = this.navParams.get('data') || [];
    this.masterCallback = this.navParams.get('callback');
    this.keys = Object.keys(this.data);
    const lol = this.data[this.keys[0]];
    console.log(lol, lol, lol, lol, lol);
    
  }

  // Submit data and pop back to the previous page.
  submitDetailsToPageCallback() {
    this.masterCallback(this.data)
      .then((res) => {
        console.log(":PostDetail: Submitted details data", this.data, res);
        this.navCtrl.pop();
      });
  }
  pass() {
    console.log("pass");
  }
}
