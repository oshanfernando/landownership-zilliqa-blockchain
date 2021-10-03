import React, { createContext, useState } from 'react';

export const AppContext = createContext({});

const { Provider } = AppContext;

export const AppProvider = (props) => {

  const [authenticated, setAuthenticated] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [balance, setBalance] = useState(0);

  return(

      <Provider value={{
        auth : [authenticated, setAuthenticated],
        address: [currentAddress, setCurrentAddress],
        balance: [balance, setBalance]
      }}>

        {props.children}

      </Provider>

  );

}
