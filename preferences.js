const electron = require('electron');
const app = electron.app;
const path = require('path');
const os = require('os');
const ElectronPreferences = require('electron-preferences');

const preferences = new ElectronPreferences({
  'dataStore': path.resolve(__dirname, 'preferences.json'),
  'defaults': {
    'charts': {
      'chart_refresh': false
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