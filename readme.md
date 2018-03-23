# How to install

Platforms
```
cordova platform add browser 
cordova platform add android
cordova platform add ios 
```

If plugins and packages properly defined in the project files, install on prompt: 'yes'
```
ionic start
```


```
npm install --save @ionic-native/camera
npm install --save @ionic-native/file
npm install --save @ionic-native/file-path
npm install --save @ionic-native/transfer
```
```
ionic cordova plugin add cordova-plugin-camera --save
ionic cordova plugin add cordova-plugin-file --save
ionic cordova plugin add cordova-plugin-file-transfer --save
ionic cordova plugin add cordova-plugin-filepath --save
```


xampp/htdocs/*.php files

backup plugins setup

-- Additional notes appended.

# Setting up the environment
e.g. after installing:
- Java JDKs (x86 and x64)
- VC++ Redists all-in-one installer (e.g. Wilenty)
- NodeJS, NPM
- - npm Ionic and Cordova packages (globally with `npm install ionic cordova -g`)
- Android studio with AVD Manager images (~Nougat 7.0 x86 and above preferred).

Remember to set up the environment variables using the environment variables editor (Windows) or through the command line. 
Similar to the following (default paths):
For ***Android***
```
setX ANDROID_HOME %LOCALAPPDATA%\Android\sdk
setX PATH %PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```
For ***Java***
```
setX JAVA_HOME C:\Progra~1\Java\jdk1.8.0_161
setX PATH %JAVA_HOME%\bin;%PATH%;
```
***WARNING***: For long PATH variables, the SetX command truncates to 1024 characters. Recommended to edit through either the registry or through the 
Windows >> My Computer >> Advanced >> Environment Variables 
Note that the Java env variable was prepended to the path variable to give priority to the first Java entry.
You may wish to remove the `javapath` link that Oracle installs by default in PATH. This may prevent conflicts with `JDK/bin`.

Windows supports 8.3 filename notation from legacy FAT Progra~1 = Program Files. Substitute to avoid whitespace but shouldn't be a major problem in most cases..
For more information check Windows recognised environment variables (https://docs.microsoft.com/en-us/windows/deployment/usmt/usmt-recognized-environment-variables)
SetX defaults to set user variables. -M sets System variables.

# Deploying
ionic cordova run android --device --VERBOSE
ionic cordova run android --device --VERBOSE -lc\
; Note that using livereload or consolelogs options seem to be incompatible with cordova plugins on certain versions of Ionic. (cordova_not_available) 
Thanks to @BritoMatheus and @Sergito for the following fix for live server `-lc` with ionic native, cordova, platform paths.
***FIX:*** Go to `node_modules//dist/dev-server/serve-config.js` (`.\node_modules\@ionic\app-scripts\dist\dev-server\serve-config.js` **on Windows as of Ionic 3.20, Ionic Native 4.5.3, Cordova 8.0.0**)
and replace:
`exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'assets', 'www');`
to
`exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'app', 'src', 'main', 'assets', 'www');`
[(https://stackoverflow.com/a/48266685)]. https://github.com/ionic-team/ionic-app-scripts/issues/467 https://github.com/ionic-team/ionic/issues/13737
https://github.com/ionic-team/ionic-app-scripts/issues/1354 livereload does not work with cordova-android 7 #1354
fix(live-server): update android platform path #1407
Image in <img>-tag not shown if livereload is enabled #2685
Live reload may not be allowed to load local resources (e.g. *.jpg for img src)
Normalise img src e.g. file:///data/ into /data/.
# Accessing debug app files
Using Bash:
```
    adb shell
    run-as com.your.packagename 
    cp /data/data/com.your.packagename/
```
or
```
    adb backup -noapk com.your.packagename
    dd if=backup.ab bs=24 skip=1 | openssl zlib -d > backup.tar
```
or 
`Android Studio >> View > Tool Windows > Device File Explorer > Expand /data/data/[package-name] nodes`.

typical default debug package name "io.ionic.starter"

Tested using Samsung Galaxy Note 4 SM-N910G running Android 6.0.1, API 23


Html img src file access is super annoying to work around and doesn't test effectively while using live reload...
Testing without live reload for a new prototype severely increases development time, for this reason, attempts to use base64 encoded strings for image data rendering for the time being.
