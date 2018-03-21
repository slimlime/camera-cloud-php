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




