import { FileUploadOptions } from '@ionic-native/transfer';
import { LoadingController, Loading } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject, FileUploadResult } from '@ionic-native/file-transfer';

// - TODO: Focus on local storage first.
export const SERVER_URL = "http://192.168.0.2/";
export const PHOTO_UPLOAD_URL = SERVER_URL + "upload.php";
export const PHOTO_FOLDER_URL = SERVER_URL + "uploads/";  // For simple retrieve of photo files.

// declare cordova to avoid warnings for retrieving native directory from cordova-file plugin
declare const cordova;

/**
 * A user's collection of PhotoPosts.
 *
 * @interface PhotoPostCollection
 */
interface PhotoPostCollection {
  // collectorUserID: string,        // one user can have multiple photo collections. each user can own a photo but the photos can be organised into an album collection by another user
  collectionName: string,
  photos: PhotoPost[]
}

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
  // id?,                 // millisecond timestamp should be unique enough for this single user mini app.
  // potential problems with photos taken at same time.
  title: string,
  description?: string,
  photo?: any,            // test URI or base64 for icon and then expand to full image
  timestampCreated: Date,
}

export class Phost {
  static _idCounter = 0;  // for auto increment.
  id: number;
  title: string;
  description: string;
  file: string;           // FILE_URI?
  filePath: string;
  timestampCreated: Date;

  constructor(title: string, description = "loret ipsum", timestampCreated: Date, file: string) {
    this.id = Phost._idCounter++; // Assign id and increment static class counter.
    this.title = title;
    this.timestampCreated = timestampCreated;   // timestamp of the object creation vs the timestamp of photo.?! -- FIXME
    this.file = file;
  }

  // Get platform-correct path to app data folder.
  // filePath filename based on timestamp + .jpg
  getLocalFilePath(): string {
    const nativeDataPhotosDirectory: string = cordova.file.dataDirectory;
    //const filePath = nativeDataPhotosDirectory + this.timestampCreated.getTime() + ".jpg";
    const filePath = this.filePath;     // -- FIXME: Cleanup when finalised the file determination operations.
    console.log("getLocalFilePath():: native and filepath", nativeDataPhotosDirectory, filePath);
    return filePath;
  }
  /**
   * Set the static class auto increment counter to the last entry based on number of photos.
   * See ionic-native File.listDir(path, dirName)
   * 
   * @param {number} numPhotos 
   * @returns {number} 
   * @memberof Phost
   */
  static setPhostCounter(numPhotos: number): number {
    Phost._idCounter = numPhotos
    return Phost._idCounter;
  }
/**
 * Special condition to properly parse the Date object.
 * 
 * @static
 * @returns {Phost} 
 * @memberof Phost
 */
  static jsonParsify(photopostJson: string): Phost {
    const phost: Phost = JSON.parse(photopostJson);
    const date: Date = new Date(phost.timestampCreated);
    phost.timestampCreated = date;
    return <Phost>phost;
  }

  /**
   * 
   * Warning: JSON.stringify for {Date} converts to Date.toISOString.
   * Doesn't parse back into {Date} format automatically but can create new Date(), passing the ISOString into the constructor;
   * 
   * @returns {string} 
   * @memberof Phost
   */
  jsonStringify(): string {
    return JSON.stringify(this);
  }

}


/*
  Generated class for the PhotoServerHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PhotoServerHandlerProvider {

  constructor(public http: HttpClient,
    public fileTransfer: FileTransfer) {
    console.log('Hello PhotoServerHandlerProvider Provider');
  }



  // Simply uploads file path to destination php POST form.
  uploadPicture(photo: Phost, photoUploadServerUrl: string): Promise<FileUploadResult> {

    // Present activity/loading indicator popover.
    // Get FileUploadOptions
    // Attempt to upload fileUrl to serverUrl with options.
    // Cleanup and dismiss activity/loading indicator if successful.

    const fileTransfer = this.fileTransfer;

    const pictureFileName: string = photo.title + photo.timestampCreated;
    const pictureUploadOptions: FileUploadOptions = this.configurePictureFileUploadOptions(pictureFileName);


    const fileTransferer: FileTransferObject = fileTransfer.create();
    // Use fileTransferer to upload fileUrl to serverUrl with options.
    const fileUploadPromise: Promise<FileUploadResult> = fileTransferer.upload(photo.getLocalFilePath(), photoUploadServerUrl, pictureUploadOptions);

    return fileUploadPromise; // resolve UI elements on fulfilment of promise in callee.
  }


  configurePictureFileUploadOptions(pictureFileName: string): FileUploadOptions {
    const pictureUploadOptions: FileUploadOptions = {
      fileKey: 'file',
      fileName: pictureFileName,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': pictureFileName },
      httpMethod: 'POST'
    };

    return pictureUploadOptions;
  }

}

