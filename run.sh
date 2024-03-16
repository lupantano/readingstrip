#!/usr/bin/env bash

make
env GNOME_SHELL_SLOWDOWN_FACTOR=2 \
    MUTTER_DEBUG_DUMMY_MODE_SPECS=1024x768 \
    dbus-run-session -- gnome-shell --nested \
                                    --wayland
