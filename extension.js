/*
  Reading Strip, Reading guide on the computer for people with dyslexia.
  Copyright (C) 2021-25 Luigi Pantano

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
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { getPointerWatcher } from "resource:///org/gnome/shell/ui/pointerWatcher.js";

import {
  Extension,
  gettext as _,
} from 'resource:///org/gnome/shell/extensions/extension.js';

var Strip = GObject.registerClass(
class Strip extends St.Widget {
    _init(name) {
        super._init({
	    name: name,
            reactive: false,
            can_focus: false,
            track_hover: false,
            visible: false
        });
	this.locked = false;
        Main.uiGroup.add_child(this);
    }

    show_hide() {
        this.visible = !this.visible;
	log('[ReadingStrip]', 'visible:', this.visible);
    }

    lock_unlock() {
	this.locked = !this.locked;
	log('[ReadingStrip]', 'locked:', this.locked);
    }
    
    status() {
	log('ReadingStrip: ', this.name,
	    'visible = ', this.visible,
	    'opacity = ', this.opacity,
	    'style = ', this.style,
	    'x=', this.x,
	    'y=', this.y,
	    'width=', this.width,
	    'height=', this.height)
    }

    sync(y, monitor) {
        this.x = monitor.x;
        this.y = y;
        this.width = monitor.width;

        if (this.name != 'sMiddle') {
            this.height = monitor.height;
        }
    }

    destroy() {
        super.destroy();
    }
});

export default class ReadingStrip extends Extension {
    // follow cursor position, and monitor as well
    syncStrip() {
	const [x, y] = global.get_pointer();
	const currentMonitor = Main.layoutManager.currentMonitor;

	log(x,y, currentMonitor);
	
	if (this.sMiddle.visible == true && this.sMiddle.locked == false) {
	    log('move on');
	    this.sTop.sync(-currentMonitor.height + y - this.sMiddle.height / 2, currentMonitor);
	    this.sMiddle.sync(y - this.sMiddle.height / 2, currentMonitor);
	    this.sBottom.sync(y + this.sMiddle.height / 2, currentMonitor);
	}
    }

    // toggle strip on or off
    toggleStrip() {
	this.sMiddle.show_hide();
	
	if (this._settings.get_boolean('focusmode')) {
	    this.sTop.show_hide();
	    this.sBottom.show_hide();
	}

	// update icon status and switch status
	if (this.sMiddle.visible) {
	    this._icon.gicon = this._icon_on;
	} else {
	    this._icon.gicon = this._icon_off;
	}
	this._buttonSwitchItem.setToggleState(this.sMiddle.visible);
    }

    onSettingsChanged() {
	this.sMiddle.style = 'background-color : ' + this._settings.get_string('color-strip') + ';border: 1px solid #708090;';
	this.sMiddle.opacity = 255 * this._settings.get_double('opacity')/100;
	this.sMiddle.height =  Main.layoutManager.currentMonitor.height * this._settings.get_double('height')/100;

	this.sTop.visible = this.sBottom.visible = this.sMiddle.visible && this._settings.get_boolean('focusmode');
	this.sTop.opacity = this.sBottom.opacity = 255 * 75/100;
	this.sTop.style = this.sBottom.style = 'background-color : ' + this._settings.get_string('color-focus');

	this.refresh = this._settings.get_int('refresh');
    }
    
    enable() {
	// add Stripes
	this.sTop = new Strip('sTop');
	this.sMiddle = new Strip('sMiddle');
	this.sBottom = new Strip('sBottom');
	
	// add to top panel
	this._icon_on = Gio.icon_new_for_string(`${this.path}/icons/readingstrip-on-symbolic.svg`);
	this._icon_off = Gio.icon_new_for_string(`${this.path}/icons/readingstrip-off-symbolic.svg`);
	
	this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
	this._icon = new St.Icon({
	    gicon : this._icon_off,
	    style_class: 'system-status-icon',
	});	
        this._indicator.add_child(this._icon);
	
	this._buttonSwitchItem = new PopupMenu.PopupSwitchMenuItem(_('Show/Hide'), false, {});
	this._buttonSwitchItem.connect('toggled', () => {
            this.toggleStrip();
	});
	this._indicator.menu.addMenuItem(this._buttonSwitchItem);
	this._indicator.menu.addAction(
	    _('Settings...'),
	    () => this.openPreferences(),
	    'org.gnome.Settings-symbolic'
	);
	
	Main.panel.addToStatusArea(this.metadata.uuid, this._indicator);

	// settings
	this._settings = this.getSettings();
	this._setting_changed_signal_ids = [];
	this._setting_changed_signal_ids.push(this._settings.connect('changed', () => {this.onSettingsChanged()}));
	this.onSettingsChanged();
	
	// add pointer
	this.pointerWatcher = getPointerWatcher();
	this.pointerWatch = this.pointerWatcher.addWatch(
	    this.refresh,
	    this.syncStrip.bind(this)
	);
	
	// synchronize hot key enable/disable
	Main.wm.addKeybinding('hotkey',
			      this._settings,
			      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
			      Shell.ActionMode.ALL,
			      () => {
				  this.toggleStrip();
			      }
			     );
	// synchronize hot key lock/unlock
	Main.wm.addKeybinding('hotkey-locked',
			      this._settings,
			      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
			      Shell.ActionMode.ALL,
			      () => {
				  this.sMiddle.lock_unlock();
			      }
			     );
    }

    disable() {
	this._indicator.destroy();
	this._indicator = null;

	this.sTop.destroy();
	this.sMiddle.destroy();
	this.sBottom.destroy();

	this._setting_changed_signal_ids.forEach(id => this._settings.disconnect(id));
	this._setting_changed_signal_ids = [];
	this._settings = null;

	this.pointerWatch.remove();
	this.pointerWatch = null;
	
	this.icon = null;
	this.icon_on = null;
	this.icon_off = null;

	Main.wm.removeKeybinding('hotkey');
	Main.wm.removeKeybinding('hotkey-locked');
    }
}
