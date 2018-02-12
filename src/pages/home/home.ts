import { Component } from '@angular/core';
import { Camera, CameraOptions, DestinationType, PictureSourceType } from '@ionic-native/camera';
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

    this.debugLTTT ("HomePage:: Constructed Hello");

    this.prepareCameraActionSheet(this.camera, this.actionSheetCtrl);
  }

  ionViewDidLoad() {
    //
    console.log("ionViewDidLoad::");
    this.debugLTTT("ionViewDidLoad::");
    this.platform.ready()
      .then(platformReadySource => {
        this.debugLTTT("READY");
      }, error => {
        this.debugLTTT("PLATFORM READY ERROR" + error.toString());
      });

  }

/* Cool type definition but not very nice to maintain. Let's hide all of this complexity!
  getCameraPictureActionSheetButton(buttonText: string,
    sourceType: number,
    destinationType: number,
    clickFunction: (() => boolean | void)): ActionSheetButton {
*/


// - MARK: - UI component presentation and utility functions

// - MARK: ActionSheet setup functions.

/**
 * Utility function to prepare the action sheet photo/camera capture buttons.
 *
 * @param {string} buttonText
 * @param {PictureSourceType} sourceType
 * @param {DestinationType} destinationType
 * @returns {ActionSheetButton} The picture button to add to the camera action sheet.
 * @memberof HomePage
 */
