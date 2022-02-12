'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;

let home_dir = imports.gi.GLib.get_home_dir();

function init() {
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

    let reloadLabel = new Gtk.Label({
        label: "<b>Reload the extension to apply changes</b>",
        halign: Gtk.Align.CENTER,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(reloadLabel, 0, 1, 2, 1);

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

    let enabledLabel = new Gtk.Label({
        label: '<b>Enable:</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(enabledLabel, 0, 4, 1, 1);

    let enabledToggle = new Gtk.Switch({
        active: this.settings.get_boolean ('enabled'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(enabledToggle, 1, 4, 1, 1);

    this.settings.bind(
        'enabled',
        enabledToggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    let colorLabel = new Gtk.Label({
        label: '<b>Color:</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(colorLabel, 0, 5, 1, 1);

    let colorToggle = new Gtk.ComboBoxText({
        halign: Gtk.Align.END,
        visible: true
    });
    this.colorToggle = new Gtk.ComboBoxText();
    let options = ["gold", "red", "green", "blue", "pink", "default theme color"]
    for (let item of options)
        colorToggle.append_text(item);

    colorToggle.set_active(this.settings.get_string("readingstrip-color") || 0);
    colorToggle.connect('changed', combobox => {
        this.settings.set_string("readingstrip-color", combobox.get_active());
    });
    colorToggle.set_active(this.settings.get_string("readingstrip-color") || 0);
    prefsWidget.attach(colorToggle, 1, 5, 1, 1);

    let resetButton = new Gtk.Button({
        label: "Reset Settings",
        visible: true
    });
    resetButton.connect('clicked', () => {
        this.settings.set_double('readingstrip-opacity', 35)
        this.settings.set_string('readingstrip-color', 'gold');
        this.settings.set_boolean('enabled', false);
    });
    prefsWidget.attach(resetButton, 0, 6, 2, 1);

    return prefsWidget;
}
