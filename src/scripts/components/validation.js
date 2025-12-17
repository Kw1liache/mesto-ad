function showInputError(formElement, inputElement, errorMessage, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
  inputElement.classList.add(settings.inputErrorClass);
}

function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
  inputElement.classList.remove(settings.inputErrorClass);
}

function checkInputValidity(formElement, inputElement, settings) {
  const value = inputElement.value.trim();
  
  if (!value) {
    showInputError(
      formElement,
      inputElement,
      "Поле обязательно для заполнения",
      settings
    );
    return false;
  }

  if (inputElement.classList.contains("popup__input_type_name")) {
    if (value.length < 2 || value.length > 40) {
      showInputError(
        formElement,
        inputElement,
        "Длина должна быть от 2 до 40 символов",
        settings
      );
      return false;
    }
    
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!nameRegex.test(value)) {
      const customMessage = inputElement.dataset.errorMessage ||
        "Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы";
      showInputError(formElement, inputElement, customMessage, settings);
      return false;
    }
  }

  if (inputElement.classList.contains("popup__input_type_description")) {
    if (value.length < 2 || value.length > 200) {
      showInputError(
        formElement,
        inputElement,
        "Длина должна быть от 2 до 200 символов",
        settings
      );
      return false;
    }
  }

  if (inputElement.classList.contains("popup__input_type_card-name")) {
    if (value.length < 2 || value.length > 30) {
      showInputError(
        formElement,
        inputElement,
        "Длина должна быть от 2 до 30 символов",
        settings
      );
      return false;
    }
    
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!nameRegex.test(value)) {
      const customMessage = inputElement.dataset.errorMessage ||
        "Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы";
      showInputError(formElement, inputElement, customMessage, settings);
      return false;
    }
  }

  if (inputElement.classList.contains("popup__input_type_url") ||
      inputElement.classList.contains("popup__input_type_avatar")) {
    try {
      new URL(value);
    } catch (error) {
      showInputError(
        formElement,
        inputElement,
        "Введите корректную ссылку",
        settings
      );
      return false;
    }
  }

  hideInputError(formElement, inputElement, settings);
  return true;
}

function hasInvalidInput(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);
  const results = Array.from(inputElements).map((input) => 
    checkInputValidity(formElement, input, settings)
  );
  return results.some((isValid) => !isValid);
}

function disableSubmitButton(formElement, settings) {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add(settings.inactiveButtonClass);
  }
}

function enableSubmitButton(formElement, settings) {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.classList.remove(settings.inactiveButtonClass);
  }
}

function toggleButtonState(formElement, settings) {
  if (hasInvalidInput(formElement, settings)) {
    disableSubmitButton(formElement, settings);
  } else {
    enableSubmitButton(formElement, settings);
  }
}

function setEventListeners(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);

  inputElements.forEach((input) => {
    input.addEventListener("input", () => {
      checkInputValidity(formElement, input, settings);
      toggleButtonState(formElement, settings);
    });
    
    input.addEventListener("blur", () => {
      checkInputValidity(formElement, input, settings);
      toggleButtonState(formElement, settings);
    });
  });
}

function clearValidation(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);
  inputElements.forEach((input) => {
    hideInputError(formElement, input, settings);
  });
  disableSubmitButton(formElement, settings);
}

function enableValidation(settings) {
  const formElements = document.querySelectorAll(settings.formSelector);
  formElements.forEach((formElement) => {
    setEventListeners(formElement, settings);
    toggleButtonState(formElement, settings);
  });
}

export { enableValidation, clearValidation };
