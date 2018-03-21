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
```
set ANDROID_HOME=%LOCALAPPDATA%\Android\sdk
set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```
For more information check Windows recognised environment variables (https://docs.microsoft.com/en-us/windows/deployment/usmt/usmt-recognized-environment-variables)


