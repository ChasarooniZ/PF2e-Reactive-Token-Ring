import { COLORS, MODULE_ID } from "./misc.js";
import { resolvePlayerWorldSetting } from "./settings.js";
import { getHealthLevel } from "./systemCompatability.js";

export function autoColorRing() {
  // Ensure this.document and this.document.ring exist
  const ringColors = this.document?.ring?.colors || {};
  const { ring, background } = ringColors;
  try {
    const ringSetting = getSetting(this, "type", "ring");
    const backgroundSetting = getSetting(this, "type", "bg");

    const colorMap = {
      "health-percent": (token, _type) =>
        getColorForHealthLevel(
          token.document?.getFlag(MODULE_ID, "tokenHealthLevel") ??
            getHealthLevel(token.actor)
        ),
      disposition: (token, _type) => {
        const disposition = token?.document?.disposition;
        return (
          {
            [CONST.TOKEN_DISPOSITIONS.SECRET]: Color.fromString(COLORS.MAGENTA),
            [CONST.TOKEN_DISPOSITIONS.FRIENDLY]: Color.fromString(COLORS.GREEN),
            [CONST.TOKEN_DISPOSITIONS.NEUTRAL]: Color.fromString(COLORS.YELLOW),
            [CONST.TOKEN_DISPOSITIONS.HOSTILE]: Color.fromString(COLORS.RED),
          }[disposition] || Color.fromString(COLORS.WHITE)
        );
      },
      "level-diff": (token, _type) => {
        const party = game.actors?.party;
        const partyMembers = party?.members || [];
        const partyLevel =
          partyMembers?.reduce((tot, char) => tot + (char.level || 0), 0) /
            (partyMembers.length || 1) || 1;
        const levelDiff = (token?.actor?.level || 0) - partyLevel;
        const levelKey =
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
            : "+4";
        return Color.fromString(
          COLORS.PF2E.LEVELDIFF.DEFAULT[levelKey] || COLORS.WHITE
        );
      },
      random: (token, _type) => {
        return Color.fromString(
          COLORS.RANDOM[token.id.charCodeAt(0) % 16]
        );
      },
      custom: (_token, type) =>
        Color.fromString(
          getSetting(this, "custom-color", type) || COLORS.WHITE
        ),
    };

    // Ring Color Set
    let ringColor = colorMap[ringSetting]?.(this, "ring") || ring;
    // Background Color Set
    let backgroundColor =
      colorMap[backgroundSetting]?.(this, "bg") || background;

    const percentColor = game.settings.get(
      MODULE_ID,
      "auto-coloring.percent-color"
    );

    // Ring Color Scaling
    ringColor = !["unchanged", "custom"].includes(ringSetting)
      ? Color.from(Color.multiplyScalar(ringColor, percentColor))
      : ringColor;
    // Background Color Scaling
    backgroundColor = !["unchanged", "custom"].includes(backgroundSetting)
      ? Color.from(Color.multiplyScalar(backgroundColor, percentColor))
      : backgroundColor;

    return { ring: ringColor, background: backgroundColor };
  } catch (err) {
    console.error(err);
    return { ring, background };
  }
}

/**
 * Calculate the color representing the current health level.
 * To scale from red to green, we apply the health level to the first third of the hue in HSV space.
 * @param {number} level - Health level from 0 (worst) to 1 (best).
 * @returns {Color}
 */
function getColorForHealthLevel(level) {
  return Color.fromHSV([isNaN(level) ? 1 : level / 3.0, 1.0, 1.0]);
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
        [CONST.TOKEN_DISPOSITIONS.SECRET]: "secret",
        [CONST.TOKEN_DISPOSITIONS.FRIENDLY]: "friendly",
        [CONST.TOKEN_DISPOSITIONS.NEUTRAL]: "neutral",
        [CONST.TOKEN_DISPOSITIONS.HOSTILE]: "hostile",
      }?.[token?.document?.disposition] || "secret";

  return resolvePlayerWorldSetting(
    `auto-coloring.${type}.${ringOrBackground}.${typeOrColor}`
  );
}
