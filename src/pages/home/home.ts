import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Entry, File } from '@ionic-native/file';
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
  LoadingOptions,
  NavController,
  Platform,
  Toast,
  ToastController,
  ToastOptions,
} from 'ionic-angular';

import { DataLoaderProvider } from '../../providers/data-loader/data-loader';

declare const cordova;

/* - TODO: Replace inefficient web calls with a library or proper database..
 * Use of .json just for practice and able to store in local file.json / compatibility.
 */


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

  constructor(public navCtrl: NavController,
    public camera: Camera,
    public file: File,
    public filePath: FilePath,
    public fileTransfer: FileTransfer,
    public transfer: Transfer,
    public platform: Platform,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController
  ) {
    //

    this.presentToast("HomePage:: Constructed Hello");

    this.prepareCameraActionSheet(this.camera, this.actionSheetCtrl);
  }

  ionViewDidLoad() {
    //
    console.log("ionViewDidLoad::");
    this.debugLogToastToastToast("ionViewDidLoad::");
    this.platform.ready()
      .then(platformReadySource => {
        this.debugLogToastToastToast("READY");
      }, error => {
        this.debugLogToastToastToast("PLATFORM READY ERROR" + error.toString());
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
    this.debugLogToastToastToast("getCameraSheetOptions::");

    /* Picture button skeleton for button text label and source / destination types.
       Default image destination type to FILE_URI for ease of file transfer.
       Dependent on cordova-plugin-camera functionality.
     */
    // Messing around with JS/TypeScript to make 'reusable'/'unreadable' code...
    const getPictureButton =
      (buttonText: string,
        sourceType: number,
        destinationType: number = camera.DestinationType.FILE_URI
      ) => {
        const button: ActionSheetButton = {
          text: buttonText,
          handler: () => { this.takePicture(sourceType, destinationType) }
        };
        return button;
      }

    // Set up buttons
    const photoLibraryButton: ActionSheetButton = getPictureButton("Load photo from the device library",
      camera.PictureSourceType.PHOTOLIBRARY);
    const photoCameraButton: ActionSheetButton = getPictureButton("Capture a photo from the camera",
      camera.PictureSourceType.CAMERA)
    const cancelButton: ActionSheetButton = {
      text: "Cancel",
      role: "cancel"
    }

    // Configure the camera ActionSheetOptions with the above buttons.
    const camActionSheetOptions: ActionSheetOptions = {
      title: "Select image source",
      buttons: [
        photoLibraryButton,
        photoCameraButton,
        cancelButton
      ]
    }

    return camActionSheetOptions;
  }

  // Note: ActionSheet is destroyed on each use. Need to recreate.
  /**
   *
   *
   * @param {Camera} camera
   * @returns {ActionSheet}
   * @memberof HomePage
   */
  prepareCameraActionSheet(camera: Camera, actionSheetCtrl: ActionSheetController) {
    this.debugLogToastToastToast("prepareCameraActionSheet:: getCameraSheetOptions");
    const camActionSheetOptions: ActionSheetOptions = this.getCameraSheetOptions(camera);
    this.debugLogToastToastToast("prepareCameraActionSheet:: ASController.create()");
    const camActionSheet: ActionSheet = this.actionSheetCtrl.create(camActionSheetOptions);

    // modifies the page's actionsheet; // impure function
    // prepares the page actionsheet.
    this.cameraActionSheet = camActionSheet;

    return camActionSheet;
  }

  /**
   * Gets the camera options for the camera. Determines the image and resultant data type.
   * @param {number} sourceType enum value from cordova-plugin-camera Library, Cam, Album.
   * @param {number} destinationType enum value from cordova-plugin-camera URI, base64.
   * @returns {CameraOptions}
   * @memberof HomePage
   */
  getCameraOptions(sourceType: number, destinationType: number): CameraOptions {
    const camOptions: CameraOptions = {
      quality: 98,
      sourceType: sourceType,
      saveToPhotoAlbum: true,           // - FIXME: debug test
      correctOrientation: true,
      destinationType: destinationType,
      allowEdit: true,                  // - FIXME: debug test

      /* Make images more manageable for testing. ~ file size /
          pre-scaled dimensions.
       */
      targetWidth: 400,
      targetHeight: 600
    };

    return camOptions;
  }

  /**
   *
   *
   * @param {number} sourceType enum value from cordova-plugin-camera Library, Cam, Album.
   * @param {number} destinationType enum value from cordova-plugin-camera URI, base64.
   * @memberof HomePage
   */
  takePicture(sourceType: number, destinationType: number) {
    const camOptions: CameraOptions = this.getCameraOptions(sourceType, destinationType);


  }

  configureUploadingIndicator(loadingController: LoadingController): Loading {
    const loadingOptions: LoadingOptions = {
      content: "Uploading...",
    };

    const uploadingIndicator: Loading = loadingController.create(loadingOptions);
    return uploadingIndicator;
  }



  /**
   *
   *
   * @param {string} debugMessage the main debug message to display.
   * @param {any} optionalParams additional details or objects to pass to console.log();
   * @returns {boolean} debugIsEnabled
   * @memberof HomePage
   */
  debugLogToastToastToast(debugMessage: string, ...optionalParams): boolean {
    // - TODO: Utility class 'global' provider for debug wrapper utility functions.
    const debugFlagIsEnabled: boolean = true;

    if (debugFlagIsEnabled) {
      console.log("dbgLogTTT::", debugMessage, optionalParams);
      // from message string -> options -> toast -> present(toast)
      const toastOptions: ToastOptions = this.getConfiguredToastOptionsWithMessage(debugMessage);
      const toast: Toast = this.createToastWithOptions(toastOptions, this.toastCtrl);
      const toastPromise: Promise<any> = this.presentToast(toast);

      this.presentToast(
        this.createToastWithOptions(
          this.getConfiguredToastOptionsWithMessage(debugMessage), this.toastCtrl
        )
      )
        .then(fin => {
          console.log("fin", fin);
        });

    }
    return debugFlagIsEnabled;
  }

  // - MARK: Toast presentation and preparedness functions...
  /**
   * Convenience wrapper function to prepare and present a toast with the given msg using the
   * ToastController
   *
   * @param {string} message
   * @param {ToastController} toastController
   * @returns {Promise<any>}
   * @memberof HomePage
   */
  presentPreparedToastWithMessage(message: string, toastController: ToastController): Promise<any> {
    // Note: Toast is resolved on each use. Need to recreate.
    const toastedPromise: Promise<any> = this.presentToast(
      this.createToastWithOptions(
        this.getConfiguredToastOptionsWithMessage(message), toastController
      )
    )
      .then(fin => {
        console.log("preparedAndToastedWrapper::", "fin", fin);
      });
    return toastedPromise;
  }

  presentToast(toastToastToast: Toast): Promise<any> {
    return toastToastToast.present();
  }

  createToastWithOptions(toastOptions: ToastOptions, toastController: ToastController) {
    const toast: Toast = toastController.create(toastOptions);
    return toast;
  }


  getConfiguredToastOptionsWithMessage(messageText: string): ToastOptions {
    const toastOptions: ToastOptions = {
      message: messageText,
      duration: 2500,
      position: "top"
    }

    return toastOptions;
  }

  configureToastWithMessage(messageText: string, toastController: ToastController) {
    const toastOptions: ToastOptions = this.getConfiguredToastOptionsWithMessage(messageText);
    const toast: Toast = this.createToastWithOptions(toastOptions, toastController);
  }


  presentCreatedToastWithOptions(toastOptions: ToastOptions, toastController: ToastController): Promise<any> {
    const toast: Toast = this.toastCtrl.create(toastOptions);
    const toastedPromise: Promise<any> = toast.present();
    return toastedPromise;
  }




}


