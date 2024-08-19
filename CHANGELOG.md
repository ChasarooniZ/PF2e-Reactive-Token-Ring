## [1.5.4](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.5.3...1.5.4) - Updating Poland
-Polish translation update (@Lioheart)

## [1.5.3](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.5.2...1.5.3) - German Tweaks Latest

German translation tweaks (@Mystler)
## [1.5.2](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.4.0...1.5.2) - Let's try this one last time
- `Settings Rework`
  - `Autocolor Submenu`
    - Allows for easier configuration of settings
    - Allows for configuration on settings on a per token disposition type basis
    - `PLAYER SETTINGS`
    -  For players to access the autocolor player settings you'll need to use one of the new `REDY Macros`
    - __Overrides world settings when changed from default (`Default` and `#FFFFFE`)__
  - Import and Export Settings
    - New option in REDY settingsto import and export your settings for easy copying between worlds
- `New Autocolor Options`
    - `Custom`
      - Allows you to set the ring or background of rings of a particular disposition to a particular color (is not affected by the `color percentage` setting)
    - `Level Difference` - Pf2e exclusive
      - Compares the level to that of the average level of the party
        - (atm is statically set when the token is loaded so you may need to reload if the level of the creature or the party changes to update the color)
## 1.5.1 - Fake push cause foundry said no
## ~~[1.5.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.4.0...1.5.0) - Difficulty at a Glance~~
`Autcoloring Settings Rework`
  - Settings have been reworked for autocoloring to the following structure
    - Top level
      - `World`
      - `Player` - Overrides world settings when changed from default (`Default` and `#FFFFFE`)
    - ❗ Disposition Level
      - `Friendly`
      - `Neutral`
      - `Hostile`
      - `Party` - Pf2e exclusive
    - Ring or Background Level
      - `Ring`
      - `Background`
  - The following new settings for autocolor have been added
    - `Custom`
      - Allows you to set the ring or background of rings of a particular disposition to a particular color (is not affected by the `color percentage` setting)
    - `Level Difference` - Pf2e exclusive
      - Compares the level to that of the average level of the party
        - (atm is statically set when the token is loaded so you may need to reload if the level of the creature or the party changes to update the color)
- `Backend`
  - reworked/rewrote some code for streamlining the generation of settings and possibly improving performance
