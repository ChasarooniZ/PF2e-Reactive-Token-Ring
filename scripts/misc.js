export const MODULE_ID = "pf2e-reactive-token-ring";
// Define color constants
export const COLORS = {
  GREEN: "#ADFF2F",
  RED: "#FF0000",
  YELLOW: "#FFFF00",
  PURPLE: "#9370DB",
  WHITE: "#FFFFFF",
  DEEPSKYBLUE: "#00BFFF",
  ORANGE: "#FFA500",
  PINK: "#FF69B4",
  PF2E: {
    LEVELDIFF: {
      "-4": "#FFFFFF", //White
      "-3": "#add8e6", //Light Blue
      "-2": "#008000", //Green
      "-1": "#ffff00", //Yellow
      0: "#ffa500", // Orange
      "+1": "#FF0000", //Red
      "+2": "#8b0000", //Dark Red
      "+3": "#800080", //purple
      "+4": "#000000", //Black
    },
  },
};
export const CONDITIONS = {
  POSITIVE: ["concealed", "hidden", "invisible", "quickened", "undetected"],
  NEGATIVE: [
    "blinded",
    "clumsy",
    "confused",
    "controlled",
    "dazzled",
    "deafened",
    "doomed",
    "drained",
    "dying",
    "encumbered",
    "enfeebled",
    "fascinated",
    "fatigued",
    "fleeing",
    "frightened",
    "grabbed",
    "immobilized",
    "off-guard",
    "paralyzed",
    "persistent-damage",
    "petrified",
    "prone",
    "restrained",
    "sickened",
    "slowed",
    "stunned",
    "stupefied",
  ],
  DEAD: ["dead", "unconscious", "wounded"],
};
