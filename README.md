# Circular View App
 
Application wrapper for the IGV-JBrowse circular view, a visualization for long-range genomic interactions,   
based on the JBRowse circular view component.  The purpose of the wrapper is to enable interaction between
this Javascript circular view component and the Java IGV Desktop application.

Application created from the [electron quick start](https://github.com/electron/electron-quick-start) project.

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) 
(which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/igvteam/circular-view-app
# Go into the repository
cd circular-view-app
# Install dependencies
npm install
# Run the app
npm start
```

## To build

To build first clone and npm install as described above.  Then run

```bash
npm run build
```
Build artifacts will be deposited in a "dist" folder.   The build itself is configured in ```package.json```.  See
the [electron-builder](https://www.electron.build/) documentation for configuration options.


