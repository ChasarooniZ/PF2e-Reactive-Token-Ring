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

  //Color settings
  game.settings.register(MODULE_ID, "colors.damage", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.colors.damage.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.colors.damage.hint"),
    scope: "world",
    config: true,
    default: COLORS.RED,
    type: new foundry.data.fields.ColorField(),
    requiresReload: false,
  });
  game.settings.register(MODULE_ID, "colors.healing", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.colors.healing.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.colors.healing.hint"
    ),
    scope: "world",
    config: true,
    default: COLORS.GREEN,
    type: new foundry.data.fields.ColorField(),
  });
  game.settings.register(MODULE_ID, "colors.target", {
    name: game.i18n.localize(MODULE_ID + ".module-settings.colors.target.name"),
    hint: game.i18n.localize(MODULE_ID + ".module-settings.colors.target.hint"),
    scope: "world",
    config: true,
    default: COLORS.DEEPSKYBLUE,
    type: new foundry.data.fields.ColorField(),
  });

  game.settings.register(MODULE_ID, "colors.status.positive", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.colors.status.positive.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.colors.status.positive.hint"
    ),
    scope: "world",
    config: game.system.id === "pf2e",
    default: COLORS.PINK,
    type: new foundry.data.fields.ColorField(),
  });
  game.settings.register(MODULE_ID, "colors.status.negative", {
    name: game.i18n.localize(
      MODULE_ID + ".module-settings.colors.status.negative.name"
    ),
    hint: game.i18n.localize(
      MODULE_ID + ".module-settings.colors.status.negative.hint"
    ),
    scope: "world",
    config: game.system.id === "pf2e",
    default: COLORS.ORANGE,
    type: new foundry.data.fields.ColorField(),
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
  const actorTypes = ["hostile", "neutral", "friendly"];
  if (game.system.id === "pf2e") {
    autoColoringChoices.levelDiff = game.i18n.localize(
      MODULE_ID + ".module-settings.auto-coloring.choices.levelDiff"
    );
    actorTypes.push("party");
  }

  for (const type of actorTypes) {
    for (const part of ["ring", "background"]) {
      for (const setting of ["type", "custom-color"]) {
        const path = `auto-coloring.affects.${type}.${part}.${setting}`;
        const def = getDefault(setting, type);
        const ty =
          setting === "type" ? String : new foundry.data.fields.ColorField();
        const body = {
          name: game.i18n.localize(
            MODULE_ID + ".module-settings." + path + ".name"
          ),
          hint: game.i18n.localize(
            MODULE_ID + ".module-settings." + path + ".hint"
          ),
          scope: "world",
          config: true,
          default: def,
          type: ty,
          requiresReload: true,
        };

        if (setting === "type") {
          body.choices = autoColoringChoices;
        }
        game.settings.register(MODULE_ID, path, body);
      }
    }
  }

  //OLD Auto Color Ring

  // game.settings.register(MODULE_ID, "auto-coloring.override-color", {
  //   name: game.i18n.localize(
  //     MODULE_ID + ".module-settings.auto-coloring.override-color.name"
  //   ),
  //   hint: game.i18n.localize(
  //     MODULE_ID + ".module-settings.auto-coloring.override-color.hint"
  //   ),
  //   scope: "world",
  //   config: true,
  //   default: false,
  //   type: Boolean,
  // });
}

function getDefault(setting, type) {
  if (setting === "type") return "unchanged";
  if (type === "party") return COLORS.DEEPSKYBLUE;
  if (type === "friendly") return COLORS.GREEN;
  if (type === "hostile") return COLORS.RED;
  if (type === "neutral") return COLORS.YELLOW;
  return null;
}
