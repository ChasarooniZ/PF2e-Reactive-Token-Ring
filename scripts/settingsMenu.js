import { COLORS, MODULE_ID } from "./misc.js";

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
    "random",
  ];
  if (game.system.id === "pf2e") checkboxOptions.push("level-diff");

  const resetButton = !isWorld
    ? `
    <button class="REDY-reset-color" data-tooltip="${game.i18n.localize(
      `${MODULE_ID}.module-settings.configuration-menu.hover.row.reset-color`
    )}">
      <i class="fas fa-undo"></i>
    </button>
  `
    : "";

  const checkboxesHTML = checkboxOptions
    .map(
      (option) => `
      <td>
        <input type="checkbox" name="${option}" ${isChecked(
        option
      )} data-tooltip="${game.i18n.localize(
        `${MODULE_ID}.module-settings.configuration-menu.hover.row.${backgroundType}.${option}`
      )}${
        checkboxHasHoverImage(option)
          ? `<img src='https://raw.githubusercontent.com/ChasarooniZ/PF2e-Reactive-Token-Ring/main/imgs/${option}-${backgroundType}.webp'>`
          : ""
      }">
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
      <td><i class="${
        backgroundType === "ring" ? "fa-regular" : "fa-duotone"
      } fa-circle"></i> <strong>${game.i18n.localize(
    `${MODULE_ID}.module-settings.configuration-menu.row.${backgroundType}`
  )}</strong></td>
      ${checkboxesHTML}
      <td class="custom-color">
        <input type="color" name="color" value="${savedColor}">
        <input type="text" name="colorText" value="${savedColor}" maxlength="7" class="REDY-color-input">
        ${resetButton}
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
  if (!game.user.isGM && isWorld) {
    ui.notifications.error("Only accessible as a GM");
    return false;
  }
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
    "random",
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

  foundry.applications.api.DialogV2.wait({
    window: {
      title: `${dialogTitle} (${scopeTitle})`,
      controls: [
        {
          action: "kofi",
          label: "Support Dev",
          icon: "fa-solid fa-mug-hot fa-beat-fade",
          onClick: () => window.open("https://ko-fi.com/chasarooni", _blank),
        },
      ],
      icon: "fas fa-atom",
    },
    content: `
      <table class="REDY-settings-table">
        <thead>
          <tr>${headersHTML}</tr>
        </thead>
        <tbody>${loadSettingsRows(isWorld)}</tbody>
      </table>
    `,
    buttons: [
      {
        action: "save",
        label: game.i18n.localize("Save"),
        default: true,
        callback: (event, button, dialog) => {
          const html = dialog.element ? dialog.element : dialog;
          $(html)
            .find("tr[data-row-key]")
            .each(function () {
              const $row = $(this);
              const rowKey = $row
                .data("row-key")
                .toLowerCase()
                .replace(" ", ".");
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
          canvas.tokens.placeables.forEach((tok) =>
            tok.ring?.configureVisuals()
          );
        },
      },
      {
        cancel: "cancel",
        label: game.i18n.localize("Cancel"),
      },
    ],
    render: (_event, app) => {
      const html = app.element ? app.element : app;
      // Synchronize the color picker and text input
      $(html).on("input", 'input[name="color"]', function () {
        const $row = $(this).closest("tr");
        $row.find('input[name="colorText"]').val(this.value);
      });

      $(html).on("input", 'input[name="colorText"]', function () {
        const $row = $(this).closest("tr");
        let colorValue = this.value;

        // Ensure the color starts with a '#' and is a valid hex code
        if (!colorValue.startsWith("#")) colorValue = "#" + colorValue;
        if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
          $row.find('input[name="color"]').val(colorValue);
        }
      });

      // Event listener to ensure checkboxes are mutually exclusive within each row
      $(html).on("change", 'input[type="checkbox"]', function () {
        const $row = $(this).closest("tr");
        const $checkboxes = $row.find('input[type="checkbox"]');
        if (this.checked) {
          $checkboxes.not(this).prop("checked", false);
        }
      });

      $(html).on("click", ".REDY-reset-color", function () {
        const $row = $(this).closest("tr");
        const defaultColor = COLORS.PLAYER_DEFAULT;
        $row.find('input[name="color"]').val(defaultColor);
        $row.find('input[name="colorText"]').val(defaultColor);
      });
    },
    position: {
      width: 900,
    },
  });
}

function checkboxHasHoverImage(category) {
  return ["disposition", "health-percent", "level-diff"].includes(category);
}
