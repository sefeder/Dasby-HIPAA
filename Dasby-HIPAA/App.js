import React, {Component} from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, Button } from 'react-native';
import MessageForm from './MessageForm'
import MessageList from './MessageList'
import $ from 'jquery'
import { VirgilCrypto, VirgilCardCrypto } from 'virgil-crypto' 
import { CardManager, VirgilCardVerifier, CachingJwtProvider, KeyStorage } from 'virgil-sdk';
import { Chance } from 'chance'

export default class App extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      username: null,
      channel: null,
      identity: null,
    }
    
  }

  componentDidMount = () => {
    this.identify()
  }

  identify = () => {
    //captured user values (username, password) will be saved here
    let chance = new Chance()
    let identity = chance.name()
    console.log('this is identity created by Chance: '+identity)
    this.setState({
      identity: identity
    },
      () => this.startChat()
    )
  }

  startChat = () => {
    this.initializeVirgil(this.state.identity)
      .then(this.getToken)
      .then(this.createChatClient)
      .then(this.joinChannel)
      .then(this.configureChannelEvents)
      .catch((error) => {
        console.log(error)
        this.setState({
          messages: [...this.state.messages, { body: `Error: ${error.message}` }],
        })
      })
  } 

  initializeVirgil = (identity) => {
    return new Promise((resolve, reject) => {
    const virgilCrypto = new VirgilCrypto();
    const virgilCardCrypto = new VirgilCardCrypto(virgilCrypto);
    const privateKeyStorage = new KeyStorage();
    const cardManager = new CardManager({
      cardCrypto: virgilCardCrypto,
      cardVerifier: new VirgilCardVerifier(virgilCardCrypto)
    });
    console.log('this is identity in initializeVirgil: '+identity)
    const keyPair = virgilCrypto.generateKeys();
    
  //VIRGIL KEY STORAGE SYSTEM
    // Get the raw private key bytes
    // Virgil Crypto exports the raw key bytes in DER format
    const privateKeyBytes = virgilCrypto.exportPrivateKey(keyPair.privateKey, 'OPTIONAL_PASSWORD');

    // Store the private key bytes
    privateKeyStorage.save(identity, privateKeyBytes)
    const rawCard = cardManager.generateRawCard({
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      identity: identity
    });
    fetch('http://792c5229.ngrok.io/signup', {
      method: 'POST',
      body: JSON.stringify({ rawCard }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()).then(result => {
        const publishedCard = cardManager.importCardFromJson(result.virgil_card);
        console.log(publishedCard)
        resolve(publishedCard)
        cardManager.accessTokenProvider = new CachingJwtProvider(() => {
          return fetch('http://792c5229.ngrok.io/get-virgil-jwt', {
              method: 'POST',
              headers: {
                'Authorization': this.generateAuthHeader(publishedCard.id, keyPair.privateKey),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ identity: identity })
            })
            .then(response => response.json())
            .then(result => result.token)
            // .then(token => console.log(token))
          })
        
        
      cardManager.searchCards("Bessie Klein").then(cards => {
          console.log(cards);
        }).catch(err=>console.log(err))
    });
   // took generateAuthHeader from here
    
  })
  }

  generateAuthHeader = (virgilCardId, virgilPrivateKey) => {
    const virgilCrypto = new VirgilCrypto();
    const stringToSign = `${virgilCardId}.${Date.now()}`;
    const signature = virgilCrypto.calculateSignature(stringToSign, virgilPrivateKey);
    console.log(`Bearer ${stringToSign}.${signature.toString('base64')}`)
    return `Bearer ${stringToSign}.${signature.toString('base64')}`;
  }

  getToken = (publishedCard) => {
    process.nextTick = setImmediate
    const Promise = require('promise')
    return new Promise((resolve, reject) => {
      // console.log(publishedCard)
      this.setState({
        messages: [...this.state.messages, { body: `Connecting...` }],
      });
      
      return new Promise((resolve, reject) => {
        const privateKeyStorage = new KeyStorage();
        const virgilCrypto = new VirgilCrypto();
        privateKeyStorage.load(this.state.identity)
          .then(loadedPrivateKeyBytes => {
              if (loadedPrivateKeyBytes === null) {
                return;
              }
              // Get the PrivateKey object from raw private key bytes
              const privateKey = virgilCrypto.importPrivateKey(loadedPrivateKeyBytes, 'OPTIONAL_PASSWORD')
              resolve(privateKey)
          });
      })
      .then( (privateKey) => {
        return fetch('http://792c5229.ngrok.io/get-twilio-jwt', {
          method: 'POST',
          headers: {
            'Authorization': this.generateAuthHeader(publishedCard.id, privateKey),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({identity: publishedCard.identity})
        })
        .then(res => res.json())
        .then((token) => {
          console.log('this is the token identity: ' + token.identity)
          this.setState({ username: token.identity })
          resolve(token)
        })
        .catch(() => {
          reject(Error("Failed to connect."))
        })
      })
  })
  }
  

  createChatClient = (token) => {
    const Chat = require('twilio-chat');
    return new Promise((resolve, reject) => {
      console.log(token.identity);
      resolve(Chat.Client.create(token.jwt))
      console.log(Chat.Client.create(token.jwt))
    })
  }

  joinChannel = (chatClient) => {
    return new Promise((resolve, reject) => {
      chatClient.getSubscribedChannels().then(res => {
        console.log(res)
        // this next line will need to be changed to a channel with members in it to see the messages
        chatClient.getChannelByUniqueName(this.state.identity)
        .then((channel) => {
          console.log(channel)
          this.addMessage({ body: `Joining ${channel.sid} channel...` })
          this.setState({ channel: channel})

          channel.join().then(() => {
            this.addMessage({ body: `Joined ${this.state.identity} channel as ${this.state.username}` })
            window.addEventListener('beforeunload', () => channel.leave())
          }).catch(() => reject(Error(`Could not join ${this.state.identity} channel.`)))

          resolve(channel)
        }).catch(() => this.createChannel(chatClient))
      }).catch(() => reject(Error('Could not get channel list.')))
    })
  }

  createChannel = (chatClient) => {
    return new Promise((resolve, reject) => {
      this.addMessage({ body: `Creating ${this.state.identity} channel...` })
      chatClient
        .createChannel({ uniqueName: this.state.identity, friendlyName: `${this.state.identity} and Dasby` })
        .then(() => this.joinChannel(chatClient))
        .catch(() => reject(Error(`Could not create ${this.state.identity} channel.`)))
    })
  }

  addMessage = (message) => {
    const messageData = { ...message, me: message.author === this.state.username }
    this.setState({
      messages: [...this.state.messages, messageData],
    })
  }

  configureChannelEvents = (channel) => {
    channel.on('messageAdded', ({ author, body }) => {
      this.addMessage({ author, body })
    })

    channel.on('memberJoined', (member) => {
      this.addMessage({ body: `${member.identity} has joined the channel.` })
    })

    channel.on('memberLeft', (member) => {
      this.addMessage({ body: `${member.identity} has left the channel.` })
    })
  }

  handleNewMessage = (text) => {
    console.log(this.state.messages)
    if (this.state.channel) {
      // console.log(text)
      // console.log(this.state.channel)
      this.state.channel.sendMessage(text)
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.app} behavior="padding" enabled>
        <MessageList username={this.state.username} messages={this.state.messages} />
          <MessageForm onMessageSend={this.handleNewMessage} />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  app: {
    display: 'flex',
    overflow: 'scroll',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-end'
  },
});
