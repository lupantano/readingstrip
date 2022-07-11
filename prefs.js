'use strict';

const { Gio, Gtk, Gdk } = imports.gi;
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
        row_spacing: 12
    });

    let shortcutsLabel = new Gtk.Label({
        label: 'You can activate/deactive with <b>SUPER+CTRL+SPACE</b> or click on icon panel',
        halign: Gtk.Align.CENTER,
        useMarkup: true
    });
    prefsWidget.attach(shortcutsLabel, 0, 1, 2, 1);

    let heightLabel = new Gtk.Label({
        label: '<b>Height</b> (%)',
        halign: Gtk.Align.START,
        use_markup: true
    });
    prefsWidget.attach(heightLabel, 0, 2, 1, 1);

    let height = new Gtk.SpinButton({
        value: this.settings.get_double('readingstrip-height'),
        digits: 1,
        adjustment: new Gtk.Adjustment({
            lower: 2,
            upper: 100,
            step_increment: 0.5,
            page_increment: 1
        }),
        halign: Gtk.Align.END,
        hexpand: true
    });
    prefsWidget.attach(height, 1, 2, 1, 1);

    this.settings.bind(
        'readingstrip-height',
        height,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    let opacityLabel = new Gtk.Label({
        label: '<b>Opacity</b> (%)',
        halign: Gtk.Align.START,
        use_markup: true
    });
    prefsWidget.attach(opacityLabel, 0, 3, 1, 1);

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
        hexpand: true
    });
    prefsWidget.attach(opacity, 1, 3, 1, 1);

    this.settings.bind(
        'readingstrip-opacity',
        opacity,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    let colorLabel = new Gtk.Label({
        label: '<b>Color</b>:',
        halign: Gtk.Align.START,
        use_markup: true
    });
    prefsWidget.attach(colorLabel, 0, 4, 1, 1);

    let rgba = new Gdk.RGBA();
    rgba.parse(this.settings.get_string('readingstrip-color'));
    let colorButton = new Gtk.ColorButton({
        hexpand: false
    });
    colorButton.set_rgba(rgba);
    prefsWidget.attach(colorButton, 1, 4, 1, 1);

    colorButton.connect('color-set', () => {
        this.settings.set_string('readingstrip-color', colorButton.get_rgba().to_string());
    });

    let resetButton = new Gtk.Button({
        label: "Reset Settings",
        hexpand: true
    });
    resetButton.connect('clicked', () => {
        this.settings.set_double('readingstrip-opacity', 35);
        this.settings.set_double('readingstrip-height', 2);
        this.settings.set_string('readingstrip-color', 'rgb(246,211,45)');
    });
    prefsWidget.attach(resetButton, 1, 5, 1, 1);

    let aboutLabel = new Gtk.Label({
        label: '<a href="https://github.com/lupantano/readingstrip">Reading Strip</a> Copyright (C) 2021 <a href="https://matrix.to/#/@lupantano:matrix.org">Luigi Pantano</a>',
        halign: Gtk.Align.CENTER,
        use_markup: true
    });
    prefsWidget.attach(aboutLabel, 0, 6, 2, 1);

    return prefsWidget;
}
