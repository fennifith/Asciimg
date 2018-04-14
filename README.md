Asciimg is a command line tool that displays images in ASCII.

## Installation

### NPM

```bash
npm install -g asciimg
```

### From Source

Assuming that you have already installed [npm](https://www.npmjs.com/), in the command line, type

```bash
git clone https://github.com/TheAndroidMaster/Asciimg
cd Asciimg
npm install
```

## Usage

```
asciimg -i [image]
```

Or, to change the dimensions:

```
asciimg -i [image] -h [height] -w [width]
```

If either the height or width is not specified, asciimg will pick the value that maintains the correct aspect ratio.

If your command line supports rgb color values:

```
asciimg -i [image] --usergb
```

## Sample Images

The 'test.png' included in the repository is over 4000000 pixels in size, so it will take a while for the tool to convert it. Here are screenshots of the result of that and a few other images:

### My Profile Picture
![img](https://raw.githubusercontent.com/TheAndroidMaster/TheAndroidMaster.github.io/master/images/screenshots/Asciimg-Me.png)

### A Fidget Spinner
Why not.

![img](https://raw.githubusercontent.com/TheAndroidMaster/TheAndroidMaster.github.io/master/images/screenshots/Asciimg-FidgetSpinner.png)

### The Top Half of a Samsung Galaxy S2
![img](https://raw.githubusercontent.com/TheAndroidMaster/TheAndroidMaster.github.io/master/images/screenshots/Asciimg-GalaxyS2.png)
