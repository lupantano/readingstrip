all: pack install

# creates extension zip file
pack:
	xgettext --from-code=UTF-8 --output=po/reading-strip.pot *.js
	gnome-extensions pack -f --podir=po \
		--extra-source=LICENSE --extra-source=README.md \
		--extra-source=icons

# install created zip file
install:
	gnome-extensions install -f *shell-extension.zip
