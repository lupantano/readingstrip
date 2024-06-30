/*
  Reading Strip, Reading guide on the computer for people with dyslexia.
  Copyright (C) 2021-22 Luigi Pantano

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
'use strict';

import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import Adw from "gi://Adw"; // TODO: use Adw widgets where possible
import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

function init (){
    ExtensionUtils.initTranslations();
    return new ReadingStripPreferences();
}

export default class ReadingStripPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
	window._settings = this.getSettings();

	const page = new Adw.PreferencesPage();
	const group = new Adw.PreferencesGroup({}); // TODO: add groups: for settings, copyright, etc.
	const widgetPrefs = this.buildPrefsWidget();

	group.add(widgetPrefs);
	page.add(group);
	window.add(page);
    }

    buildPrefsWidget() {
	this._settings = this.getSettings();
	const prefsWidget = new Gtk.Grid({
	    margin_start: 5,
	    margin_end: 5,
	    margin_top: 5,
	    margin_bottom: 5,
	    row_spacing: 10,
	    column_homogeneous: true,
	    visible: true
	});

	const shortcutsLabel = new Gtk.Label({
	    label: _('You can activate/deactive with <b>SUPER+CTRL+SPACE</b> or click on icon panel\nYou can lock/unlock movement with <b>SUPER+SHIFT+CTRL+SPACE</b>'),
	    halign: Gtk.Align.CENTER,
	    justify: Gtk.Align.CENTER,
	    useMarkup: true,
	    visible: true
	});
	prefsWidget.attach(shortcutsLabel, 0, 1, 2, 1);

	const sizeLabel = new Gtk.Label({
	    label: _('<b>Size</b> (%)'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(sizeLabel, 0, 2, 1, 1);

	const sizeSpinButton = new Gtk.SpinButton({
	    value: this._settings.get_double('height'),
	    digits: 1,
	    adjustment: new Gtk.Adjustment({
		lower: 1,
		upper: 100,
		step_increment: 0.5,
		page_increment: 1
	    }),
	    halign: Gtk.Align.CENTER,
	    visible: true
	});
	prefsWidget.attach(sizeSpinButton, 1, 2, 1, 1);

	this._settings.bind(
	    'height',
	    sizeSpinButton,
	    'value',
	    Gio.SettingsBindFlags.DEFAULT
	);

	const opacityLabel = new Gtk.Label({
	    label: _('<b>Opacity</b> (%)'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(opacityLabel, 0, 3, 1, 1);

	const opacitySpinButton = new Gtk.SpinButton({
	    value: this._settings.get_double('opacity'),
	    digits: 1,
	    adjustment: new Gtk.Adjustment({
		lower: 0,
		upper: 100,
		step_increment: 5,
		page_increment: 20
	    }),
	    halign: Gtk.Align.CENTER,
	    visible: true
	});
	prefsWidget.attach(opacitySpinButton, 1, 3, 1, 1);

	this._settings.bind(
	    'opacity',
	    opacitySpinButton,
	    'value',
	    Gio.SettingsBindFlags.DEFAULT
	);

	const refreshLabel = new Gtk.Label({
	    label: _('<b>Refresh</b> (ms)'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(refreshLabel, 0, 4, 1, 1);

	const refreshSpinButton = new Gtk.SpinButton({
	    value: this._settings.get_int('refresh'),
	    digits: 0,
	    adjustment: new Gtk.Adjustment({
		lower: 0,
		upper: 1000,
		step_increment: 5,
		page_increment: 50
	    }),
	    halign: Gtk.Align.CENTER,
	    visible: true
	});
	prefsWidget.attach(refreshSpinButton, 1, 4, 1, 1);

	this._settings.bind(
	    'refresh',
	    refreshSpinButton,
	    'value',
	    Gio.SettingsBindFlags.DEFAULT
	);
	
	const colorStripLabel = new Gtk.Label({
	    label: _('<b>Strip Color</b>'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(colorStripLabel, 0, 5, 1, 1);

	const colorStripButton = new Gtk.ColorButton({
	    halign: Gtk.Align.CENTER,
	    valign: Gtk.Align.CENTER,
	    visible: true
	});
	const rgba_strip = new Gdk.RGBA();
	rgba_strip.parse(this._settings.get_string('color-strip'));
	colorStripButton.rgba = rgba_strip;
	prefsWidget.attach(colorStripButton, 1, 5, 1, 1);

	colorStripButton.connect('color-set', () => {
	    this._settings.set_string('color-strip', colorStripButton.rgba.to_string());
	});

	const colorFocusLabel = new Gtk.Label({
	    label: _('<b>Color Focus</b>'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(colorFocusLabel, 0, 6, 1, 1);

	const colorFocusButton = new Gtk.ColorButton({
	    halign: Gtk.Align.CENTER,
	    valign: Gtk.Align.CENTER,
	    visible: true
	});
	const rgba_focus = new Gdk.RGBA();
	rgba_focus.parse(this._settings.get_string('color-focus'));
	colorFocusButton.rgba = rgba_focus;
	prefsWidget.attach(colorFocusButton, 1, 6, 1, 1);

	colorFocusButton.connect('color-set', () => {
	    this._settings.set_string('color-focus', colorFocusButton.rgba.to_string());
	});

	const verticalLabel = new Gtk.Label({
	    label: _('<b>Vertical Strip</b>'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(verticalLabel, 0, 7, 1, 1);

	const verticalCheckButton = new Gtk.Switch({
	    active: this._settings.get_boolean('vertical'),
	    halign: Gtk.Align.CENTER,
	    visible: true
	});
	prefsWidget.attach(verticalCheckButton, 1, 7, 1, 1);

	this._settings.bind(
	    'vertical',
	    verticalCheckButton,
	    'active',
	    Gio.SettingsBindFlags.DEFAULT
	);

	const focusStripLabel = new Gtk.Label({
	    label: _('<b>Focus strip</b>'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(focusStripLabel, 0, 8, 1, 1);

	const focusStripCheckButton = new Gtk.Switch({
	    active: this._settings.get_boolean('focusmode'),
	    halign: Gtk.Align.CENTER,
	    visible: true
	});
	prefsWidget.attach(focusStripCheckButton, 1, 8, 1, 1);

	this._settings.bind(
	    'focusmode',
	    focusStripCheckButton,
	    'active',
	    Gio.SettingsBindFlags.DEFAULT
	);

	const profileLabel = new Gtk.Label({
	    label: _('<b>Profile</b>'),
	    halign: Gtk.Align.START,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(profileLabel, 0, 9, 1, 1);

	const buttonBox = new Gtk.FlowBox({
	    homogeneous: true,
	    visible: true
	});
	prefsWidget.attach(buttonBox, 0, 10, 2, 1);

	const focusProfileButton = new Gtk.Button({
	    label: _('Focus Mode'),
	    halign: Gtk.Align.CENTER,
	    valign: Gtk.Align.CENTER,
	    visible: true
	});
	focusProfileButton.connect('clicked', () => {
	    this._settings.set_double('opacity', 0);
	    this._settings.set_double('height', 10);
	    this._settings.set_string('color-focus', 'rgb(0,0,0)');
	    this._settings.set_boolean('vertical', false);
	    this._settings.set_boolean('focusmode', true);
	});
	buttonBox.insert(focusProfileButton, 1);

	const rulesProfileButton = new Gtk.Button({
	    label: _('Rules'),
	    halign: Gtk.Align.CENTER,
	    valign: Gtk.Align.CENTER,
	    visible: true
	});
	rulesProfileButton.connect('clicked', () => {
	    this._settings.set_double('opacity', 100);
	    this._settings.set_double('height', 5);
	    this._settings.set_string('color-strip', 'rgb(246,211,45)');
	    this._settings.set_boolean('vertical', true);
	    this._settings.set_boolean('focusmode', false);
	});
	buttonBox.insert(rulesProfileButton, 2);

	const defaultProfileButton = new Gtk.Button({
	    label: _('Default'),
	    halign: Gtk.Align.CENTER,
	    valign: Gtk.Align.CENTER,
	    visible: true
	});
	defaultProfileButton.connect('clicked', () => {
	    this._settings.set_double('opacity', 35);
	    this._settings.set_int('refresh', 1);
	    this._settings.set_double('height', 2);
	    this._settings.set_string('color-strip', 'rgb(246,211,45)');
	    this._settings.set_string('color-focus', 'rgb(0,0,0)');
	    this._settings.set_boolean('vertical', false);
	    this._settings.set_boolean('focusmode', false);
	});
	buttonBox.insert(defaultProfileButton, 3);

	const aboutLabel = new Gtk.Label({
	    label: '<a href="https://github.com/lupantano/readingstrip">Reading Strip</a> Copyright (C) 2021-2024 <a href="https://matrix.to/#/@lupantano:matrix.org">Luigi Pantano</a>',
	    halign: Gtk.Align.CENTER,
	    justify: Gtk.Align.CENTER,
	    use_markup: true,
	    visible: true
	});
	prefsWidget.attach(aboutLabel, 0, 11, 2, 1);

	return prefsWidget;
    }
}
