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

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  
  if (likeCountElement) {
    likeCountElement.textContent = data.likes ? data.likes.length : 0;
  }
  
  const isLikedByCurrentUser = data.likes && data.likes.some(like => like._id === currentUserId);
  if (isLikedByCurrentUser && likeButton) {
    likeButton.classList.add("card__like-button_is-active");
  }
  
  if (data.owner && data.owner._id !== currentUserId && deleteButton) {
    deleteButton.remove();
  }

  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  if (infoButton) {
    infoButton.remove();
  }

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
