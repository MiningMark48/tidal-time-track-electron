![Tidal Time Tracker](TTT_banner.png)

Tidal Time Tracker, TTT, is a program built on [Electron](https://electronjs.org/) that is used for monitoring time spent on applications on your system.

Although the program is available for download, use of the program currently requires an account. Accounts are **private** for the duration of the beta testing and are made upon acceptance into the beta testing program.

If you would like to beta test the program, submit an application [here](https://forms.gle/DsUkRg5qnEFXaLcr6).

![TTT Screenshot](https://i.imgur.com/xS9Xtep.png)

# Application Usage and Features
## Entry Listing
Each entry, or application, is listed cleanly in a table showing the application name, process name, and time spent on that application. Entries are able to be sorted by clicking on the table headings.

![Entry Listing](https://i.imgur.com/Dq1zAng.png)

## Controls

![Controls](https://i.imgur.com/BZrG1Vt.png)

### Timer
A timer is displayed that shows the current session time.

### Pause Button
Pauses current session, preventing additional entries being added and current entries scaling up on time.

### Refresh Charts Button
Manually refreshes the charts that are displayed below.

### Delete All Entries Button
Will delete all current entries displayed in the table.

### Statistics
Will display a statistics window showing more information on application usage.

![Statistics](https://i.imgur.com/FdSFeA8.png)

## Charts

![Charts](https://i.imgur.com/MwaFwzt.png)

Charts show application time per entry. Hovering over the chart will show additional information.

Each can be configured in the preferences. Available charts include pie, donut, bar, and line.

## Preferences
Preferences can be displayed under `File > Preferences` or by pressing `Ctrl+Shift+P` (`Cmd+Shift+P`).

### General
![Prefs-General](https://i.imgur.com/YWLmkDg.png)
#### Timer
By setting to yes, a current session timer will be displayed.
#### Minimize to Tray
By setting to yes, when the application is minimized, it will be hidden to the system tray.
#### Auto Update
By setting to yes, when the application detects an update is available, it will download and install it automatically on exit. When set to no, it will ask if you want to download and install it first.

### Charts
![Prefs-Charts](https://i.imgur.com/MSenKR8.png)
#### Chart Refresh
By setting to yes, charts will update automatically.
#### Random Chart Colors
By setting to yes, charts will randomly generate colors when refreshed.
#### Animation Duration
How long the animation for a chart refresh will last. By setting to 0, animation is disabled.
#### Chart Type
Select from each dropdown what the chart should be.

Available charts include pie, donut, bar, and line.

### Styles
![Prefs-Styles](https://i.imgur.com/ZtNRKel.png)
#### Theme
This dropdown will control the overall theme for the application.

By setting the theme to "Custom", the custom styles will be used.
#### Custom Styles
Click the buttons to open a color picker to control the application themes.

## Menu Bar

### File
#### Save Data
Will manually save the current entry data to file.
#### Import Data
Allows you to import previously exported data (.JSON) into the program.
#### Export Data As
Allows you to export entry data as plain text, JSON, CSV, or XLS to be saved and used later or shared.
#### Import Theme
Allows you to import a previously exported custom theme.
#### Export Theme
Allows you to export a custom theme to use later or share with other users.
#### Preferences
Opens the preferences window.
#### Close
Will close the program.

### Help
#### About
About will show information about the program, such as the current version of Electron.

# Issues or Suggestions
Please report and issues or suggestions to the [issue tracker](https://github.com/MiningMark48/tidal-time-track-electron/issues).

# Additional Information
Tidal Time Tracker is built on a version of Google Chrome using a library known as [Electron](https://electronjs.org/).

Application data is saved under `AppData > Roaming (%AppData%) > tidal-time-track` on Windows. This directory contains the application logs.

**All data** is stored client side only. Accounts are only used for restricting users during the beta testing phase.
