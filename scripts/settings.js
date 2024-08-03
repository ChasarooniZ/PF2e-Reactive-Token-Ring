import { COLORS, MODULE_ID } from "./misc.js";

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

  //Auto Color Ring
  const autoColoringChoices = {
    unchanged: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.choices.unchanged"
    ),
    health: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.choices.health"
    ),
    disposition: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.choices.disposition"
    ),
  };
  game.settings.register(MODULE_ID, "auto-coloring.ring", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.ring.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.ring.hint"
    ),
    scope: "client",
    config: true,
    default: "unchanged",
    type: String,
    requiresReload: true,
    choices: autoColoringChoices,
  });
  game.settings.register(MODULE_ID, "auto-coloring.background", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.background.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.background.hint"
    ),
    scope: "client",
    config: true,
    default: "unchanged",
    type: String,
    requiresReload: true,
    choices: autoColoringChoices,
  });
  game.settings.register(MODULE_ID, "auto-coloring.percent-color", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.percent-color.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.percent-color.hint"
    ),
    scope: "world",
    config: true,
    default: "0.75",
    type: Number,
    range: {
      min: 0,
      max: 1,
      step: 0.05,
    },
    requiresReload: true,
  });
  game.settings.register(MODULE_ID, "auto-coloring.background", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.background.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.background.hint"
    ),
    scope: "client",
    config: true,
    default: "unchanged",
    type: new foundry.data.fields.ColorField(),
    requiresReload: true,
    choices: autoColoringChoices,
  });
  //Color settings
  game.settings.register(MODULE_ID, "colors.damage", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.colors.damage.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.colors.damage.hint"),
    scope: "world",
    config: true,
    default: COLORS.RED,
    type: new foundry.data.fields.ColorField(),
    requiresReload: false
  });
  game.settings.register(MODULE_ID, "colors.healing", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.colors.healing.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.colors.healing.hint"),
    scope: "world",
    config: true,
    default: COLORS.GREEN,
    type: new foundry.data.fields.ColorField()
  });
  game.settings.register(MODULE_ID, "colors.target", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.colors.target.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.colors.target.hint"),
    scope: "world",
    config: true,
    default: COLORS.DEEPSKYBLUE,
    type: new foundry.data.fields.ColorField()
  });
  
  game.settings.register(MODULE_ID, "colors.status.positive", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.colors.status.positive.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.colors.status.positive.hint"),
    scope: "world",
    config: game.system.id === "pf2e",
    default: COLORS.PINK,
    type: new foundry.data.fields.ColorField()
  });
  game.settings.register(MODULE_ID, "colors.status.negative", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.colors.status.negative.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.colors.status.negative.hint"),
    scope: "world",
    config: game.system.id === "pf2e",
    default: COLORS.ORANGE,
    type: new foundry.data.fields.ColorField()
  });
}
