import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Transfer } from '@ionic-native/transfer';
import {
  ActionSheet,
  ActionSheetButton,
  ActionSheetController,
  ActionSheetOptions,
  Loading,
  LoadingController,
  NavController,
  Platform,
  Toast,
  ToastController,
} from 'ionic-angular';

declare const cordova;

export const SERVER_URL = "http://192.168.0.2/";
export const PHOTO_UPLOAD_URL = SERVER_URL + "upload.php";
export const PHOTO_FOLDER_URL = SERVER_URL + "uploads/";  // For simple retrieve of photo files.

/* - TODO: Replace inefficient web calls with a library or proper database..
 * Use of .json just for practice and able to store in local file.json / compatibility.
 */

//  Could probably have separate class to represent photo data behaviour, but so many useful utility
// functions can be used regardless.
/**
 * @param id? a
 * @param title
 * @param description?
 * @param photo?
 * @param timestampCreated
 *
 * @interface PhotoPost
 */
interface PhotoPost {
  id?,
  title: string,
  description?: string,
  photo?: any            // test URI or base64 for icon and then expand to full image
  timestampCreated: Date,
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
  lastImage: string = null; // - FIXME: MyPhoto
  loading: Loading;
  cameraActionSheet: ActionSheet
  constructor(public navCtrl: NavController,
    public camera: Camera,
    public file: File, public filePath: FilePath,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public transfer: Transfer, public fileTransfer: FileTransfer
  ) {
    //

    this.presentToast("Hello");
    this.prepareCameraActionSheet(this.camera, this.actionSheetCtrl);
  }

  ionViewDidLoad() {
    //
    this.presentToast("IonViewDIdLoad");
    this.platform.ready()
      .then(platformReadySource => {
        console.log("READY");
        this.debugTestLogToastToastToast("READY");
      }, error => {
        this.debugTestLogToastToastToast("PLATFORM READY ERROR" + error.toString());
      });

  }
  /**
   *
   *
   * @param {Camera} camera
   * @returns {ActionSheetOptions}
   * @memberof HomePage
   */
  getCameraSheetOptions(camera: Camera): ActionSheetOptions {
    this.presentToast("Hell1o");

    // Picture button set up for Camera. test.
    const getPictureButton = (buttonText, sourceType) => {
      const button = {
        text: buttonText,
        handler: () => { this.takePicture(sourceType) }
      };
      return button;
    }

    const photoLibraryButton: ActionSheetButton = getPictureButton("Load photo from the device library", camera.PictureSourceType.PHOTOLIBRARY);
    const photoCameraButton: ActionSheetButton = getPictureButton("Capture a photo from the camera", camera.PictureSourceType.CAMERA)
    const cancelButton: ActionSheetButton = {
      text: "Cancel",
      role: "cancel"
    }

    const camActionSheetOptions: ActionSheetOptions = {
      title: "Select image  source",
      buttons: [
        photoLibraryButton,
        photoCameraButton,
        cancelButton
      ]
    }

    return camActionSheetOptions;
  }

  /**
   *
   *
   * @param {Camera} camera
   * @returns {ActionSheet}
   * @memberof HomePage
   */
  prepareCameraActionSheet( camera: Camera, actionSheetCtrl: ActionSheetController) {
    this.presentToast("Hello2");

    this.debugTestLogToastToastToast("opt");
    const camActionSheetOptions: ActionSheetOptions = this.getCameraSheetOptions(camera);
    this.debugTestLogToastToastToast("create");
    const camActionSheet: ActionSheet = this.actionSheetCtrl.create(camActionSheetOptions);

    // modifies the page's actionsheet; // impure function
    // prepares the page actionsheet.
    this.cameraActionSheet = camActionSheet;

    return camActionSheet;
  }

  //   export interface ActionSheetOptions {
  //     title?: string;
  //     subTitle?: string;
  //     cssClass?: string;
  //     buttons?: (ActionSheetButton | string)[];
  //     enableBackdropDismiss?: boolean;
  // }
  // export interface ActionSheetButton {
  //     text?: string;
  //     role?: string;
  //     icon?: string;
  //     cssClass?: string;
  //     handler?: () => boolean | void;
  // }

  takePicture(sourceType) {
    const camOptions: CameraOptions = {
      quality: 98,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      allowEdit: false,

      // Make images more manageable for testing. ~file size~dimensions~.
      targetWidth: 400,
      targetHeight: 600
    }

    this.camera.getPicture(camOptions)
      .then((imageFilePathURI) => {
        this.debugTestLogToastToastToast(imageFilePathURI);
        this.filePath.resolveNativePath(imageFilePathURI)
      }, (err) => {

      });

  }

  debugTestLogToastToastToast(string: string) {
    console.log("dtlttt::", string);
    this.presentToast(string);
  }
  presentToast(text) {
    const toast: Toast = this.toastCtrl.create({
      message: text,
      duration: 2500,
      position: "top"
    });
    toast.present();
  }


  presentActionSheet() {
    this.cameraActionSheet.present();
  }


  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

}


