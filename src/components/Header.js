import React, {useContext, useState} from 'react'
import {Button, Container, Label} from "semantic-ui-react";
import {BN, units} from "@zilliqa-js/zilliqa";
import {AppContext} from "../context/UserContext";

export default function Header() {

  const ctx = useContext(AppContext);
  const [authenticated, setAuthenticated] = ctx.auth;
  const [balance, setBalance] = ctx.balance;
  const [currentAddress, setCurrentAddress] = ctx.address;

  const [loading, setLoading] = useState(false);

  const authenticateZilPay = async () => {
    if (typeof window.zilPay !== 'undefined') {
      try {
        setLoading(true);
        console.log("Authenticating")
        const isConnect = await window.zilPay.wallet.connect();
        if (isConnect) {
          const zilliqa = window.zilPay;
          const address = zilliqa.wallet.defaultAccount;
          setCurrentAddress(address);
          const balanceState = await zilliqa.blockchain.getBalance(address.bech32);
          const balance = balanceState.result.balance;

          setBalance(units.fromQa(new BN(balance), units.Units.Zil))
          setAuthenticated(true);
          setLoading(false);
        } else {
          throw new Error('user rejected');
        }
      } catch (error) {
        setLoading(false);
        setAuthenticated(false)
      }
    } else {
      alert('ZilPay is not installed');
    }
  }

  return (
      <Container style={headerStyles}>
        <Container style={{
          textAlign: 'right',
          width: '100%'
        }}>
          {
            authenticated ?
                <Label size='large' style={{
                  margin: 20
                }} color={authenticated ? 'green' : 'red'} >
                  {authenticated ? 'Connected' : 'Not Connected'}
                  {authenticated ? <Label.Detail>{`${balance}  ZIL`}</Label.Detail> : null}
                </Label> :
                <Button style={{
                  margin: 10,
                  top: '50%'
                }} loading={loading} content=' Connect ZilPay' icon='lock' labelPosition='left'  size='big' onClick={authenticateZilPay}/>
          }
        </Container>

      </Container>
  )
}

const headerStyles = {
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
  height: '5em',
  width: '100%',
  position: 'relative'
}
