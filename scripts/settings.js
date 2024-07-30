import { MODULE_ID } from "./misc.js";

export function registerSettings() {
  game.settings.register(MODULE_ID, "target.share-flash", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.target.share-flash.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.target.share-flash.hint"
    ),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register(MODULE_ID, "target.player-color", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.target.player-color.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.target.player-color.hint"
    ),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
  game.settings.register(MODULE_ID, "damage-heal.scale-on-%-hp", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.damage-heal.scale-on-%-hp.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.damage-heal.scale-on-%-hp.hint"
    ),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register(MODULE_ID, "duration", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.duration.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.duration.hint"),
    scope: "world",
    config: true,
    default: 500,
    range: {
      min: 100,
      step: 10,
      max: 2000,
    },
    type: Number,
  });
  const autoColoringChoices = {
    "unchanged": game.i18n.localize(MODULE_ID + ".module-settings.auto-coloring.choices.unchanged"),
    "health": game.i18n.localize(MODULE_ID + ".module-settings.auto-coloring.choices.health"),
    "disposition": game.i18n.localize(MODULE_ID + ".module-settings.auto-coloring.choices.disposition"),
  }
  game.settings.register(MODULE_ID, "auto-coloring.ring", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.auto-coloring.ring.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.auto-coloring.ring.hint"),
    scope: "client",
    config: true,
    default: "unchanged",
    type: String,
    requiresReload: true,
    choices: autoColoringChoices,
  });
  game.settings.register(MODULE_ID, "auto-coloring.background", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.auto-coloring.background.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.auto-coloring.background.hint"),
    scope: "client",
    config: true,
    default: "unchanged",
    type: String,
    requiresReload: true,
    choices: autoColoringChoices,
  });
}
