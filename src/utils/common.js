export const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const findObjectByID = (Obj, id) =>
  Obj.find((ele) => ele?.user_id === id);