getCameraPictureActionSheetButton(buttonText: string,
                                    sourceType: PictureSourceType,
                                    destinationType: DestinationType): ActionSheetButton {
    //
    // type-safety to make sure it conforms to what the ASButton handler expects.
    type ButtonHandlerFunction = () => boolean | void;

    /* Even more funky stuff.. ignore.
      const clicker = ((a: number, b: number) => {return true});
      const test = () => {return true};
      const funk: ( () => boolean | void) = ( () => true );
      const funkyFunction: ButtonHandlerFunction = ( () => {
        ;{;};  // lol ;{;}; ;_; ;;__;; (-(-_(-_-)_-)-)
      });
    */
    const capturePhotoFunction = this.takePicture(sourceType, destinationType);

    // Cheating the empty parameter passing defined by {ActionSheetButton.handler} by instead
    // passing inside the enclosed function.
    const funkyCapturePhotoFunction: ButtonHandlerFunction = () => {
      this.debugLTTT("getCameraPictureASButton:: funkyFunction source->dest", sourceType, destinationType);
      this.takePicture(sourceType, destinationType);
    };
    // Hide away the complexity of having function type syntax defined by ActionSheetButton.
    const pictureASButton: ActionSheetButton = {
      text: buttonText,
      handler: funkyCapturePhotoFunction
    }
    return pictureASButton;
  }

  /**
   * Sets up the photo capture ActionSheetOptions for camera
   *
   * @param {Camera} camera
   * @returns {ActionSheetOptions}
   * @memberof HomePage
   */
  getCameraSheetOptions(camera: Camera): ActionSheetOptions {
    //
    this.debugLTTT("getCameraSheetOptions::");

    /* Picture button skeleton for button text label and source / destination types.
       Default image destination type to FILE_URI for ease of file transfer.
       Dependent on cordova-plugin-camera functionality.
     */
    // Messing around with JS/TypeScript to make 'reusable'/'unreadable' code...
    /*
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
    */


    // Set up photoLibrary, Camera and cancel buttons
    const photoLibraryButton: ActionSheetButton = this.getCameraPictureActionSheetButton("Load photo from the device library",
      camera.PictureSourceType.PHOTOLIBRARY, camera.DestinationType.FILE_URI);

    const photoCameraButton: ActionSheetButton = this.getCameraPictureActionSheetButton("Capture a photo from the camera",
      camera.PictureSourceType.CAMERA, camera.DestinationType.FILE_URI);

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
  prepareCameraActionSheet(camera: Camera, actionSheetController: ActionSheetController) {
    //
    this.debugLTTT("prepareCameraActionSheet:: getCameraSheetOptions");
    const camActionSheetOptions: ActionSheetOptions = this.getCameraSheetOptions(camera);

    this.debugLTTT("prepareCameraActionSheet:: ASController.create()", camActionSheetOptions);
    const camActionSheet: ActionSheet = actionSheetController.create(camActionSheetOptions);

    return camActionSheet;
  }

  /**
   * Gets the camera options for the camera. Determines the image and resultant data type.
   * @param {PictureSourceType} {number} sourceType enum value from cordova-plugin-camera Library, Cam, Album.
   * @param {DestinationType} {number} destinationType enum value from cordova-plugin-camera URI, base64.
   * @returns {CameraOptions}
   * @memberof HomePage
   */
  getCameraOptions(sourceType: PictureSourceType, destinationType: DestinationType): CameraOptions {
    //
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
   * @param {PictureSourceType} {number} sourceType enum value from cordova-plugin-camera Library, Cam, Album.
   * @param {DestinationType} {number} destinationType enum value from cordova-plugin-camera URI, base64.
   * @memberof HomePage
   */
  takePicture(sourceType: PictureSourceType, destinationType: DestinationType, cameraController: Camera) {
    //
    const camOptions: CameraOptions = this.getCameraOptions(sourceType, destinationType);

    cameraController.getPicture(camOptions)
      .then((imagePath: string) => {
        //
        const [currentName, correctPath] = this.getFileNameAndPathFromCameraFileUri(imagePath);

      });

  }

/**
 *
 *
 * @param {string} imagePath
 * @returns {[string, string]}
 * @memberof HomePage
 */
getFileNameAndPathFromCameraFileUri(imagePath: string): [string, string] {
    //

    // Locate the end of the folder structure chars in path e.g. `dir'/'` in '~/path/to/dir/filename.jpg'
    const trailingDirSymbolIndex = imagePath.lastIndexOf('/');
    // Get the filename index e.g. slice substr at first char 'f' in 'filename.jpg'
    const fileNameStartIndex = trailingDirSymbolIndex + 1;

    // File name and file path.
    const currentName = imagePath.substr(fileNameStartIndex);
    const correctPath = imagePath.substr(0, fileNameStartIndex)

    return [currentName, correctPath]
  }

  copyFileToLocalDirectory(sourceFilePath: string, sourceFileName, newFileName, completionHandler: () => boolean) {


  }


  /**
   * Configures, creates and returns a Loading indicator.
   *
   * @param {LoadingController} loadingController
   * @returns {Loading} indicator ready for UI presentation on object method call.
   * @memberof HomePage
   */
  configureUploadingIndicator(loadingController: LoadingController): Loading {
    //
    const loadingOptions: LoadingOptions = {
      content: "Uploading...",
    };

    const uploadingIndicator: Loading = loadingController.create(loadingOptions);
    return uploadingIndicator;
  }



  /**
   * debugLogToastToastToast(dLTTT) console logs and toasts the given debug details.
   *
   * @param {string} debugMessage the main debug message to display.
   * @param {any} optionalParams additional details or objects to pass to console.log();
   * @returns {boolean} debugIsEnabled
   * @memberof HomePage
   */
  debugLTTT(debugMessage: string, ...optionalParams): boolean {
    // - TODO: Utility class 'global' provider for debug wrapper utility functions.
    const debugFlagIsEnabled: boolean = true;

    if (debugFlagIsEnabled) {
      console.log("dbgLogTTT::", debugMessage, optionalParams);
      // from message string -> options -> toast -> present(toast)
      const toastOptions: ToastOptions = this.getConfiguredToastOptionsFromMessage(debugMessage);
      const toast: Toast = this.createToastWithOptions(toastOptions, this.toastCtrl);
      const toastPromise: Promise<any> = this.presentToast(toast);
      // - FIXME: Function chaining~ readable or no?
      this.presentToast(
        this.createToastWithOptions(
          this.getConfiguredToastOptionsFromMessage(debugMessage), this.toastCtrl
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
  presentPreparedToastFromMessage(message: string, toastController: ToastController): Promise<any> {
    // Note: Toast is resolved on each use. Need to recreate.
    const toastedPromise: Promise<any> = this.presentToast(
      this.createToastWithOptions(
        this.getConfiguredToastOptionsFromMessage(message), toastController
      )
    )
      .then(fin => {
        console.log("preparedAndToastedWrapper::", "fin", fin);
      });
    return toastedPromise;
  }

  presentToast(toastToastToast: Toast): Promise<any> {
    const toastedPromise: Promise<any> = toastToastToast.present();
    return toastedPromise;
  }

  createToastWithOptions(toastOptions: ToastOptions, toastController: ToastController) {
    const toast: Toast = toastController.create(toastOptions);
    return toast;
  }


  getConfiguredToastOptionsFromMessage(messageText: string): ToastOptions {
    //
    const toastOptions: ToastOptions = {
      message: messageText,
      duration: 2500,
      position: "top"
    }
    return toastOptions;
  }

  // configureToastWithMessage(messageText: string, toastController: ToastController) {
  //   //
  //   const toastOptions: ToastOptions = this.getConfiguredToastOptionsWithMessage(messageText);
  //   const toast: Toast = this.createToastWithOptions(toastOptions, toastController);

  // }


  presentCreatedToastWithOptions(toastOptions: ToastOptions, toastController: ToastController): Promise<any> {
    //
    const toast: Toast = this.toastCtrl.create(toastOptions);
    const toastedPromise: Promise<any> = toast.present();
    return toastedPromise;
  }




}


