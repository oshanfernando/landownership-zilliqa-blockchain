import React from 'react'
import {Container, Header} from "semantic-ui-react";

export default function Error () {
  return (
      <Container style={{textAlign: 'center', marginTop: 30}}>
        <img style={{width: '25%', height: 'auto'}} src='/loading.svg'/>
        <Header as='h1'> Connect ZilPay Wallet to Continue</Header>
      </Container>
  )
}
