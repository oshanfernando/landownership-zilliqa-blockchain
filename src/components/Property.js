import React, {useContext, useEffect, useState} from 'react'
import {Zilliqa} from "@zilliqa-js/zilliqa";
import {CONTRACT_ADDRESS, ZIL_TESTNET_API} from "../constants";
import {AppContext} from "../context/UserContext";
import {Container, Image, Icon, Card, Message, Dimmer, Loader, Header} from "semantic-ui-react";
import TransferLandModal from "./TransferLandModal";
import RegisterProperty from "./RegisterProperty";



function Property() {

    const ctx = useContext(AppContext);
    const [currentAddress, setCurrentAddress] = ctx.address;

    const [isRegistrar, setIsRegistrar] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [data, setData] = useState([])
    const [error, setError] = useState()
    const [message, setMessage] = useState()

    useEffect(() => {
        setFetching(true);
        getProperty(currentAddress).then(property => {
            setData(property.propertyData);
            setIsRegistrar(property.isRegistrar)
            setFetching(false)
        });
    },[error])

    const statusCallback = (status) => {
        setError(status.error);
        setMessage(status.msg);
        window.scrollTo(0, 0)
    }


    return (
        <Container style={{marginTop: 30}} >
            <Header as='h2' icon textAlign='center'>
                <Icon name='home' circular />
                <Header.Content>Property</Header.Content>
                {
                    error !== undefined ? (
                        <Message
                            compact
                            size='small'
                            error={error}
                            success={!error}
                            header={message}
                        />
                    ) : null

                }
            </Header>
            {
                isRegistrar ?
                    <Container style={{width: '80%', marginBottom: 50}} textAlign='right'>
                        <RegisterProperty statusCallback={statusCallback}/>
                    </Container> : null
            }


            {
                fetching ?
                        <Dimmer active inverted>
                            <Loader size='large'>Loading</Loader>
                        </Dimmer>
                    :
                    <Card.Group centered>
                        {
                            Array.isArray(data) && data.map(property => (
                                <Card key={property.propertyId} color='violet'>
                                    <Image src='/house.svg' wrapped ui={false} />
                                    <Card.Content>
                                        <Card.Header>{`Property ID: ${property.propertyId}`}</Card.Header>
                                        <Card.Meta>
                                            <Icon name='map marker alternate' />
                                            {` ${property.longitude} ,  ${property.latitude}`}
                                        </Card.Meta>
                                        <Card.Description>
                                            <div style={{marginTop: '10px', fontSize: '16px'}}>
                                                {property.address}
                                            </div>
                                        </Card.Description>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div style={{fontSize: '12px', wordWrap: 'break-word'}}>
                                            owner: {property.owner ? property.owner : 'Available'}
                                        </div>
                                        <TransferLandModal propertyId={property.propertyId} statusCallback={statusCallback} />
                                    </Card.Content>
                                </Card>
                            ))
                        }
                    </Card.Group>
            }

        </Container>

    )

}

const getProperty = async (currentAddress) => {
    const zilliqa = new Zilliqa(ZIL_TESTNET_API);
    const deployedContract = zilliqa.contracts.at(CONTRACT_ADDRESS);
    const initState = await deployedContract.getInit();
    const registrar = initState.filter(state => state.vname = 'registrar')[0];

    const contractState = await deployedContract.getState();
    console.log(contractState)
    const { property, owners } = contractState;

    let propertyData = [];
    let isRegistrar = false;

    console.log(currentAddress.base16, registrar.value)
    if (currentAddress.base16.toUpperCase() === registrar.value.toUpperCase()) {
        // contract owner .i.e. registrar
        isRegistrar = true;
        Object.entries(property).forEach(
            ([key, value]) => {
                propertyData.push({
                    propertyId: key,
                    ...value,
                    owner: owners[key]
                });
            }
        );
    } else {
        // individual
        let myPropertyIds = []
        Object.entries(owners).forEach(
            ([key, value]) => {
                // key = propertyId
                // value = current owner's wallet address
                console.log(value, currentAddress.base16)
                if (value.toUpperCase() === currentAddress.base16.toUpperCase()) {
                    myPropertyIds.push(key);
                }
            }
        );

        Object.entries(property).forEach(
            ([key, value]) => {
                // Get only property owned by the individual
                // key = propertyId
                // value = property details
                if (myPropertyIds.some(id => id === key)) {
                    propertyData.push({
                        propertyId: key,
                        ...value,
                        owner: owners[key]
                    });
                }
            }
        );
    }
    console.log(propertyData)
    return {
        propertyData: propertyData,
        isRegistrar : isRegistrar
    };
}

export default Property;
