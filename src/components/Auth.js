import React, {useState, useContext} from 'react'
import {AppContext} from '../context/UserContext';
import {Button, Form, Grid, Segment, Divider, Container, Header, Label} from 'semantic-ui-react'
import {Zilliqa, getAddressFromPrivateKey, decryptPrivateKey, units, BN} from '@zilliqa-js/zilliqa'
import {ZIL_TESTNET_API} from '../constants';;

function Auth() {

  const ctx = useContext(AppContext);
  const [authenticated, setAuthenticated] = ctx.auth;
  const [balance, setBalance] = ctx.balance;
  const [currentAddress, setCurrentAddress] = ctx.address;

  const [file, setFile] = useState();
  const [passphrase, setPassphrase] = useState();
  const [loading, setLoading] = useState(false);

  const readFileOnUpload = (uploadedFile) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      try {
        setFile(JSON.parse(fileReader.result));
      } catch (e) {
        console.error("**Not valid JSON file!**");
      }
    }
    if (uploadedFile !== undefined)
      fileReader.readAsText(uploadedFile);
  }

  const authenticateKeyStore = async () => {

    setLoading(true);
    try {
      console.log("Authenticating")
      const privKey = await decryptPrivateKey(passphrase, file);

      const zilliqa = new Zilliqa(ZIL_TESTNET_API);
      zilliqa.wallet.addByPrivateKey(privKey);
      const address = getAddressFromPrivateKey(privKey);
      setCurrentAddress(address);
      const balanceState = await zilliqa.blockchain.getBalance(address);
      const balance = balanceState.result.balance;

      setBalance(units.fromQa(new BN(balance), units.Units.Zil))
      setAuthenticated(true)
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setAuthenticated(false)
    }

  }

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
      <Container>
        <Header as='h1' style={{textAlign: 'center'}}>Connect Wallet</Header>
        <Segment style={{top: 20}}>
          <Grid columns={2} relaxed='very' stackable>
            <Grid.Column>
              <Form>
                <Form.Input
                    icon='file'
                    iconPosition='left'
                    label='Keystore file'
                    textAlign='left'
                    placeholder='Keystore file'
                    type='file'
                    onChange={(e) => readFileOnUpload(e.target.files[0])}
                />
                <Form.Input
                    icon='lock'
                    iconPosition='left'
                    label='Pass Phrase'
                    type='password'
                    onChange={(e) => setPassphrase(e.target.value)}
                />

                <Button content='Authenticate' primary onClick={authenticateKeyStore} loading={loading}/>
              </Form>
            </Grid.Column>

            <Grid.Column textAlign='center' verticalAlign='middle'>
              <Button loading={loading} content=' Connect ZilPay' icon='angle double right' size='big'
                      onClick={authenticateZilPay}/>
            </Grid.Column>
          </Grid>

          <Divider vertical>Or</Divider>
        </Segment>
      </Container>
  )
}

export default Auth
