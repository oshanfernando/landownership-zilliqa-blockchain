import React from 'react'
import {Button, Dimmer, Form, Icon, Loader, Modal} from 'semantic-ui-react'
import {BN, isValidChecksumAddress, Long, units} from '@zilliqa-js/zilliqa'
import {CONTRACT_ADDRESS} from "../constants";

function TransferLandModal({propertyId, statusCallback}) {
  const [open, setOpen] = React.useState(false);
  const [receiver, setReceiver] = React.useState();
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
              msg: status === 'success' ? 'The transfer is successful!' : 'Transfer failed!',
              error: status !== 'success'
            });

            setOpen(false);
          })
          .catch(err => console.log(err));
    }, 4000);
  }

  const makeTransfer = async () => {
    if (receiver && propertyId) {
      console.log('rec', receiver)
      console.log('propertyId', propertyId)
      const zilliqa = window.zilPay;
      const deployedContract = zilliqa.contracts.at(CONTRACT_ADDRESS);
      const gasPrice = units.toQa('2000', units.Units.Li);
      const amount = new BN(0);

      try {
        const contractCall = await deployedContract.call(
            'TransferPropertyOwnership',
            [
              {
                vname: 'property_id',
                type: 'Uint32',
                value: propertyId.toString(),
              },
              {
                vname: 'new_owner',
                type: 'ByStr20',
                value: receiver,
              }
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
        setLoading(false);
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
            <Button fluid icon color="linkedin" labelPosition='left'>
              Transfer
              <Icon name='tag'/>
            </Button>}
      >
        {
          isLoading ?
              <Dimmer active inverted>
                <Loader size='large'>Confirming transaction... </Loader>
              </Dimmer> : null
        }

        <Modal.Header>Transfer Property</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input
                fluid
                label='Property ID'
                id='form-input-property-id'
                value={propertyId}
                readOnly
            />
            <Form.Input
                fluid
                label='Address'
                placeholder='Base16 Address'
                id='form-input-address'
                onChange={e => setReceiver(e.target.value)}
                value={receiver}
                error={!receiver || !isValidChecksumAddress(receiver)}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
              content="Transfer Now"
              labelPosition='right'
              icon='checkmark'
              onClick={makeTransfer}
              positive
              disabled={!receiver || !isValidChecksumAddress(receiver)}
          />
        </Modal.Actions>
      </Modal>
  )
}

export default TransferLandModal
