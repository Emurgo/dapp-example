import React from "react";
import ApiCard from "./apiCard";

const ListNFTsCard = ({ api, onRawResponse, onResponse, onWaiting }) => {
  const listNFTsClick = () => {
    onWaiting(true);
    api?.experimental.listNFTs()
      .then((response) => {
        onWaiting(false);
        onRawResponse('');
        onResponse(response);
      })
      .catch((e) => {
        onWaiting(false);
        onRawResponse('');
        onResponse(e);
        console.log(e);
      });
  };

  const apiProps = {
    apiName: "listNFTs",
    clickFunction: listNFTsClick
  }

  return (
    <ApiCard {...apiProps} />
  );
};

export default ListNFTsCard;