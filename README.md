# Reading Strip
It is a **extension for Gnome-Shell** with an equivalent function to a reading guide on the computer, that's really useful for people with **dyslexia**.

![Sample](img/sample_1.png)

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
You can activate/deactive with **Super+Ctrl+space**, **Super+space** or click on icon panel.

# Settings
![Sample](img/sample_2.png)

```
cd ~/.local/share/gnome-shell/extensions/readingstrip@lupantano.gihthub/

# height 1:100, default = 2
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-height 2

# opacity 1:100, default = 35
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-opacity 35

# readingstrip-enable-hotkey false:true, default = true
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-enable-hotkey true

# readingstrip-color  rgb(0,0,0): rgb(255,255,255), default = rgb(246,211,45)
gsettings --schemadir schemas/ set org.gnome.shell.extensions.readingstrip readingstrip-color rgb(246,211,45)
```

# TODO
- [ ] Preferences: strip's color like default color theme;
- [ ] Preferences: add blur around stripe;
- [ ] Preferences: add blur on not focused window 
- [ ] Preferences: add vertical stripe;
- [ ] Preferences: add shortcuts change;
- [x] Preferences: color button;
- [x] Preferences GUI;

# Contributors
@justperfection
@harshadgavali
@artyomzorin
