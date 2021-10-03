import React from 'react'
import {Button, Icon, Form, Modal, Dimmer, Loader} from 'semantic-ui-react'
import {CONTRACT_ADDRESS} from "../constants";
import {BN, Long, units} from "@zilliqa-js/zilliqa";

function RegisterProperty({statusCallback}) {
  const [open, setOpen] = React.useState(false);
  const [address, setAddress] = React.useState();
  const [latitude, setLatitude] = React.useState();
  const [longitude, setLongitude] = React.useState();
  const [isLoading, setLoading] = React.useState(false);

  const pollReceipt = (tranID) => {
    let timeout = setInterval(async () => {
      window.zilPay.blockchain
          .getTransaction(tranID)
          .then(tx => {
            console.log('tx', tx);
            const event = tx.receipt.event_logs[0];
            const { params } = event;
            const status = params.filter(e => e.vname === 'status')[0].value;

            clearInterval(timeout);
            setLoading(false);

            statusCallback({
              msg: status === 'success' ? 'Property has been registered' : 'Registration failed!',
              error: status !== 'success'
            });

            setOpen(false);
          })
          .catch(err => console.log(err));
    }, 4000);
  }

  const registerProperty = async () => {
    if (address && latitude && latitude && longitude) {
      const zilliqa = window.zilPay;
      const deployedContract = zilliqa.contracts.at(CONTRACT_ADDRESS);
      const gasPrice = units.toQa('2000', units.Units.Li);
      const amount = new BN(0);

      try {
        const contractCall = await deployedContract.call(
            'RegisterProperty',
            [
              {
                vname: 'addr',
                type: 'String',
                value: address,
              },
              {
                vname: 'lng',
                type: 'String',
                value: longitude.toString(),
              },
              {
                vname: 'lat',
                type: 'String',
                value: latitude.toString(),
              },
            ],
            {
              amount,
              gasPrice,
              gasLimit: Long.fromNumber(8000)
            }
        );

        console.log(`The contract call response is:`, contractCall);
        setLoading(true);
        pollReceipt(contractCall.TranID);

      } catch (e) {
        console.error('Failed to call contract', e.message);
        statusCallback({
          error: true,
          msg: 'Failed to call contract'
        });
        setOpen(false);
      }
    }
  }

  return (
      <Modal
          size="tiny"
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          closeOnEscape={false}
          closeOnDimmerClick={false}
          trigger={
            <Button icon color="instagram" labelPosition='left'>
              Add new Property
              <Icon name='plus' />
            </Button>}
      >
        {
          isLoading ?
              <Dimmer active inverted>
                <Loader size='large'>Confirming transaction... </Loader>
              </Dimmer> : null
        }
        <Modal.Header>Add Property</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input
                fluid
                label='Address'
                id='form-input-property-address'
                value={address}
                onChange={e => setAddress(e.target.value)}
            />
            <Form.Input
                fluid
                label='Latitude'
                id='form-input-property-latitude'
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
            />
            <Form.Input
                fluid
                label='Longitude'
                id='form-input-property-latitude'
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
              content="Register Property"
              labelPosition='right'
              icon='checkmark'
              onClick={registerProperty}
              positive
              disabled={!(address && longitude && latitude)}
          />
        </Modal.Actions>
      </Modal>
  )
}
export default RegisterProperty
