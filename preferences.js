const electron = require('electron');
const app = electron.app;
const path = require('path');
const os = require('os');
const ElectronPreferences = require('electron-preferences');

const preferences = new ElectronPreferences({
  'dataStore': path.resolve(__dirname, 'preferences.json'),
  'defaults': {
    'general': {
      'show_timer': true
    },
    'charts': {
      'chart_refresh': false,
      'chart_type_pie': 'pie'
    },
    'styles': {
      'theme': 'dark'
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
    console.log('afterLoad', preferences);
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
                'label': 'Animation Duration',
                'key': 'chart_animationLength',
                'type': 'slider',
                'min': 0,
                'max': 1500,
                'help': 'Chart animation duration in milliseconds (0 for no animation)'
              },
              {
                'label': 'Pie Chart Type',
                'key': 'chart_type_pie',
                'type': 'radio',
                'options': [
                  { 'label': 'Full', 'value': 'pie' },
                  { 'label': 'Hollow', 'value': 'doughnut' }
                ],
                'help': 'Pie chart display type'
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
                  { 'label': 'Light', 'value': 'light' }
                ],
                'help': 'Default theme'
              },
              {
                'heading': 'Coming Soon',
                'content': '<p>Custom CSS Coming Soon</p>',
                'type': 'message',
              }
            ]
          }
        ]
      }
    }
  ]
});

module.exports = preferences;