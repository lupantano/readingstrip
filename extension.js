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
const Mainloop = imports.mainloop;

const stripHeight = 36;
const stripOpacity = 90;

let panelButton, panelButtonText, timeout,  strip;

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

  strip = new St.Icon({
    style : 'background-color : gold',
    reactive : false,
    can_focus : false,
    track_hover : false,
    opacity: stripOpacity,
    width : (1.5 * 2560),
    //width : 1.5 * Gdk.Monitor.get_width_mm();
    height : stripHeight,
    x : 0,
    y : 0,
  });

  Main.uiGroup.add_child(strip);
  Main.panel._rightBox.insert_child_at_index(panelButton, 1);
  timeout = Mainloop.timeout_add_seconds(0.5, followMouse);
}

function disable() {
  Main.panel._rightBox.remove_child(panelButton);
  Mainloop.source_remove(timeout);
  Main.uiGroup.remove_child(strip);
  strip.destroy;
  strip = null;
}
