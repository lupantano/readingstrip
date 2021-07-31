all: pack install

# creates extension zip file
pack:
	gnome-extensions pack -f \
		--extra-source=LICENSE --extra-source=README.md

# install created zip file
install:
	gnome-extensions install -f *shell-extension.zip