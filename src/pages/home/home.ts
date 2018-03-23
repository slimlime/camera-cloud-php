
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
} from 'ionic-angular';

import { DataLoaderProvider } from '../../providers/data-loader/data-loader';
import { Phost } from './../../providers/photo-server-handler/photo-server-handler';

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
  currentPhotoPost = null

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
    // console.log("HomePage:: CONSTRUCTED not debugLTTT")
    // Avoid complex operations in constructor. ***
    // this.prepareCameraActionSheet(this.camera, this.actionSheetCtrl);
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

  presentActionSheet() {
    const sheet = this.prepareCameraActionSheet(this.camera, this.actionSheetCtrl)
    const transition: Promise<any> = sheet.present();
    return transition;
  }
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
    // console.log(this.file.dataDirectory);
    // const photosDirectory = this.file.dataDirectory
    // this.file.listDir(photosDirectory, "photos")
    //   .then((entries: Entry[]) => {
    //     console.log(entries);
    //   }, (failureReason: any) => {
    //     // e.g. FileError code: 1 = NOT_FOUND_ERR
    //     console.log(failureReason)
    //   });
    // console.log();
    this.setupFileSystem(this.file);

    // test 
    console.log("test jsonify");
    this.testCreatePhostAndStringifyRep();
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
    fileController.checkDir(this.file.dataDirectory, photosDir)
      .then((dirEntryExists: boolean) => {
        console.log("Filesystems found", dirEntryExists);
      }, rejected => {
        console.log("rejected", rejected);
    });
    // ^^ checkdir Don't need to check unless need something inside. createDir will create the directory or replace existing dir.
    fileController.createDir(this.file.dataDirectory, photosDir, false)
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
                                    destinationType: DestinationType,
                                    camera: Camera): ActionSheetButton {
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
    const capturePhotoFunction = () => {
      this.debugLTTT("getCameraPictureASButton:: handlerFunction source->dest", sourceType, destinationType);
      return this.takePicture(sourceType, destinationType, camera)
    };

    // Cheating the empty parameter passing defined by {ActionSheetButton.handler} by instead
    // passing inside the enclosed function.
    const funkyCapturePhotoFunction: ButtonHandlerFunction = () => {
      this.debugLTTT("getCameraPictureASButton:: funkyFunction source->dest", sourceType, destinationType);
      // this.takePicture(sourceType, destinationType, camera);
    };
    // Hide away the complexity of having function type syntax defined by ActionSheetButton.
    const pictureASButton: ActionSheetButton = {
      text: buttonText,
      handler: capturePhotoFunction
    }
    return pictureASButton;
  }

  /**
   * Sets up the photo capture ActionSheetOptions for actionsheet
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
      camera.PictureSourceType.PHOTOLIBRARY, camera.DestinationType.FILE_URI, camera);

    const photoCameraButton: ActionSheetButton = this.getCameraPictureActionSheetButton("Capture a photo from the camera",
      camera.PictureSourceType.CAMERA, camera.DestinationType.FILE_URI, camera);

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
    const camActionSheetOptions: ActionSheetOptions = this.getCameraSheetOptions(camera);
    this.debugLTTT("prepareCameraActionSheet:: getCameraSheetOptions", camActionSheetOptions);

    const camActionSheet: ActionSheet = actionSheetController.create(camActionSheetOptions);
    this.debugLTTT("prepareCameraActionSheet:: ASController.create()", camActionSheet);

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
      /* - DEBUG TEST Make images more manageable for testing. ~ file size /
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
    // , photoCaptureCompletionHandler: () => boolean)

    const camOptions: CameraOptions = this.getCameraOptions(sourceType, destinationType);

    cameraController.getPicture(camOptions)
      .then((imagePath: string) => {
        //

        const [currentName, correctPath] = this.getFileNameAndPathFromCameraFileUri(imagePath);
        const osDestinationPath = cordova.file.dataDirectory;
        // const newFileName = "myNewFile.jpg"; // debug test Verified camera capture and copy directory working
        const newFileName = this.createFileName();
        const completionFunc = () => {
          console.log("copyFileToLocalDir completion");
          return true;
        };
        this.debugLTTT("takePicturePromisethen correctPath", correctPath, "currentName", currentName,
          "osDestinationpath", osDestinationPath, "newFileName", newFileName, "completionFunc", completionFunc);
        this.copySourceFileToLocalDirectory(correctPath, currentName,
          osDestinationPath, newFileName, completionFunc);
      });

  }


  /**
   * Returns a string jpg filename based on timestamp.
   * Although plugin temporary file cache sems to use a timestamp name anyway and could probably be preserved.
   * @returns {string} 
   * @memberof HomePage
   */
  createFileName(): string {
    const datetime = new Date(),
      timestamp = datetime.getTime(),
      newFileName = timestamp + ".jpg";
    return newFileName;
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
    const trailingDirSymbolFolderNestedEndIndex = imagePath.lastIndexOf('/');
    // Get the filename index e.g. slice substr at first char 'f' in 'filename.jpg'
    const fileNameStartIndex = trailingDirSymbolFolderNestedEndIndex + 1;

    // File name and file path.
    const currentName = imagePath.substr(fileNameStartIndex);
    const correctPath = imagePath.substr(0, fileNameStartIndex);

    return [currentName, correctPath];
  }

  /**
   *
   *
   * @param {string} osSourceFilePath
   * @param {any} sourceFileName
   * @param {any} newFileName
   * @param {() => boolean} completionHandler Function to activate e.g. UI presentation on promise resolution of
   * async file functions.
   * e.g. (AndroidPhone)... \Android\data\io.ionic.starter\cache
   * @memberof HomePage
   */
  copySourceFileToLocalDirectory(osSourceFilePath: string, sourceFileName,
                                osDestinationFilePath, newFileName,
                                completionHandler: () => boolean) {
    // Warning: Completion handlers are more imperative. Can convert
    // to 'Functional' style easily using return Promises

    this.debugLTTT("sourcepath", osSourceFilePath, "sourcename", sourceFileName,
                    "destpath", osDestinationFilePath, "destname", newFileName);
    const fileCopy = this.file.copyFile(osSourceFilePath, sourceFileName, osDestinationFilePath, newFileName);
    fileCopy.then((success: FileEntry) => {
      this.debugLTTT("Success storing file to local", success.fullPath, success.nativeURL);

      // - FIXME: Path error if using gallery image select. source file name gets 2:".Pic.jpg?1521680895333" instead of "1521680895333.jpg"
    }, error => {
      this.debugLTTT("Error while storing file.", error);
    });

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


  pass() {
    this.debugLTTT("Pass")
  }

}


