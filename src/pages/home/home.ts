import { PostDetailPage } from './../post-detail/post-detail';

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


export type DataCallback = (updatedData: Phost) => Promise<any>;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    currentPhotoPost: Phost = null;
    currentPhoto: string = null;
    imageSrc: SafeResourceUrl = null;           // safeResourceUrl to comply with xss cors warnings?

    data: Phost;
    getUpdatedDataFromPostDetailCallback: DataCallback = (updateData) => {
        return new Promise((resolve, reject) => {
            if (updateData == undefined) {
                reject("Incompatible data to update photo post" + JSON.stringify(updateData));
            }
            this.data = updateData;
            console.log(":PostDetail callback to Master:", updateData);
            resolve(this.data);                 // Promise resolves to the newly-updated home data
        });
    }

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
                this.seedData();
            }, error => {
                this.debugLTTT("ionViewDidLoad::PLATFORM READY ERROR" + error.toString());
            });
    }

    seedData() {
        // Seed image for $5 Meal Deal @ the Unibar brought to you by Griffith SRC, GUPSA. :)
        const b64img = "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";
        // this.loadSanitisedBase64ImageUrl(b64img);
        this.currentPhotoPost = new Phost("MyTitle", "LoremIpseums sdfdescription", new Date, b64img);
        this.loadSanitisedBase64ImageUrl(this.currentPhotoPost.file);
        console.log("Seeded data", this.currentPhotoPost);
    }
    // - MARK: Nav
    // Activate nav push after getting the camera data. e.g. resolves.

    editPhotoPost(photoPost: Phost) {
        // Push the photo data and the callback to resolve the edit and nav to the edit page.
        const navParam = { 
            data: photoPost, 
            callback: this.getUpdatedDataFromPostDetailCallback
        }
        this.navCtrl.push(PostDetailPage, navParam);
        console.log(":HomePage: nav to edit photopostDetails Page", photoPost);

    }
    loadSanitisedBase64ImageUrl(data_url: string) {
        const base64jpgPrefix = "data:image/png;base64, ";
        console.log("data URL leadingtrailing", data_url.slice(0, 20), data_url.slice(data_url.length - 20));
        this.imageSrc = this.domSanitizer.bypassSecurityTrustUrl((base64jpgPrefix + data_url));
        console.log("sanitized", this.imageSrc);
    }

    selectPhotoFromGallery(): void {
        this.openGallery()
            .then((data_url: string) => {
                this.loadSanitisedBase64ImageUrl(data_url);

            }, (errorReason: any) => {
                console.error("Error with photo selection", errorReason);           // error on rejection AND catch?
            })
            .catch((error: any) => this.debugLTTT(error, "something bad happened in photo selection"));
    }
    openGallery(): Promise<any> {
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
        return this.camera.getPicture(cameraOptions)
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
            }, (rejectedReason) => {
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


