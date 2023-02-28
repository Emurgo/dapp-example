import React from "react";
import ApiCard from "./apiCard";

const AuthCard = ({ api, onRawResponse, onResponse, onWaiting }) => {

  const isAuthorizedClick = async () => {
    onWaiting(true);
    if (api.experimental && api.experimental.auth) {
      try {
        const authObject = await api.experimental.auth();
        onWaiting(false);
        onRawResponse('');
        onResponse(authObject);
      } catch (error) {
        onWaiting(false);
        onRawResponse('');
        onResponse(error);
        console.error(error);
      }
    } else {
      onWaiting(false);
      onRawResponse('');
      onResponse("experimental object or auth object is not found", false);
    }
  }

  const apiProps = {
    apiName: "auth",
    clickFunction: isAuthorizedClick
  }

  return (
    <ApiCard {...apiProps} />
  );
}

export default AuthCard;