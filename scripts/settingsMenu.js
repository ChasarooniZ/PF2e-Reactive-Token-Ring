import { MODULE_ID } from "./misc.js";

/**
 * Function to create a table row representing settings for a specific token type and background.
 * @param {string} key - The key representing the token type and background (e.g., "party.ring").
 * @param {string} savedType - The saved type setting for the token.
 * @param {string} savedColor - The saved color setting for the token.
 * @param {boolean} isWorld - Boolean indicating whether the settings are for the world scope.
 * @returns {string} - HTML string for the table row.
 */
function createSettingsRow(key, savedType, savedColor, isWorld) {
  const isChecked = (type) => (savedType === type ? "checked" : "");
  const [tokenType, backgroundType] = key.split(".");
  const label = {
    iconClass: "",
    hoverText: game.i18n.localize(
      `${MODULE_ID}.module-settings.configuration-menu.hover.row.type.${tokenType}`
    ),
    labelText: game.i18n.localize(
      `${MODULE_ID}.module-settings.configuration-menu.row.type.${tokenType}`
    ),
  };

  switch (tokenType) {
    case "party":
      label.iconClass = "fa-solid fa-people-group";
      break;
    case "friendly":
      label.iconClass = "fa-regular fa-face-smile";
      break;
    case "neutral":
      label.iconClass = "fa-regular fa-face-meh-blank";
      break;
    case "hostile":
      label.iconClass = "fa-regular fa-face-angry";
      break;
    case "secret":
      label.iconClass = "fa-solid fa-mask";
      break;
  }

  const iconHTML = `<i class="${label.iconClass}"></i>`;
  const checkboxOptions = [
    isWorld ? "unchanged" : "default",
    "custom",
    "disposition",
    "health-percent",
  ];
  if (game.system.id === "pf2e") checkboxOptions.push("level-diff");

  const checkboxesHTML = checkboxOptions
    .map(
      (option) => `
      <td>
        <input type="checkbox" name="${option}" ${isChecked(
        option
      )} data-tooltip="Tooltip text">
      </td>`
    )
    .join("");

  return `
    <tr data-row-key="${key}">
      <td>
        <strong data-tooltip="${label.hoverText}" data-tooltip-direction="UP">
          ${backgroundType === "ring" ? iconHTML + " " + label.labelText : ""}
        </strong>
      </td>
      <td><strong>${game.i18n.localize(
        `${MODULE_ID}.module-settings.configuration-menu.row.${backgroundType}`
      )}</strong></td>
      ${checkboxesHTML}
      <td>
        <input type="color" name="color" value="${savedColor}">
        <input type="text" name="colorText" value="${savedColor}" maxlength="7" class="REDY-color-input">
      </td>
    </tr>
  `;
}

/**
 * Function to load and generate HTML for settings rows.
 * @param {boolean} isWorld - Boolean indicating whether the settings are for the world scope.
 * @returns {string} - HTML string for all settings rows.
 */
function loadSettingsRows(isWorld) {
  const scope = isWorld ? "world" : "player";
  const rowKeys = [
    "party.ring",
    "party.bg",
    "friendly.ring",
    "friendly.bg",
    "neutral.ring",
    "neutral.bg",
    "hostile.ring",
    "hostile.bg",
    "secret.ring",
    "secret.bg",
  ];

  return rowKeys
    .map((key) => {
      const savedType = game.settings.get(
        MODULE_ID,
        `auto-coloring.${key}.type.${scope}`
      );
      const savedColor = game.settings.get(
        MODULE_ID,
        `auto-coloring.${key}.custom-color.${scope}`
      );
      return createSettingsRow(key, savedType, savedColor, isWorld);
    })
    .join("");
}

/**
 * Function to display the settings menu in a dialog.
 * @param {boolean} isWorld - Boolean indicating whether the settings are for the world scope.
 */
export function displaySettingsMenu(isWorld) {
  const scope = isWorld ? "world" : "player";
  const dialogTitle = game.i18n.localize(
    `${MODULE_ID}.module-settings.configuration-menu.headers.title`
  );
  const scopeTitle = game.i18n.localize(
    `${MODULE_ID}.module-settings.configuration-menu.headers.${scope}`
  );
  const headerKeys = [
    "category",
    "ring-or-bg",
    isWorld ? "unchanged" : "default",
    "custom",
    "disposition",
    "health-percent",
  ];
  if (game.system.id === "pf2e") headerKeys.push("level-diff");
  headerKeys.push("custom-color");

  const headersHTML = headerKeys
    .map(
      (key) => `
      <th data-tooltip="${game.i18n.localize(
        `${MODULE_ID}.module-settings.configuration-menu.hover.headers.${key}`
      )}">
        ${game.i18n.localize(
          `${MODULE_ID}.module-settings.configuration-menu.headers.${key}`
        )}
      </th>`
    )
    .join("");

  new Dialog({
    title: `${dialogTitle} (${scopeTitle})`,
    content: `
      <table class="REDY-settings-table">
        <thead>
          <tr>${headersHTML}</tr>
        </thead>
        <tbody>${loadSettingsRows(isWorld)}</tbody>
      </table>
    `,
    buttons: {
      save: {
        label: game.i18n.localize("Save"),
        callback: (html) => {
          html.find("tr[data-row-key]").each(function () {
            const $row = $(this);
            const rowKey = $row.data("row-key").toLowerCase().replace(" ", ".");
            const selectedType =
              $row.find('input[type="checkbox"]:checked').attr("name") ??
              (isWorld ? "unchanged" : "default");
            const customColor = $row.find('input[name="color"]').val();

            game.settings.set(
              MODULE_ID,
              `auto-coloring.${rowKey}.type.${scope}`,
              selectedType
            );
            game.settings.set(
              MODULE_ID,
              `auto-coloring.${rowKey}.custom-color.${scope}`,
              customColor
            );
          });
          ui.notifications.info(
            game.i18n.localize(
              `${MODULE_ID}.module-settings.configuration-menu.notifications.saved`
            )
          );
          canvas.tokens.placeables.forEach(t => t?.ring?.configureVisuals())
        },
      },
      cancel: {
        label: game.i18n.localize("Cancel"),
      },
    },
    default: "save",
  }).render(true, { width: 800 });

  // Synchronize the color picker and text input
  $(document).on("input", 'input[name="color"]', function () {
    const $row = $(this).closest("tr");
    $row.find('input[name="colorText"]').val(this.value);
  });

  $(document).on("input", 'input[name="colorText"]', function () {
    const $row = $(this).closest("tr");
    let colorValue = this.value;

    // Ensure the color starts with a '#' and is a valid hex code
    if (!colorValue.startsWith("#")) colorValue = "#" + colorValue;
    if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
      $row.find('input[name="color"]').val(colorValue);
    }
  });

  // Event listener to ensure checkboxes are mutually exclusive within each row
  $(document).on("change", 'input[type="checkbox"]', function () {
    const $row = $(this).closest("tr");
    const $checkboxes = $row.find('input[type="checkbox"]');
    if (this.checked) {
      $checkboxes.not(this).prop("checked", false);
    }
  });
}
