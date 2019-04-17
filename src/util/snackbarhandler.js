module.exports.show = function(message, time) {
  let element = document.querySelector('#snackbar');
  element.textContent = message;
  element.className = "show";
  setTimeout(function() {
    element.className = element.className.replace("show", "");
    element.textContent = "";
  }, time * 1000);
}
