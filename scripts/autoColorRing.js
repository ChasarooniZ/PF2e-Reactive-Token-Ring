import { COLORS, MODULE_ID } from "./misc.js";
import { getHealthLevel } from "./systemCompatability.js";

export function autoColorRing() {
  const { ring, background } = this.document.ring.colors;
  const ringSetting = getSetting(this, "type", "ring");
  const backgroundSetting = getSetting(this, "type", "background");

  const colorMap = {
    health: (token, _type) =>
      getColorForHealthLevel(
        token.document.getFlag(MODULE_ID, "tokenHealthLevel") ??
          getHealthLevel(token.actor)
      ),
    disposition: (token, _type) =>
      ({
        [CONST.TOKEN_DISPOSITIONS.FRIENDLY]: Color.fromString(COLORS.GREEN),
        [CONST.TOKEN_DISPOSITIONS.NEUTRAL]: Color.fromString(COLORS.YELLOW),
        [CONST.TOKEN_DISPOSITIONS.HOSTILE]: Color.fromString(COLORS.RED),
      }[token.document.disposition]),
    levelDiff: (token, _type) => {
      const partyLevel =
        game.actors.party.members.reduce((tot, char) => tot + char.level, 0) /
          game.actors.party.members.length || 1;
      const levelDiff = token.actor.level - partyLevel;
      return Color.fromString(
        COLORS.PF2E.LEVELDIFF.DEFAULT[
          levelDiff <= -4
            ? "-4"
            : levelDiff <= -3
            ? "-3"
            : levelDiff <= -2
            ? "-2"
            : levelDiff <= -1
            ? "-1"
            : levelDiff <= 0
            ? "0"
            : levelDiff <= 1
            ? "+1"
            : levelDiff <= 2
            ? "+2"
            : levelDiff <= 3
            ? "+3"
            : "+4"
        ]
      );
    },
    custom: (_token, type) => getSetting(this, "color", type),
  };

  //Ring Color Set
  let ringColor = colorMap[ringSetting]?.(this, "ring") ?? ring;
  // Background Color Set
  let backgroundColor =
    colorMap[backgroundSetting]?.(this, "background") ?? background;

  const percentColor = game.settings.get(
    MODULE_ID,
    "auto-coloring.percent-color"
  );

  //Ring Color Scaling
  ringColor =
    ringSetting !== "unchanged"
      ? Color.multiplyScalar(ringColor, percentColor)
      : ringColor;
  //Background Color Scaling
  backgroundColor =
    backgroundSetting !== "unchanged"
      ? Color.multiplyScalar(backgroundColor, percentColor)
      : backgroundColor;

  return { ring: ringColor, background: backgroundColor };
}

/**
 * Calculate the color representing the current health level.
 * To scale from red to green, we apply the health level to the first third of the hue in HSV space.
 * @param {number} level - Health level from 0 (worst) to 1 (best).
 * @returns {Color}
 */
function getColorForHealthLevel(level) {
  return Color.fromHSV([level / 3.0, 1.0, 1.0]);
}

/**
 *
 * @param {*} actor Actor to getSettingFor
 * @param {"type" | "color"} typeOrColor "type" or "color"
 * @param {"ring" | "background"} ringOrBackground "ring" or "background"
 */
function getSetting(token, typeOrColor, ringOrBackground) {
  const actor = token.actor;
  const isParty = game.actors.party.members.some((a) => a.id === actor.id);
  const type = isParty
    ? "party"
    : {
        [CONST.TOKEN_DISPOSITIONS.FRIENDLY]: "friendly",
        [CONST.TOKEN_DISPOSITIONS.NEUTRAL]: "neutral",
        [CONST.TOKEN_DISPOSITIONS.HOSTILE]: "hostile",
      }[token.document.disposition] || "";

  return resolvePlayerWorldSetting(
    `auto-coloring.${ringOrBackground}.${typeOrColor}.${type}`
  );
}
