Asciimg (pronounced _ask-ee-em_) is a command line tool that displays images in ASCII.

## Installation

Assuming that you have already installed [npm](https://www.npmjs.com/), in the command line, type either one of the following:

### NPM

```bash
npm install -g asciimg
```

### From Source

```bash
git clone https://github.com/TheAndroidMaster/Asciimg
cd Asciimg
npm install
```

## Usage

```
asciimg <image>
```

Or, to change the dimensions:

```
asciimg <image> -h [height] -w [width]
```

If either the height or width is not specified, asciimg will pick the value that maintains the correct aspect ratio.

If your command line supports rgb color values:

```
asciimg <image> --usergb
```

## Sample Images

The 'test.png' included in the repository is over 4000000 pixels in size, so it will take a while for the tool to convert it. Here are screenshots of the result of that and a few other images:

### My Profile Picture
![img](./.github/images/me.png?raw=true)

### A Fidget Spinner
Why not.

![img](./.github/images/fidgetspinner.png?raw=true)

### The Top Half of a Samsung Galaxy S2
![img](./.github/images/galaxys2.png?raw=true)
