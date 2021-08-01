/*
  Reading Strip, Reading guide on the computer for people with dyslexia.
  Copyright (C) 2021 Luigi Pantano

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
const { St, Clutter, GObject, Meta, Shell } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PointerWatcher = imports.ui.pointerWatcher;
const ExtensionUtils = imports.misc.extensionUtils;

const stripHeight = 36;
const stripOpacity = 90;
const stripColor = 'background-color : gold';
// TODO: adjust interval value according to different frame rates of different monitor
const interval = 1000 / Clutter.get_default_frame_rate();

let panelButton, strip, pointerWatch, settings;
let num_monitors = 1;

// follow cursor position, and monitor as well
function syncStrip(x, y, monitor_changed = false) {
	if (monitor_changed || num_monitors > 1) {
		const currentMonitor = Main.layoutManager.currentMonitor;
		strip.x = currentMonitor.x;
		strip.width = currentMonitor.width;
	}

	strip.y = (y - stripHeight / 2);
}

// toggle strip on or off
function toggleReadingStrip() {
	if (strip.visible) {
		strip.visible = false;
		settings.set_boolean('enabled', false);

		pointerWatch.remove();
		pointerWatch = null;
	}
	else {
		strip.visible = true;
		settings.set_boolean('enabled', true);

		const [x, y] = global.get_pointer();
		syncStrip(x, y, true);
		const pointerWatcher = PointerWatcher.getPointerWatcher();
		pointerWatch = pointerWatcher.addWatch(interval, syncStrip);
	}
}

const ReadingStrip = GObject.registerClass(
	class ReadingStrip extends PanelMenu.Button {
		_init() {
			super._init(null, 'ReadingStrip');
			let panelButtonIcon = new St.Icon({
				icon_name: 'emblem-important',
				icon_size: '24',
			});

			this.add_actor(panelButtonIcon);
			this.connect('button-press-event', toggleReadingStrip);
		}
	}
);

let monitor_change_signal_id = 0;

function enable() {
	// get settings
	settings = ExtensionUtils.getSettings();
	Main.wm.addKeybinding('readingstrip-hotkey', settings,
						  Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
						  Shell.ActionMode.ALL,
						  () => {
							  toggleReadingStrip();
						  });
	// create strip
	strip = new St.Widget({
		style: stripColor,
		opacity: stripOpacity,
		reactive: false,
		can_focus: false,
		track_hover: false,
		height: stripHeight,
		visible: false
	});

	Main.uiGroup.add_child(strip);

	// sync with current monitor
	const [x, y] = global.get_pointer();
	syncStrip(x, y, true);

	// load previous state
	if (settings.get_boolean('enabled')) {
		toggleReadingStrip();
	}

	// add button to top panel
	panelButton = new ReadingStrip();
	Main.panel.addToStatusArea('ReadingStrip', panelButton);

	// watch for monitor changes
	num_monitors = Main.layoutManager.monitors.length;
	monitor_change_signal_id = Main.layoutManager.connect('monitors-changed', () => {
		num_monitors = Main.layoutManager.monitors.length;
		const [x, y] = global.get_pointer();
		syncStrip(x, y, true);
	});
}

function disable() {
	// remove monitor change watch
	if (monitor_change_signal_id) {
		Main.layoutManager.disconnect(monitor_change_signal_id);
	}

	Main.wm.removeKeybinding('readingstrip-hotkey');
	settings = null;

	panelButton.destroy();
	panelButton = null;
	Main.uiGroup.remove_child(strip);

	if (pointerWatch) {
		pointerWatch.remove();
		pointerWatch = null;
	}

	if (strip) {
		strip.destroy;
		strip = null;
	}
}
