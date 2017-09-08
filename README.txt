BUILDING A DASH.JS PLAYER WITH WEBVR:


USING:

--Jetty Server: http://www.eclipse.org/jetty/

--WebVR: https://webvr.info/developers/

--DASH.js player: https://github.com/Dash-Industry-Forum/dash.js

--Origami's o-three-sixty Library: https://registry.origami.ft.com/components/o-three-sixty#how-do-i-build-service

--Webpack: https://webpack.js.org/

--Kvazaar encoder: https://github.com/ultravideo/kvazaar
__________________________________________________________________________________________________________________________________________

FIXES:

--The video should be displayed in 360 degrees not only in Android device's browser but in the PC's browser too.
__________________________________________________________________________________________________________________________________________
 
-GITHUB:

Player: samples/dash-if-reference-player/

Webpack: samples/dash-if-reference-player/app/bundle.js (bundle.js contains all the scripts from o-three-sixty library in order to run them in the browser)

Content: Content/manifest.mpd

360 Library: o-three-sixty
__________________________________________________________________________________________________________________________________________

STEPS:

1. Start Jetty Server (command line):  

	$ java -jar jetty-distribution-9.4.6.v20170531/start.jar

2. From browser: http://10.10.131.116:8080/samples/dash-if-reference-player/

		 Insert MPD's URL: http://10.10.131.116:8080/Content/manifest.mpd

The reason for using '10.10.131.116' (the PC's IP address) instead of 'localhost' is that this way you can use the local server in the Android device too.

--To stream it with Gear VR headset use Samsung Internet VR 

