import React from 'react'

// Shared chrome for each chain's access button: dark background + centered grid.
const AccessButtonShell = ({children, innerClassName = 'grid justify-items-center py-3'}) => (
  <div className="mx-auto bg-gray-900">
    <div className={innerClassName}>{children}</div>
  </div>
)

export default AccessButtonShell
