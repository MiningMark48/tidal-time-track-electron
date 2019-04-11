module.exports.changeCSS = function(theme) {
  let cssFile = 'dark.css';
  let cssLinkIndex = 3;

  if (theme) cssFile = theme + '.css';

  let oldLink = document.getElementsByTagName("link").item(cssLinkIndex);

  if (oldLink.getAttribute('href') === ("css/" + cssFile)) return;

  let newLink = document.createElement("link");
  newLink.setAttribute("rel", "stylesheet");
  newLink.setAttribute("type", "text/css");
  newLink.setAttribute("href", "css/" + cssFile);

  document.getElementsByTagName("head").item(0).replaceChild(newLink, oldLink);
}

module.exports.setCustomStyle = function(type, element, style, reset) {
  let s = (reset ? style : "");
  switch (type) {
    default:
      console.log("Unknown type.")
      break;
    case 'bg':
      element.style.backgroundColor = s;
      break;
    case 'fc':
      element.style.color = s;
      break;
  }
}
