document.addEventListener('keyup', (event) => {
    const keyName = event.key;
  
    // validate input fields
    let isNewUser = !document.getElementById('newUser').classList.contains('isHidden');
    if (isNewUser) {
  
      let fullName = document.getElementById('fullNameInput').value;
      let extension = document.getElementById('extensionInput').value;
  
      let fullNameMinSizeTip = document.getElementById('fullNameMinSizeTip');
      let extensionNumbersOnlyTip = document.getElementById('extensionNumbersOnlyTip');
      
      let canCreate = true;
      if(fullName.length >= 3 && fullName.length <= 30) {
        fullNameMinSizeTip.classList.add('isGreen');
        fullNameMinSizeTip.classList.remove('isRed');
      } else {
        canCreate = false;
        fullNameMinSizeTip.classList.remove('isGreen');
        fullNameMinSizeTip.classList.add('isRed');
      }
  
      // regex to make sure the extension only contains numbers
      if (/^\d+$/.test(extension)) {
        extensionNumbersOnlyTip.classList.add('isGreen');
        extensionNumbersOnlyTip.classList.remove('isRed');
      } else {
        canCreate = false;
        extensionNumbersOnlyTip.classList.remove('isGreen');
        extensionNumbersOnlyTip.classList.add('isRed');
      }
  
      if (canCreate) {
        enableCreateUserButton();
      } else {
        disableCreateUserButton();
      }
    }
  
    if (keyName === 'Control') {
      // do not alert when only Control key is pressed.
      return;
    }
  
    if (event.ctrlKey) {
      // Even though event.key is not 'Control' (e.g., 'a' is pressed),
      // event.ctrlKey may be true if Ctrl key is pressed at the same time.
      //alert(`Combination of ctrlKey + ${keyName}`);
    } else {
      //alert(`Key pressed ${keyName}`);
    }
  }, false);

  
function disableCreateUserButton() {
    let createUserButton = document.getElementById('create-user-btn');
    createUserButton.classList.add('disabled');
    createUserButton.classList.add('btn-secondary');
    createUserButton.classList.remove('btn-primary');
  }
  
  function enableCreateUserButton() {
    let createUserButton = document.getElementById('create-user-btn');
    createUserButton.classList.remove('disabled');
    createUserButton.classList.remove('btn-secondary');
    createUserButton.classList.add('btn-primary');
  }