![image](https://github.com/user-attachments/assets/9ae4c0c2-15d9-4a6c-9d82-6467f90bacb8)


## [1.4.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.8...1.4.0) - Health Targets
- `Autocoloring`
  - Added options for which token rings to autocolor health for (@Mystler )
- `Bug Fixes`
  - Fixes flashing on 0 hp heals and adjustment changes (@Mystler, @shemetz for bug finding)
  - Stops errors on actorless tokens (@Mystler, @shemetz for bug finding)
## [1.3.8](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.7...1.3.8) - Autocoloring Fix
- Fixed autocoloring not syncing when a token takes damage (@Mystler)
## [1.3.7](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.6...1.3.7) - Polish Translation Update
- Updated Polish translation (@Lioheart)
## [1.3.6](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.5...1.3.6) - Hot Patch
- Fixed one of the auto color settings turning into a color drop down
## [1.3.5](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.4...1.3.5) - Options, and Languages, and Fixes Oh My
- `Token Flash`
  - Added Module settings to change color of all token flashes
  - Fixed bug where token wouldn't flash when hp was set to 0 (@Mystler)
  - Fixed edge case where multiple tokens sharing the same linked actor wouldn't flash (@Mystler)
  - Fixed bug where disposition auto coloring wasn't working in `1.3.4` (@Mystler)
- **Languages**
  - Punched up some of the the german translation (@Mystler)
  - Added the followign new machine translated languages
    - `Japanese`
    - `Korean`
    - `Chinese`
    - `Portuguese`
- **Misc Fixes**
  - Fix for manifestplus log error (@Razytos)
## [1.3.4](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.3...1.3.4) - Color Saturation
- `Auto Coloring`
  - Added option to set the saturation of the autocoloring
  - (did some behind the scenes reorganizing of the code)
## [1.3.3](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.2...1.3.3) - Updated Translation
- Updated polish translation (@Lioheart)
## [1.3.2](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.1...1.3.2) - Bug Fix
- Fixed issue where path to languages was incorrect
- made tweaks to German translation (@stwlam)
## [1.3.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.3.0...1.3.1) - Rise of the Machine Languages I
Added Machine Translations into the following languages
- French
- German
- Spanish
## [1.3.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.2.0...1.3.0) - Automatic Color Changing
Adds the following new features developed by (@Mystler)
- Token Ring & Background Coloring
  - Unchanged: Use the default color and effectively disable this setting.
  - Health-Based: Interpolate the color from red to green as health goes up.
  - Disposition: Apply a color based on the token disposition: green for friendly, yellow for neutral, red for hostile.|
![colorScalingHealth](https://github.com/user-attachments/assets/84c246cc-8097-4dee-8ac7-e303c4d01607)
## [1.2.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.6...1.2.0) - Emphasis
- Adds option to increase the duration of flash on damage/heal based on the % of damage taken or healed compared to your max health
- Changed the Color of Healing Green to pop more
- Fixed bug with flash color health bar turning black when opening and closing actor sheet (pf2e)
## [1.1.6](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.5...1.1.6) - Healing again
- Renamed module properly in the `module.json` to reflect its new name
- Fixed bug where the module wouldn't flash on healing or damage
## [1.1.5](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.4...1.1.5) - Waiting...
- Added some awaits to hopefully fix issue where some flashes cause the token border to stop rendering
## [1.1.4](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.3...1.1.4) - Only on Target
- Tokens only flash when targetted now
- Minor Code Cleanup
## [1.1.3](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.2...1.1.3) - Dragonbane
- Support for Dragonbane - Drakar och Demoner (@xdy)

## [1.1.2](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.1...1.1.2) - Level Up
- Support for Level Up (Advanced 5e) (@Lonely Paladin)

## [1.1.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.1.0...1.1.1) - Metanthropes Support
- Added support for Metanthropes (@Mjb141)

## [1.1.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.0.2...1.1.0) - Systems Galore
- Adding Support for a lot of other systems
  - Thanks to [@shemetz](https://github.com/shemetz/tokenmagic-automatic-wounds/blob/master/scripts/system-compatibility.js) for the reference code <3
- Support for the following systems was added
  - Alien RPG
  - Cyberpunk RED
  - Dungeon World
  - Pathfinder 1
  - HeXXen 1733 Official
  - Old-School Essentials
  - Powered by the Apocalypse
  - Savage Worlds Adventure Edition
  - Warhammer Fantasy Roleplay 4th Edition
## [1.0.2](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.0.1...1.0.2) - Bug Fix 2
- Fixed bug causing all non pf2e systems to not work (based on a flipped check)
## [1.0.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/1.0.0...1.0.1) - Bug Fix
- Fix bug where it wasn't detecting damage
## [1.0.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/0.2.1...1.0.0) - ~~PF2e~~ -> Reactive Token Rings
- Added support for other systems
## [0.2.1](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/0.2.1...1.0.0) - Polish Support
- Added Polish Support thanks to (@Lioheart)
- Started tracking contributors (trying to do that from now on)
## [0.2.0](https://github.com/ChasarooniZ/PF2e-Reactive-Token-Ring/compare/0.1.0...0.2.0) - Oops all Features
- Added a lot of features
- **Conditions**
  - Flashes Pink on applying Positive Conditions
  - Flashes Orange on applying Negative Conditions
- **Settings**
  - Option to set target color to player color
  - Option to only show target flashing to the player targetting
  - Option to set Duration
  - Option to have duration of damage/heal scale on % damage dealt
- **Changes**
  - Changed default color on target to blue (it just seems to fit better?)
## 0.1.0
- Initial Test Release
- Adds following features
  - Flashes red on damage taken
  - Flashes green on heal
  - Flashes white when targetted
