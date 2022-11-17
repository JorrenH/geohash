# Geohash Converter

This project is intended as a simple way to find and visualize geohash bounds in a latitude,longitude context.

## Developing the app
Using the power of webpack we can develop the application with live reloads. Using the following command starts 
a server on your machine which listens for changes made in the sourcecode.
```bash
$ pnpm dev
```

## Building & Deployment
The application is hosted on firebase, using their CLI it is quite simple to deploy our SPA to the firebase
cloud.

First we build the solid application such that all required sources are in `/public`.
```bash
$ pnpm build
```

Then we deploy the application to firebase
```bash
$ firebase deploy
```

And now we're done, enjoy.