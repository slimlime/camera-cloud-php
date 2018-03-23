
import { Component } from '@angular/core';
import { Camera, CameraOptions, DestinationType, PictureSourceType } from '@ionic-native/camera';
import { DirectoryEntry, Entry, File, FileEntry } from '@ionic-native/file';
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
  normalizeURL
} from 'ionic-angular';

import { DataLoaderProvider } from '../../providers/data-loader/data-loader';
import { Phost } from './../../providers/photo-server-handler/photo-server-handler';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  currentPhotoPost = null;
  currentPhoto: string = null;
  imageSrc: SafeResourceUrl = null;         // safeResourceUrl to comply with xss cors warnings?

  constructor(public navCtrl: NavController,
    public camera: Camera,
    public domSanitizer: DomSanitizer,
    public file: File,
    public filePath: FilePath,
    public fileTransfer: FileTransfer,
    public transfer: Transfer,
    public platform: Platform,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController
  ) {
    this.debugLTTT("HomePage:: Constructed Hello");
    // Avoid complex operations in constructor. ***
    // this.prepareCameraActionSheet(this.camera, this.actionSheetCtrl);
  }

  ionViewDidLoad() {
    this.debugLTTT("ionViewDidLoad::");
    this.platform.ready()
      .then(platformReadySource => {
        this.debugLTTT("ionViewDidLoad::plat READY");
      }, error => {
        this.debugLTTT("ionViewDidLoad::PLATFORM READY ERROR" + error.toString());
      });
  }

  openGallery(): void {
    const cameraOptions: CameraOptions = {
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: this.camera.DestinationType.DATA_URL,
        quality: 50,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: this.camera.EncodingType.JPEG,
        correctOrientation: true,
        allowEdit: false        
    };
    this.camera.getPicture(cameraOptions)
        .then((data_url: string) => {
            const base64jpgPrefix = "data:image/png;base64, ";
            console.log("data URL leadingtrailing", data_url.slice(0, 20), data_url.slice(data_url.length-20));
            this.imageSrc = this.domSanitizer.bypassSecurityTrustUrl((base64jpgPrefix + data_url));
            console.log("sanitized", this.imageSrc)
        });
  }
  /*
  presentActionSheet() {
    const sheet = this.prepareCameraActionSheet(this.camera, this.actionSheetCtrl)
    const transition: Promise<any> = sheet.present();
    return transition;
  }
  */
  /* Cool type definition but not very nice to maintain. Let's hide all of this complexity!
    getCameraPictureActionSheetButton(buttonText: string,
      sourceType: number,
      destinationType: number,
      clickFunction: (() => boolean | void)): ActionSheetButton {
  */

  /**
   * Test functionality on activation
   * 
   * @memberof HomePage
   */
  doSomething() {
    this.setupFileSystem(this.file);
    console.log("test jsonify");
    this.currentPhoto = "file:///data/user/0/io.ionic.starter/files/1521788900694.jpg";
  }
  

  testCreatePhostAndStringifyRep() {
    const phostt: Phost = new Phost("lol", "loasdlas", new Date(), "myNewFile.jpg");
    const phosttstringed = phostt.jsonStringify();
    console.log("phostt", phostt, "stringed", phosttstringed);
    
    const reparsedPhost: Phost = Phost.jsonParsify(phosttstringed);
    console.log("reparsed", reparsedPhost);

    /* JSON.stringify converts Date to Date.toISOString(). different format that doesnt auto parse.
      const phosttedparsed: Phost = JSON.parse(phosttstringed);
      console.log("re-parsed", phosttedparsed);
      console.log("dated again", new Date(phosttedparsed.timestampCreated));
    */
  }
  /**
   * Sets up the file system for photos and data. Checks existing or creates.
   * Could take a list of paths and files to check e.g. photos/ photos.json users.json or just hardcode for now. YAGNI
   * @memberof HomePage
   */
  setupFileSystem(fileController: File) {
    // returns true, false and can be rejectedpromise? boolean or entry
    // Should create an export const of dirs all relative to data directory

    //e.g. app DATADIR = .../files/
    // app PHOTODIR = DATADIR+/photos/ ?
    // or just use the ionic/cordova .file.dataDirectory and append any other directories as relative to that.

    const photosDir = "photos";
    fileController.checkDir(cordova.file.dataDirectory, photosDir)
      .then((dirEntryExists: boolean) => {
        console.log("Filesystems found", dirEntryExists, this.file.dataDirectory, cordova.file.dataDirectory);
      }, rejected => {
        console.log("rejected", rejected);
    });
    // ^^ checkdir Don't need to check unless need something inside. createDir will create the directory or replace existing dir.
    fileController.createDir(cordova.file.dataDirectory, photosDir, false)
      .then((dirEntry: DirectoryEntry) => { 
        console.log(dirEntry);
      },(rejectedReason) => {
        console.log(rejectedReason);    // e.g. on subsequent runs it should reject and return err PATH_EXISTS_ERR code: 12.
      });
      /* e.g. 
       * fullPath url: "/photos/" vs os filesystem url
       * nativeURL:"file:///data/user/0/com.yourpackage.name/files/photos/"
       */
  }

  // - MARK: - UI component presentation and utility functions
  // - MARK: ActionSheet setup functions.
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
          console.log("finToast", fin);
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
  pass() {
    this.debugLTTT("Pass")
  }


}


