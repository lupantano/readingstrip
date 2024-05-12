/*
  Reading Strip, Reading guide on the computer for people with dyslexia.
  Copyright (C) 2021-24 Luigi Pantano

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
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const {
    gettext: _,
} = ExtensionUtils;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
let icon;

let strip_h, strip_v, focus_up, focus_down, pointerWatch, refresh = 1, strip_locked = 0;
let settings, setting_changed_signal_ids = [];

class ReadingStrip {
    // follow cursor position, and monitor as well
    syncStrip() {
	const [x, y] = global.get_pointer();
	const currentMonitor = Main.layoutManager.currentMonitor;

	strip_h.x = currentMonitor.x;
	strip_h.y = y - strip_h.height / 2;
	strip_h.width = currentMonitor.width;
	
	strip_v.x = x - strip_v.width;
	strip_v.y = currentMonitor.y;
	strip_v.height = currentMonitor.height;
	
	focus_up.x = currentMonitor.x;
	focus_up.y = -currentMonitor.height + y - strip_h.height / 2;
	focus_up.width = currentMonitor.width;
	focus_up.height = currentMonitor.height;
	
	focus_down.x = currentMonitor.x;
	focus_down.y = y + strip_h.height / 2;
	focus_down.width = currentMonitor.width;
	focus_down.height = currentMonitor.height;
    }

    // toggle strip on or off
    toggleStrip() {
	strip_h.visible = !strip_h.visible;
	strip_v.visible = strip_h.visible;
	focus_up.visible = strip_h.visible;
	focus_down.visible = strip_h.visible;
	settings.set_boolean('enabled', strip_h.visible);
	
	strip_locked = 0;
	
	if (icon.gicon == this.icon_on) {
	    icon.gicon = this.icon_off;
	    this._buttonSwitchItem.setToggleState(false);
	    pointerWatch.remove();
	    pointerWatch = null;
	} else {
	    icon.gicon = this.icon_on;
	    this._buttonSwitchItem.setToggleState(true);
	    this.syncStrip(true);
	    pointerWatch = this.pointerWatcher.addWatch(refresh, this.syncStrip);
	}
    }

    // lock/unlock strip on screen
    lockStrip() {
	if (!strip_locked) {
	    pointerWatch.remove();
	    pointerWatch = null;
	    strip_locked = 1;
	} else {
	    this.syncStrip(true);
	    pointerWatch = this.pointerWatcher.addWatch(refresh, this.syncStrip);
	    strip_locked = 0;
	}
    }

    enable() {
	this.icon_on = Gio.icon_new_for_string(`${Me.path}/icons/readingstrip-on-symbolic.svg`);
	this.icon_off = Gio.icon_new_for_string(`${Me.path}/icons/readingstrip-off-symbolic.svg`);
	this.pointerWatcher = imports.ui.pointerWatcher.getPointerWatcher();
	
	// Load settings
	settings = ExtensionUtils.getSettings();

	// add to top panel
	this._indicator = new PanelMenu.Button(0.0, Me.metadata.name, false);
	icon = new St.Icon({
	    gicon : this.icon_off,
	    style_class: 'system-status-icon',
	});	
        this._indicator.add_child(icon);
	
	this._buttonSwitchItem = new PopupMenu.PopupSwitchMenuItem(_('Show/Hide'), { status: false }, {});
	this._buttonSwitchItem.connect('toggled', () => {
            this.toggleStrip();
	});
	this._buttonSwitchItem.setToggleState(false);
	this._indicator.menu.addMenuItem(this._buttonSwitchItem);
	this._indicator.menu.addAction(_('Settings...'), () => ExtensionUtils.openPrefs(), 'settings-symbolic');
	
	Main.panel.addToStatusArea(Me.metadata.uuid, this._indicator);
        this._count = 0;

	// create vertical strip
	strip_v = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false
	});
	Main.uiGroup.add_child(strip_v);

	// create horizontal strip
	strip_h = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false
	});
	Main.uiGroup.add_child(strip_h);

	// create vertical strip
	strip_v = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false
	});
	Main.uiGroup.add_child(strip_v);

	// create  - focus
	focus_up = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false,
	    opacity: 75 * 255/100
	});
	Main.uiGroup.add_child(focus_up);

	focus_down = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false,
	    opacity: 75 * 255/100
	});
	Main.uiGroup.add_child(focus_down);

	// synchronize extension state with current settings
	setting_changed_signal_ids.push(settings.connect('changed', () => {
	    strip_h.style = 'background-color : ' + settings.get_string('color-strip') + ';border: 1px solid #708090;';
	    strip_h.opacity = settings.get_double('opacity') * 255/100;
	    strip_h.height = settings.get_double('height') * Main.layoutManager.currentMonitor.height/100;

	    strip_v.visible = strip_h.visible && settings.get_boolean('vertical');
	    strip_v.style = strip_h.style;
	    strip_v.opacity = strip_h.opacity;
	    strip_v.width = strip_h.height / 4;

	    focus_up.visible = strip_h.visible && settings.get_boolean('focusmode');
	    focus_up.style = 'background-color : ' + settings.get_string('color-focus');

	    focus_down.visible = strip_h.visible && settings.get_boolean('focusmode');
	    focus_down.style = 'background-color : ' + settings.get_string('color-focus');

	    refresh = settings.get_int('refresh');
	}));

	// load previous state
	if (settings.get_boolean('enabled'))
	    this.toggleStrip();

	// synchronize hot key enable/disable
	Main.wm.addKeybinding('hotkey', settings,
			      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
			      Shell.ActionMode.ALL,
			      () => {
				  this.toggleStrip();
			      }
			     );
	// synchronize hot key lock/unlock
	Main.wm.addKeybinding('hotkey-locked', settings,
			      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
			      Shell.ActionMode.ALL,
			      () => {
				  this.lockStrip();
			      }
			     );	
    }

    disable() {
        if (this._indicator) {
	    this._indicator.destroy();
	    this._indicator = null;
        }

	Main.wm.removeKeybinding('hotkey');
	Main.wm.removeKeybinding('hotkey-locked');
	setting_changed_signal_ids.forEach(id => settings.disconnect(id));
	setting_changed_signal_ids = [];
	settings = null;
	icon = null;
	this.icon_on = null;
	this.icon_off = null;
	this.pointerWatcher = null;
    }
}

function init() {
    ExtensionUtils.initTranslations();

    return new ReadingStrip();
}
