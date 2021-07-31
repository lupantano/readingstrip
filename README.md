# Reading Strip
It is a **extension for Gnome-Shell** with an equivalent function to a reading guide on the computer, that's really useful for people with **dyslexia**.

![Sample](sample.png)

# Installation
* Install from [gnome extensions site](https://extensions.gnome.org/extension/4419/reading-strip/)
* Install via git
```
# First clone the git repository
git clone https://github.com/lupantano/readingstrip.git

# install extension
cd readingstrip && make
```

After cloning the repo, the extension is practically installed yet disabled. In order to enable it, you need to use gnome-tweak-tool - find the extension, titled 'Reading Strip', in the 'Extensions' screen and turn it 'On'. You may need to restart the shell (Alt+F2 and insert 'r' in the prompt) for the extension to be listed there.

You can activate/deactive with **<super>space**.

# TODO
- [x] improve performance;
- [x] detect width screen;
- [x] Icon panel
- [x] multi monitor support 
- [x] check gnome 40 compatibility;

- [ ] Preferences: color;
- [ ] Preferences: height;
- [ ] Preferences: opacity;
- [ ] Preferences: shortcuts actiave/deactivate;
- [ ] Preferences: Languages;

- [x] save/restore strip position.

# Contributors
@justperfection
@harshadgavali 
