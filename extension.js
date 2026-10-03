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

const Strip = GObject.registerClass(
class Strip extends St.Widget {
    _init(name) {
        super._init({
	    name,
            reactive: false,
            can_focus: false,
            track_hover: false,
            visible: false
        });
	
	this.locked = false;
        Main.uiGroup.add_child(this);
    }

    toggleVisible() {
        this.visible = !this.visible;
    }

    toggleLocked() {
	this.locked = !this.locked;
    }

    sync(x, y, monitor) {
        if (this.name === 'sVertical') {
            this.set_position(x - this.width, monitor.y);
            this.height = monitor.height;
        } else {
	    this.set_position(monitor.x, y);
            this.width = monitor.width;

            if (this.name != 'sMiddle') {
                this.height = monitor.height;
            }
        }
    }
});

export default class ReadingStrip extends Extension {
    // follow cursor position and monitor as well
    syncStrip() {
	const currentMonitor = Main.layoutManager.currentMonitor;
	const [x, y] = global.get_pointer();
        const middleOffset = this.sMiddle.height / 2;
	
	if (this.sMiddle.visible && !this.sMiddle.locked) {
            this.sTop.sync(x, -currentMonitor.height + y - middleOffset, currentMonitor);
            this.sMiddle.sync(x,
                              y - middleOffset,
                              currentMonitor
                             );
             this.sBottom.sync(x, y + middleOffset, currentMonitor);
            
            if (this.sVertical) {
                this.sVertical.sync(x, y, currentMonitor);
            }
	}
    }

    // update icon status
    updateIcon() {
        if (!this.sMiddle.visible) {
            this._icon.gicon = this._icon_off;
        } else if (this.sMiddle.locked) {
            this._icon.gicon = this._icon_locked;
        } else {
            this._icon.gicon = this._icon_on;
        }
    }

    // toggle strip on or off
    toggleStrip() {      
        this.sMiddle.toggleVisible();

        const visible = this.sMiddle.visible;
        const focusMode = this._settings.get_boolean('focusmode');
        const vertical = this._settings.get_boolean('vertical');
        
        this.sTop.visible = this.sBottom.visible = visible && focusMode;
        this.sVertical.visible = visible && vertical;

        // update settings
        this._settings.set_boolean('enabled', visible);

	// add or remove pointer watcher
	if (visible) {
            if (!this.pointerWatch) {
                this.pointerWatcher = getPointerWatcher();
	        this.pointerWatch = this.pointerWatcher.addWatch(
		    this.refresh,
		    this.syncStrip.bind(this)
	        );
            }
	} else {
            if (this.pointerWatch) {
	        this.pointerWatch.remove();
	        this.pointerWatch = null;
            }
	}
    }

    onSettingsChanged() {
	this.sMiddle.style = 'background-color : ' + this._settings.get_string('color-strip') + ';border: 1px solid #708090;';
	this.sMiddle.opacity = 255 * this._settings.get_double('opacity')/100;
	this.sMiddle.height =  Main.layoutManager.currentMonitor.height * this._settings.get_double('height')/100;

	this.sTop.visible = this.sBottom.visible = this.sMiddle.visible && this._settings.get_boolean('focusmode');
	this.sTop.opacity = this.sBottom.opacity = 255 * 75/100;
	this.sTop.style = this.sBottom.style = 'background-color : ' + this._settings.get_string('color-focus');

        this.sVertical.visible = this.sMiddle.visible && this._settings.get_boolean('vertical');
        this.sVertical.style = this.sMiddle.style;
        this.sVertical.opacity = this.sMiddle.opacity;
        this.sVertical.width = this.sMiddle.height / 4;
        
	this.refresh = this._settings.get_int('refresh');
        this.syncStrip();
    }
    
    enable() {
        this.pointerWatch = null;
        this.pointerWatcher = null; 
        
	// add Stripes
	this.sTop = new Strip('sTop');
	this.sMiddle = new Strip('sMiddle');
	this.sBottom = new Strip('sBottom');
        this.sVertical = new Strip('sVertical');
	
	// add to top panel
	this._icon_on = Gio.icon_new_for_string(`${this.path}/icons/readingstrip-on-symbolic.svg`);
	this._icon_off = Gio.icon_new_for_string(`${this.path}/icons/readingstrip-off-symbolic.svg`);
        this._icon_locked = Gio.icon_new_for_string(`${this.path}/icons/readingstrip-locked-symbolic.svg`);
	
	this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
	this._icon = new St.Icon({
	    gicon : this._icon_off,
	    style_class: 'system-status-icon',
	});	
        this._indicator.add_child(this._icon);
	
	this._buttonSwitchItem = new PopupMenu.PopupSwitchMenuItem(_('Show/Hide'), false, {});
	this._buttonSwitchItem.connect('toggled', () => {
            this.toggleStrip();
            this.updateIcon();
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

        if (this._settings.get_boolean('enabled')) {
            this._buttonSwitchItem.setToggleState(!this.sMiddle.visible);
        }
        
        // synchronize hot key enable/disable
        Main.wm.addKeybinding(
            "show",
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL,
            () => {
                this._buttonSwitchItem.setToggleState(!this.sMiddle.visible);
                this.updateIcon();
            }
        );

	// synchronize hot key lock/unlock
        Main.wm.addKeybinding(
            "lock",
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL,
            () => {
                this.sMiddle.toggleLocked();
                this.updateIcon();
            }
        );
    }

    disable() {
	this._indicator.destroy();
	this._indicator = null;
        
        this._buttonSwitchItem.destroy();
        this._buttonSwitchItem = null;

        this.sTop.destroy();
	this.sTop = null;

        this.sMiddle.destroy();
	this.sMiddle = null;

        this.sBottom.destroy();
	this.sBottom = null;

        this.sVertical.destroy();
        this.sVertical = null;

	this._setting_changed_signal_ids.forEach(id => this._settings.disconnect(id));
	this._setting_changed_signal_ids = [];
	this._settings = null;

        if (this.pointerWatch){
	    this.pointerWatch.remove();
	    this.pointerWatch = null;
        }
        this.pointerWatcher = null;

	this._icon.destroy();
        this._icon = null;
	this._icon_on = null;
	this._icon_off = null;
        this._icon_locked = null;
        
	Main.wm.removeKeybinding('show');
	Main.wm.removeKeybinding('lock');
    }
}
