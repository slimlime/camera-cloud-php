import { FileUploadOptions } from '@ionic-native/transfer';
import { LoadingController, Loading } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';


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
  // userID: string,        // one user can have multiple photo collections.
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

  timestampCreated: Date;

  constructor(title: string, description = "loret ipsum", timestampCreated: Date) {
    this.id = Phost._idCounter++; // Assign id and increment static class counter.
    this.title = title;
    this.timestampCreated = timestampCreated;
  }

  // Get platform-correct path to app data folder for `photos/` folder.
  getLocalFilePath(): string {
    const nativeDataPhotosDirectory: string = cordova.file.dataDirectory + "photos/";
    const filePath = nativeDataPhotosDirectory + this.file + ".jpg";

    return filePath;
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
  uploadPicture(photo: Phost, photoUploadServerUrl: string) {

    // Present activity/loading indicator popover.
    // Get FileUploadOptions
    // Attempt to upload fileUrl to serverUrl with options.
    // Cleanup and dismiss activity/loading indicator if successful.

    const fileTransfer = this.fileTransfer;


    const pictureFileName: string = photo.title + photo.timestampCreated;
    const pictureUploadOptions: FileUploadOptions = this.configurePictureFileUploadOptions(pictureFileName);


    const fileTransferer: FileTransferObject = fileTransfer.create();
    // Use fileTransferer to upload fileUrl to serverUrl with options.
    fileTransferer.upload(photo.getLocalFilePath(), photoUploadServerUrl, pictureUploadOptions);

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

