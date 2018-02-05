import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Transfer, TransferObject, FileUploadOptions } from '@ionic-native/transfer';
import { ActionSheetController, Loading, LoadingController, NavController, Platform, ToastController, ActionSheetOptions } from 'ionic-angular';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer';

declare const cordova;

export const SERVER_URL = "http://192.168.0.2/";
export const PHOTO_UPLOAD_URL = SERVER_URL + "upload.php";
export const PHOTO_FOLDER_URL = SERVER_URL + "uploads/";  // For simple retrieve of photo files.

/* - TODO: Replace inefficient web calls with a library or proper database..
 * Use of .json just for practice and able to store in local file.json / compatibility.
 */

//  Could probably have separate class to represent photo data behaviour, but so many useful utility
// functions can be used regardless.
export interface MyPhoto {



}


/**
 *
 *
 * @export
 * @class HomePage
 */
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  lastImage: string = null;
  loading: Loading;

  constructor(public navCtrl: NavController,
    public camera: Camera,
    public file: File, public filePath: FilePath,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public transfer: Transfer, public fileTransfer: FileTransfer
  ) {


  }

  // inefficient recreating options each time.
  public presentActionSheet() {
    const actionSheetOptions: ActionSheetOptions = {
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }
    const actionSheet = this.actionSheetCtrl.create(actionSheetOptions);
    actionSheet.present();
  }

  /**
   * sourcetype camera photolibrary savephotoalbum.
   *
   * @param {any} sourceType
   * @memberof HomePage
   */
  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    const options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,   // image as base64 or file uri
      allowEdit: false,

      // - TEST Keep image manageable size for testing. no 20 megabyte uploads, please.
      targetWidth: 400,
      targetHeight: 600,

    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            const currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }

  // Create a new name for the image
  private createFileName() {
    const d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(sourceFilePath, currentName, newFileName) {
    this.file.copyFile(sourceFilePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  private presentToast(text) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  // Get platform-correct path to app data folder.
  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

  public uploadImage() {
    // Destination URL
    const url = PHOTO_UPLOAD_URL;

    // File for Upload
    const targetPath = this.pathForImage(this.lastImage);

    // File name only
    const filename = this.lastImage;

    const options: FileUploadOptions = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': filename },
      httpMethod: 'POST'
    };

    const fileTransfer: FileTransferObject = this.fileTransfer.create();

    this.loading = this.loadingCtrl.create({
      content: 'Uploading...',
    });
    this.loading.present();

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options)
      .then(data => {
        this.loading.dismissAll()
        this.presentToast('Image successfully uploaded.');
        console.log("Image uploaded", data);

      }, err => {
        this.loading.dismissAll()
        this.presentToast('Error while uploading file.');
        console.log("Upload error", err);
      });
  }


}



