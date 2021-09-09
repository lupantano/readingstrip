# Reading Strip
It is a **extension for Gnome-Shell** with an equivalent function to a reading guide on the computer, that's really useful for people with **dyslexia**.

![Sample](sample.png)

# Installation
* Install from [gnome extensions site](https://extensions.gnome.org/extension/4419/reading-strip/);
* Install via git:
```
# First clone the git repository
git clone https://github.com/lupantano/readingstrip.git

# install extension
cd readingstrip && make
```

After cloning the repo, the extension is practically installed yet disabled. In order to enable it, you need to use gnome-tweak-tool - find the extension, titled 'Reading Strip', in the 'Extensions' screen and turn it 'On'. You may need to restart the shell (Alt+F2 and insert 'r' in the prompt) for the extension to be listed there.

# Use

You can activate/deactive with **super + space** or click on icon panel.

# Settings

```
cd ~/.local/share/gnome-shell/extensions/readingstrip@lupantano.gihthub/

# height 1:100, default = 2
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-height 2

# opacity 1:255, default = 90
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-opacity 90

# readingstrip-enable-hotkey false:true, default = true
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-enable-hotkey true

# readingstrip-color #00000 : #FFFFFF, default = gold
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-color gold
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-color red
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-color "#2233FF"

```

# TODO
- [x] improve performance;
- [x] detect width screen;
- [x] Icon panel
- [x] multi monitor support 
- [x] check gnome 40 compatibility;
- [x] shortcuts **super + space** actiave/deactivate;
- [x] height strip is 1.8% height monitor.

- [x] Preferences: color;
- [x] Preferences: height;
- [x] Preferences: opacity;
- [x] Preferences: shortcuts actiave/deactivate strip;
- ~~[ ] Preferences: Languages;~~
- [ ] Preferences: add blur around stripe;
- [ ] Preferences GUI;
- [ ] App icon --> status activate/deactivate

- [x] save/restore strip position.

# Contributors
@justperfection
@harshadgavali 
