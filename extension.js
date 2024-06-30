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
import St from 'gi://St';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {
  Extension,
  gettext as _,
} from 'resource:///org/gnome/shell/extensions/extension.js';

import { getPointerWatcher } from "resource:///org/gnome/shell/ui/pointerWatcher.js";

export default class ReadingStrip extends Extension {
    // follow cursor position, and monitor as well
    syncStrip() {
	const [x, y] = global.get_pointer();
	const currentMonitor = Main.layoutManager.currentMonitor;
	
	this.strip_h.x = currentMonitor.x;
	this.strip_h.y = y - this.strip_h.height / 2;
	this.strip_h.width = currentMonitor.width;
	
	this.strip_v.x = x - this.strip_v.width;
	this.strip_v.y = currentMonitor.y;
	this.strip_v.height = currentMonitor.height;
	
	this.focus_up.x = currentMonitor.x;
	this.focus_up.y = -currentMonitor.height + y - this.strip_h.height / 2;
	this.focus_up.width = currentMonitor.width;
	this.focus_up.height = currentMonitor.height;
	
	this.focus_down.x = currentMonitor.x;
	this.focus_down.y = y + this.strip_h.height / 2;
	this.focus_down.width = currentMonitor.width;
	this.focus_down.height = currentMonitor.height;
    }

    // toggle strip on or off
    toggleStrip() {
	this.strip_h.visible = !this.strip_h.visible;
	this.strip_v.visible = this.strip_h.visible;
	this.focus_up.visible = this.strip_h.visible;
	this.focus_down.visible = this.strip_h.visible;
	this._settings.set_boolean('enabled', this.strip_h.visible);
	
	this.strip_locked = 0;
	
	if (this.icon.gicon == this.icon_on) {
	    this.icon.gicon = this.icon_off;
	    this._buttonSwitchItem.setToggleState(false);
	    this.pointerWatch.remove();
	    this.pointerWatch = null;
	} else {
	    this.icon.gicon = this.icon_on;
	    this._buttonSwitchItem.setToggleState(true);
	    this.syncStrip(true);
	    this.pointerWatch = this.pointerWatcher.addWatch(this.refresh, this.syncStrip);
	}
    }

    // lock/unlock strip on screen
    lockStrip() {
	if (!this.strip_locked) {
	    this.pointerWatch.remove();
	    this.pointerWatch = null;
	    this.strip_locked = 1;
	} else {
	    this.syncStrip(true);
	    this.pointerWatch = this.pointerWatcher.addWatch(this.refresh, this.syncStrip);
	    this.strip_locked = 0;
	}
    }

    onSettingsChanged() {
	this.strip_h.style = 'background-color : ' + this._settings.get_string('color-strip') + ';border: 1px solid #708090;';
	this.strip_h.opacity = this._settings.get_double('opacity') * 255/100;
	this.strip_h.height = this._settings.get_double('height') * Main.layoutManager.currentMonitor.height/100;

	this.strip_v.visible = this.strip_h.visible && this._settings.get_boolean('vertical');
	this.strip_v.style = this.strip_h.style;
	this.strip_v.opacity = this.strip_h.opacity;
	this.strip_v.width = this.strip_h.height / 4;

	this.focus_up.visible = this.strip_h.visible && this._settings.get_boolean('focusmode');
	this.focus_up.style = 'background-color : ' + this._settings.get_string('color-focus');

	this.focus_down.visible = this.strip_h.visible && this._settings.get_boolean('focusmode');
	this.focus_down.style = 'background-color : ' + this._settings.get_string('color-focus');

	this.refresh = this._settings.get_int('refresh');
    }

    enable() {
	this.refresh = 1, this.strip_locked = 0;
	this.setting_changed_signal_ids = [];
	
	this.icon_on = Gio.icon_new_for_string(`${this.path}/icons/readingstrip-on-symbolic.svg`);
	this.icon_off = Gio.icon_new_for_string(`${this.path}/icons/readingstrip-off-symbolic.svg`);
	this.pointerWatcher = getPointerWatcher();
	
	// Load settings
	this._settings = this.getSettings();

	// add to top panel
	this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
	this.icon = new St.Icon({
	    gicon : this.icon_off,
	    style_class: 'system-status-icon',
	});	
        this._indicator.add_child(this.icon);
	
	this._buttonSwitchItem = new PopupMenu.PopupSwitchMenuItem(_('Show/Hide'), { status: false }, {});
	this._buttonSwitchItem.connect('toggled', () => {
            this.toggleStrip();
	});
	this._buttonSwitchItem.setToggleState(false);
	this._indicator.menu.addMenuItem(this._buttonSwitchItem);
	this._indicator.menu.addAction(_('Settings...'), () => this.openPreferences(), 'settings-symbolic');
	
	Main.panel.addToStatusArea(this.metadata.uuid, this._indicator);
        this._count = 0;

	// create vertical strip
	this.strip_v = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false
	});
	Main.uiGroup.add_child(this.strip_v);

	// create horizontal strip
	this.strip_h = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false
	});
	Main.uiGroup.add_child(this.strip_h);

	// create vertical strip
	this.strip_v = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false
	});
	Main.uiGroup.add_child(this.strip_v);

	// create  - focus
	this.focus_up = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false,
	    opacity: 75 * 255/100
	});
	Main.uiGroup.add_child(this.focus_up);

	this.focus_down = new St.Widget({
	    reactive: false,
	    can_focus: false,
	    track_hover: false,
	    visible: false,
	    opacity: 75 * 255/100
	});
	Main.uiGroup.add_child(this.focus_down);

	// synchronize extension state with current settings
	this.setting_changed_signal_ids.push(this._settings.connect('changed', this.onSettingsChanged));

	// load previous state
	if (this._settings.get_boolean('enabled')) {
	    this.toggleStrip();
	    this.onSettingsChanged();
	}

	// synchronize hot key enable/disable
	Main.wm.addKeybinding('hotkey', this._settings,
			      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
			      Shell.ActionMode.ALL,
			      () => {
				  this.toggleStrip();
			      }
			     );
	// synchronize hot key lock/unlock
	Main.wm.addKeybinding('hotkey-locked', this._settings,
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

	this.strip_h.visible = false;
	this.strip_v.visible = false;
	this.focus_up.visible = false;
	this.focus_down.visible = false;

	Main.wm.removeKeybinding('hotkey');
	Main.wm.removeKeybinding('hotkey-locked');
	this.setting_changed_signal_ids.forEach(id => this._settings.disconnect(id));
	this.setting_changed_signal_ids = [];
	this._settings = null;
	this.icon = null;
	this.icon_on = null;
	this.icon_off = null;
	this.pointerWatcher = null;
    }
}

function init() {
    ExtensionUtils.initTranslations();

    return new ReadingStrip();
}
