function showInputError(formElement, inputElement, errorMessage, settings) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  
  if (errorElement) {
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
  }
}

function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  
  if (errorElement) {
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.textContent = '';
    errorElement.classList.remove(settings.errorClass);
  }
}

function checkInputValidity(formElement, inputElement, settings) {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, settings);
  } else {
    let errorMessage;
    
    if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage) {
      errorMessage = inputElement.dataset.errorMessage;
    } else if (inputElement.validity.valueMissing) {
      errorMessage = 'Это поле обязательно для заполнения';
    } else if (inputElement.validity.tooShort) {
      errorMessage = `Минимальная длина: ${inputElement.minLength} символов`;
    } else if (inputElement.validity.tooLong) {
      errorMessage = `Максимальная длина: ${inputElement.maxLength} символов`;
    } else if (inputElement.validity.typeMismatch && inputElement.type === 'url') {
      errorMessage = 'Введите корректный URL адрес';
    } else {
      errorMessage = inputElement.validationMessage;
    }
    
    showInputError(formElement, inputElement, errorMessage, settings);
  }
}

function hasInvalidInput(inputList) {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  });
}

function disableSubmitButton(buttonElement, settings) {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
}

function enableSubmitButton(buttonElement, settings) {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
}

function toggleButtonState(inputList, buttonElement, settings) {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
}

function setEventListeners(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const submitButtonElement = formElement.querySelector(settings.submitButtonSelector);
  
  toggleButtonState(inputList, submitButtonElement, settings);
  
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, submitButtonElement, settings);
    });
  });
}

function clearValidation(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const submitButtonElement = formElement.querySelector(settings.submitButtonSelector);
  
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });
  
  disableSubmitButton(submitButtonElement, settings);
}

function enableValidation(settings) {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  
  formList.forEach((formElement) => {
    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });
    
    setEventListeners(formElement, settings);
  });
}

export { enableValidation, clearValidation };
