import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Transfer } from '@ionic-native/transfer';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { MyApp } from './app.component';


@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,

    File,
    Transfer,
    Camera,
    FilePath,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}