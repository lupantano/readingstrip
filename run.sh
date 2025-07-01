#!/bin/sh -e

# export G_MESSAGES_DEBUG=all
export MUTTER_DEBUG_DUMMY_MODE_SPECS=1920x1080
# export SHELL_DEBUG=all
export GJS_DEBUG_OUTPUT=stderr
export GJS_DEBUG_TOPICS=JS ERROR;JS LOG

make

dbus-run-session -- \
    gnome-shell --nested \
    --wayland

# journalctl -f -o cat /usr/bin/gnome-shell
