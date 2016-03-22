// The Create button was selected
function createClicked() {
    beginCreate(); //send a callback
}

// The Update button was selected
function updateClicked() {
    showCoordinates(false);
    // enable update
}

function handleDone() {
  console.log('Done!');
}

function showButton(id) {
   var e = document.getElementById(id);
   e.style.display = 'block';
}

function hideButton(id) {
    var e = document.getElementById(id);
    e.style.display = 'none';
}

window.onload=hideButton('updateButton');

