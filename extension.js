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
const Gdk = imports.gi.Gdk
const Main = imports.ui.main;

const stripHeight = 36;
const stripOpacity = 90;

let panelButton, panelButtonText, strip;

function followMouse(){
  let [mouse_x, mouse_y, mask] = global.get_pointer();
  strip.y = (mouse_y - stripHeight/2);
  return true;
}

function enable() {
  panelButton = new St.Bin({
    style_class : "panel-button"
  });
  panelButtonText = new St.Label({
    text : "[Reagind Strip]",
    y_align: Clutter.ActorAlign.CENTER,
  });
  panelButton.set_child(panelButtonText);

  strip = new St.Widget({
    style : 'background-color : gold',
    reactive : false,
    can_focus : false,
    track_hover : false,
    opacity: stripOpacity,
    width : (1.5 * 2560),
    height : stripHeight,
    x : 0,
    y : 0,
  });

  const PointerWatcher = imports.ui.pointerWatcher;
  let interval = 1000 / Clutter.get_default_frame_rate();
  let pointerWatch = PointerWatcher.getPointerWatcher().addWatch(interval, (x, y) => {
        strip.y = (y - stripHeight/2);
        return true;
  });

  Main.uiGroup.add_child(strip);
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);
}

function disable() {
  Main.panel._rightBox.remove_child(panelButton);
  Main.uiGroup.remove_child(strip);

  pointerWatch.remove();
  pointerWatch = null;
  strip.destroy;
  strip = null;
}
