'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;

function init (){
    // nothing to do :-D
}

function buildPrefsWidget() {
    this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.readingstrip');
    let prefsWidget = new Gtk.Grid({
        margin_start: 40,
        margin_end: 40,  
        margin_top: 40,
        margin_bottom: 40,
        column_spacing: 20,
        row_spacing: 12,
        visible: true
    });

    let aboutLabel = new Gtk.Label({
        label: 'Reading Strip Copyright (C) 2021-22  Luigi Pantano.',
        halign: Gtk.Align.CENTER,
        visible: true
    });
    prefsWidget.attach(aboutLabel, 0, 1, 2, 1);

    let opacityLabel = new Gtk.Label({
        label: '<b>Opacity</b> (%)',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(opacityLabel, 0, 2, 1, 1);

    let opacity = new Gtk.SpinButton({
        value: this.settings.get_double('readingstrip-opacity'),
        digits: 1,
        adjustment: new Gtk.Adjustment({
            lower: 5,
            upper: 100,
            step_increment: 5,
            page_increment: 20
        }),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(opacity, 1, 2, 1, 1);

    this.settings.bind(
        'readingstrip-opacity',
        opacity,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    let colorLabel = new Gtk.Label({
        label: '<b>Color</b>:',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(colorLabel, 0, 3, 1, 1);

    let colorEntry = new Gtk.Entry({
        text: this.settings.get_string('readingstrip-color'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(colorEntry, 1, 3, 1, 1);

    this.settings.bind(
        'readingstrip-color',
        colorEntry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    let resetButton = new Gtk.Button({
        label: "Reset Settings",
        visible: true
    });
    resetButton.connect('clicked', () => {
        this.settings.set_double('readingstrip-opacity', 35)
        this.settings.set_string('readingstrip-color', 'gold');
    });
    prefsWidget.attach(resetButton, 0, 6, 1, 1);

    return prefsWidget;
}
