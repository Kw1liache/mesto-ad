const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUserId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const cardTitle = cardElement.querySelector(".card__title");

  // Заполняем данные карточки
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  
  // Отображаем количество лайков
  if (likeCountElement) {
    likeCountElement.textContent = data.likes ? data.likes.length : 0;
  }
  
  // Проверяем, лайкнул ли текущий пользователь карточку
  const isLikedByCurrentUser = data.likes && data.likes.some(like => like._id === currentUserId);
  if (isLikedByCurrentUser && likeButton) {
    likeButton.classList.add("card__like-button_is-active");
  }
  
  // Показываем иконку удаления только для своих карточек
  if (data.owner && data.owner._id !== currentUserId && deleteButton) {
    deleteButton.remove();
  }

  // Удаляем кнопку info (она не нужна по ТЗ)
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  if (infoButton) {
    infoButton.remove();
  }

  // Добавляем обработчики событий
  if (onLikeIcon && likeButton) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton));
  }

  if (onDeleteCard && deleteButton) {
    deleteButton.addEventListener("click", (evt) => {
      evt.stopPropagation();
      onDeleteCard();
    });
  }

  if (onPreviewPicture && cardImage) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};
