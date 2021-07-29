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
const {St, Clutter} = imports.gi;
const Main = imports.ui.main;

const stripHeight = 36;
const stripOpacity = 90;
const stripColor = 'background-color : gold';

let panelButton, panelButtonIcon, strip, pointerWatch;

function enable() {
  // Detect Screen
  let pMonitor = Main.layoutManager.primaryMonitor;

  // Add to Panel
  panelButton = new St.Bin({
    style_class : "panel-button"
  });
  panelButtonIcon = new St.Icon({
    icon_name: 'emblem-important',
    icon_size: '24',
  });
  panelButton.set_child(panelButtonIcon);
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);

  // Create Strip
  strip = new St.Widget({
    style : stripColor,
    opacity: stripOpacity,
    reactive : false,
    can_focus : false,
    track_hover : false,
    width: pMonitor.width,
    height : stripHeight,
  });
  Main.uiGroup.add_child(strip);

  // Follow mouse
  const PointerWatcher = imports.ui.pointerWatcher;
  let interval = 1000 / Clutter.get_default_frame_rate();
  pointerWatch = PointerWatcher.getPointerWatcher().addWatch(interval, (x, y) => {
        strip.y = (y - stripHeight/2);
        return true;
  });
}

function disable() {
  Main.panel._rightBox.remove_child(panelButton);
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
