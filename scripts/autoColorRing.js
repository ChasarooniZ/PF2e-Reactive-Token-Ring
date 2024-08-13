import { COLORS, MODULE_ID } from "./misc.js";
import { getHealthLevel } from "./systemCompatability.js";

/**
 * Check if the token is a valid disposition for our health target setting.
 * @param {Object} Token instance
 * @returns {boolean} If the token should be colored
 */
function getValidHealthTarget(token) {
  const healthTargetsSetting = game.settings.get(
    MODULE_ID,
    "auto-coloring.health-targets"
  );
  if (
    token.document.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY &&
    (healthTargetsSetting === "non-friendly" ||
      healthTargetsSetting === "hostile")
  )
    return false;
  if (
    token.document.disposition == CONST.TOKEN_DISPOSITIONS.HOSTILE &&
    (healthTargetsSetting === "non-hostile" ||
      healthTargetsSetting === "friendly")
  )
    return false;
  if (
    token.document.disposition == CONST.TOKEN_DISPOSITIONS.NEUTRAL &&
    (healthTargetsSetting === "hostile" || healthTargetsSetting === "friendly")
  )
    return false;
  return !(
    token.document.disposition == CONST.TOKEN_DISPOSITIONS.SECRET &&
    healthTargetsSetting !== "all"
  );
}

export function autoColorRing() {
  let ringColor = this.document.ring.colors.ring;
  let backgroundColor = this.document.ring.colors.background;
  const overideColor = game.settings.get(
    MODULE_ID,
    "auto-coloring.override-color"
  );
  const ringSetting = game.settings.get(MODULE_ID, "auto-coloring.ring");
  const backgroundSetting = game.settings.get(
    MODULE_ID,
    "auto-coloring.background"
  );

  if (ringSetting === "health" || backgroundSetting === "health") {
    const level =
      this.document.getFlag(MODULE_ID, "tokenHealthLevel") ??
      getHealthLevel(this.actor);
    if (!isNaN(level)) {
      const healthColor = getColorForHealthLevel(level);
      const valid = getValidHealthTarget(this);
      if (ringSetting === "health" && valid) ringColor = healthColor;
      if (backgroundSetting === "health" && valid)
        backgroundColor = healthColor;
    }
  }

  if (ringSetting === "disposition" || backgroundSetting === "disposition") {
    let dispositionColor = undefined;
    switch (this.document.disposition) {
      case CONST.TOKEN_DISPOSITIONS.FRIENDLY:
        dispositionColor = Color.fromString(COLORS.GREEN);
        break;
      case CONST.TOKEN_DISPOSITIONS.NEUTRAL:
        dispositionColor = Color.fromString(COLORS.YELLOW);
        break;
      case CONST.TOKEN_DISPOSITIONS.HOSTILE:
        dispositionColor = Color.fromString(COLORS.RED);
        break;
    }
    if (ringSetting === "disposition") ringColor = dispositionColor;
    if (backgroundSetting === "disposition") backgroundColor = dispositionColor;
  }

  if (ringSetting === "levelDiff" || backgroundSetting === "levelDiff") {
    const partyLevel =
      game.actors.party.members.reduce((tot, char) => (tot += char.level), 0) /
        game.actors.party.members.length ?? 1;
    const charLevel = this.actor.level;
    const levelDiff = charLevel - partyLevel;
    let levelDiffColor = undefined;
    if (levelDiff <= -4) {
      // PL -4
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["-4"]);
    } else if (levelDiff <= -3) {
      // PL -3
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["-3"]);
    } else if (levelDiff <= -2) {
      // PL -2
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["-2"]);
    } else if (levelDiff <= -1) {
      // PL -1
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["-1"]);
    } else if (levelDiff <= 0) {
      // PL
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["0"]);
    } else if (levelDiff <= 1) {
      // PL +1
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["+1"]);
    } else if (levelDiff <= 2) {
      // PL +2
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["+2"]);
    } else if (levelDiff <= 3) {
      // PL +3
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["+3"]);
    } else {
      // PL +4
      levelDiffColor = Color.fromString(COLORS.PF2E.LEVELDIFF.DEFAULT["+4"]);
    }
    if (ringSetting === "levelDiff") ringColor = levelDiffColor;
    if (backgroundSetting === "levelDiff") backgroundColor = levelDiffColor;
  }

  const percentColor = game.settings.get(
    MODULE_ID,
    "auto-coloring.percent-color"
  );
  if (ringSetting !== "unchanged" && ringColor) {
    ringColor = Color.multiplyScalar(ringColor, percentColor);
  }
  if (backgroundSetting !== "unchanged" && backgroundColor) {
    backgroundColor = Color.multiplyScalar(backgroundColor, percentColor);
  }
  if (!overideColor) {
    if (this.document.ring.colors.ring !== null)
      ringColor = this.document.ring.colors.ring;
    if (this.document.ring.colors.background !== null)
      backgroundColor = this.document.ring.colors.background;
  }
  return {
    ring: ringColor,
    background: backgroundColor,
  };
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
