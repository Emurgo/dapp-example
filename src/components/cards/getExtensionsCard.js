import React from 'react'
import ApiCard from './apiCard'

const GetExtensionsCard = ({api, onRawResponse, onResponse, onWaiting}) => {
    const getExtensionsClick = () => {
        onWaiting(true)
        Promise.resolve(api?.getExtensions())
          .then((response) => {
            onWaiting(false)
            onRawResponse('')
            onResponse(response)
          })
          .catch((e) => {
            onWaiting(false)
            onRawResponse('')
            onResponse(e)
            console.log(e)
          })
      }
    
      const apiProps = {
        apiName: 'getExtensions',
        clickFunction: getExtensionsClick,
      }
    
      return <ApiCard {...apiProps} />
}

export default GetExtensionsCard