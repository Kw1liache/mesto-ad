import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  changeLikeCardStatus,
  deleteCardApi
} from "./components/api.js";

// Элементы DOM
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

// Статистика
const logoButton = document.querySelector(".header__logo");
const statsModalWindow = document.querySelector(".popup_type_info");
const statsTitle = statsModalWindow.querySelector(".popup__title");
const statsInfoList = statsModalWindow.querySelector(".popup__info");
const statsPopularTitle = statsModalWindow.querySelector(".popup__text");
const statsPopularList = statsModalWindow.querySelector(".popup__list");

const definitionTemplate = document.getElementById("popup-info-definition-template");
const userPreviewTemplate = document.getElementById("popup-info-user-preview-template");

// Переменные состояния
let currentUserId = null;
let cardToDelete = null;

// Функции обработчики
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeClick = (cardId, likeButton, cardElement) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      const likeCountElement = cardElement.querySelector(".card__like-count");
      if (likeCountElement) {
        likeCountElement.textContent = updatedCard.likes.length;
      }
    })
    .catch((err) => {
      console.error("Ошибка при изменении лайка:", err);
    });
};

const handleDeleteCardClick = (cardId, cardElement) => {
  cardToDelete = { id: cardId, element: cardElement };
  openModalWindow(removeCardModalWindow);
};

const handleDeleteCardConfirm = (evt) => {
  evt.preventDefault();
  
  if (!cardToDelete) return;
  
  const submitButton = evt.target.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  
  submitButton.textContent = "Удаление...";
  submitButton.disabled = true;
  
  deleteCardApi(cardToDelete.id)
    .then(() => {
      cardToDelete.element.remove();
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
    })
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении профиля:", err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;
  
  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара:", err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  
  submitButton.textContent = "Создание...";
  submitButton.disabled = true;
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (likeButton) => handleLikeClick(cardData._id, likeButton, cardElement),
          onDeleteCard: currentUserId === cardData.owner._id ? 
            () => handleDeleteCardClick(cardData._id, cardElement) : null
        },
        currentUserId
      );
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.error("Ошибка при создании карточки:", err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleOpenStats = () => {
  Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
      // Статистика пользователей
      const users = new Set();
      let totalLikes = 0;
      const userLikes = {};
      
      cards.forEach(card => {
        // Собираем уникальных пользователей
        users.add(card.owner._id);
        card.likes.forEach(like => users.add(like._id));
        
        // Считаем общее количество лайков
        totalLikes += card.likes.length;
        
        // Считаем лайки по пользователям
        card.likes.forEach(like => {
          if (!userLikes[like._id]) {
            userLikes[like._id] = {
              count: 0,
              name: like.name
            };
          }
          userLikes[like._id].count++;
        });
      });
      
      let maxLikes = 0;
      let champion = "Нет данных";
      
      Object.values(userLikes).forEach(user => {
        if (user.count > maxLikes) {
          maxLikes = user.count;
          champion = user.name || "Аноним";
        }
      });
      
      // Топ-3 популярные карточки
      const popularCards = cards
        .map(card => ({
          name: card.name,
          likes: card.likes.length
        }))
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);
      
      // Заполняем статистику
      statsTitle.textContent = "Статистика карточек";
      
      // Очищаем предыдущие данные
      statsInfoList.textContent = "";
      statsPopularList.textContent = "";
      
      // Добавляем статистику
      const stats = [
        { term: "Всего пользователей", description: users.size },
        { term: "Всего лайков", description: totalLikes },
        { term: "Максимально лайков от одного", description: maxLikes },
        { term: "Чемпион лайков", description: champion }
      ];
      
      stats.forEach(stat => {
        const definitionElement = definitionTemplate.content.cloneNode(true);
        definitionElement.querySelector(".popup__info-term").textContent = stat.term;
        definitionElement.querySelector(".popup__info-description").textContent = stat.description;
        statsInfoList.appendChild(definitionElement);
      });
      
      // Добавляем популярные карточки
      statsPopularTitle.textContent = "Популярные карточки:";
      popularCards.forEach(card => {
        const userElement = userPreviewTemplate.content.cloneNode(true);
        userElement.querySelector(".popup__list-item").textContent = card.name;
        statsPopularList.appendChild(userElement);
      });
      
      openModalWindow(statsModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при загрузке статистики:", err);
    });
};

// Обработчики событий
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleDeleteCardConfirm);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings, false);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings);
});

logoButton.addEventListener("click", handleOpenStats);

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    // Сохраняем ID текущего пользователя
    currentUserId = userData._id;
    
    // Отображаем данные пользователя
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    placesWrap.textContent = "";;
    
    cards.forEach((cardData) => {
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (likeButton) => handleLikeClick(cardData._id, likeButton, cardElement),
          onDeleteCard: currentUserId === cardData.owner._id ? 
            () => handleDeleteCardClick(cardData._id, cardElement) : null
        },
        currentUserId
      );
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => {
    console.error("Ошибка при загрузке данных:", err);
  });
