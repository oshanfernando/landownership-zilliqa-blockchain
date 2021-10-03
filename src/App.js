import React, {useContext} from "react";
import {AppContext} from "./context/UserContext";
import {Container} from "semantic-ui-react";
import Header from "./components/Header";
import Property from "./components/Property";
import Error from "./components/Error";

function App() {
  const ctx = useContext(AppContext);
  const [authenticated, setAuthenticated] = ctx.auth;

  return (
      <div>
        <Header/>
        <Container>
          {
            authenticated ? <Property/>
                : <Error/>
          }
        </Container>

      </div>
  );
}

export default App;
