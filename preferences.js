const electron = require('electron');
const app = electron.app;
const path = require('path');
const os = require('os');
const ElectronPreferences = require('electron-preferences');

const chartOptions =  [
                        { 'label': 'Pie', 'value': 'pie' },
                        { 'label': 'Doughnut', 'value': 'doughnut' },
                        { 'label': 'Bar', 'value': 'bar' }
                      ];

const preferences = new ElectronPreferences({
  'dataStore': path.resolve(__dirname, 'preferences.json'),
  'defaults': {
    'general': {
      'show_timer': true
    },
    'charts': {
      'chart_refresh': false,
      'chart_colors': false,
      'chart_type_one': 'pie',
      'chart_type_two': 'doughnut'
    },
    'styles': {
      'theme': 'dark',
      'styles_useCustom': false
    },
    'markdown': {
      'auto_format_links': true,
      'show_gutter': false
    },
    'preview': {
      'show': true
    },
    'drawer': {
      'show': true
    }
  },
  'onLoad': (data) => {
    // console.log('data', data);
    return data;
  },
  'afterLoad': ({ preferences }) => {
    // console.log('afterLoad', preferences);
  },
  'webPreferences': {
    'devTools': true
  },
  'sections': [
    {
      'id': 'general',
      'label': 'General',
      'icon': 'settings-gear-63',
      'form': {
        'groups': [
          {
            'label': 'General',
            'fields': [
              {
                'label': 'Timer',
                'key': 'show_timer',
                'type': 'radio',
                'options': [
                  { 'label': 'Yes', 'value': true },
                  { 'label': 'No', 'value': false }
                ],
                'help': 'When enabled, a current session time is displayed'
              }
            ]
          }
        ]
      }
    },
    {
      'id': 'charts',
      'label': 'Charts',
      'icon': 'grid-45',
      'form': {
        'groups': [
          {
            'label': 'Charts',
            'fields': [
              {
                'label': 'Chart Refresh',
                'key': 'chart_refresh',
                'type': 'radio',
                'options': [
                  { 'label': 'Yes', 'value': true },
                  { 'label': 'No', 'value': false }
                ],
                'help': 'Should charts refresh on every entry update?'
              },
              {
                'label': 'Random Chart Colors',
                'key': 'chart_colors',
                'type': 'radio',
                'options': [
                  { 'label': 'Yes', 'value': true },
                  { 'label': 'No', 'value': false }
                ],
                'help': 'When enabled, chart colors will be randomly generated each interval.'
              },
              {
                'label': 'Animation Duration',
                'key': 'chart_animationLength',
                'type': 'slider',
                'min': 0,
                'max': 1500,
                'help': 'Chart animation duration in milliseconds (0 for no animation)'
              },
              {
                'label': 'Chart One Type',
                'key': 'chart_type_one',
                'type': 'dropdown',
                'options': chartOptions,
                'help': 'Chart one display type'
              },
              {
                'label': 'Chart Two Type',
                'key': 'chart_type_two',
                'type': 'dropdown',
                'options': chartOptions,
                'help': 'Chart two display type'
              }
            ]
          }
        ]
      }
    },
    {
      'id': 'styles',
      'label': 'Styles',
      'icon': 'pencil',
      'form': {
        'groups': [
          {
            'label': 'Style Editior',
            'fields': [
              {
                'label': 'Theme',
                'key': 'theme',
                'type': 'dropdown',
                'options': [
                  { 'label': 'Dark', 'value': 'dark' },
                  { 'label': 'Light', 'value': 'light' },
                  { 'label': 'Custom', 'value': 'custom' },
                  { 'label': 'Blackout', 'value': 'blackout' },
                  { 'label': 'Dracula', 'value': 'dracula' },
                  { 'label': 'Midnight', 'value': 'midnight' },
                  { 'label': 'Monokai', 'value': 'monokai' },
                  { 'label': 'Old Glory', 'value': 'oldglory' }
                ],
                'help': 'Default theme'
              },
              {
                'heading': 'Custom Styles',
                'content': '<p>Use the theme "Custom" to enable custom styles below</p>',
                'type': 'message',
              },
              {
                'label': 'Background Color',
                'key': 'styles_color_background',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              },
              {
                'label': 'Font Color',
                'key': 'styles_color_font',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              },
              {
                'label': 'Table Head Background Color',
                'key': 'styles_color_thBackground',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              },
              {
                'label': 'Table Body Background Color',
                'key': 'styles_color_tbBackground',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              },
              {
                'label': 'Table Head Font Color',
                'key': 'styles_color_thFont',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              },
              {
                'label': 'Table Body Font Color',
                'key': 'styles_color_tbFont',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              },
              {
                'label': 'Button Background Color',
                'key': 'styles_color_buttonBackground',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              },
              {
                'label': 'Button Font Color',
                'key': 'styles_color_buttonFont',
                'type': 'color',
                'format': 'hex',
                'help': 'Custom style'
              }
            ]
          }
        ]
      }
    }
  ]
});

module.exports = preferences;
