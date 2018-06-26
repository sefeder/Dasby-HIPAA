import React, {Component} from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, Button } from 'react-native';
import MessageForm from './MessageForm'
import MessageList from './MessageList'
import $ from 'jquery'


export default class App extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      username: null,
      channel: null
    }
    
  }

  componentDidMount = () => {
    this.getToken()
      .then(this.createChatClient)
      .then(this.joinGeneralChannel)
      .then(this.configureChannelEvents)
      .catch((error) => {
        console.log(error)
        this.setState({
          messages: [...this.state.messages, { body: `Error: ${error.message}` }],
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

  joinGeneralChannel = (chatClient) => {
    return new Promise((resolve, reject) => {
      chatClient.getSubscribedChannels().then(res => {
        console.log('subscribed channels: '+res)
        chatClient.getChannelByUniqueName('general').then((channel) => {
          console.log('unique channel: '+channel)
          this.addMessage({ body: 'Joining general channel...' })
          this.setState({ channel })

          channel.join().then(() => {
            this.addMessage({ body: `Joined general channel as ${this.state.username}` })
            window.addEventListener('beforeunload', () => channel.leave())
          }).catch(() => reject(Error('Could not join general channel.')))

          resolve(channel)
        }).catch(() => this.createGeneralChannel(chatClient))
      }).catch(() => reject(Error('Could not get channel list.')))
    })
  }

  getToken = () => {
    process.nextTick = setImmediate
    const $ = require('jquery')
    const Promise = require('promise')
    return new Promise((resolve, reject) => {

      this.setState({
        messages: [...this.state.messages, { body: `Connecting...` }],
      })
      return fetch('http://dc50b09a.ngrok.io/token', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }).then(res => res.json()).catch(err => console.log(err)).then((token) => {
        console.log('this is a token identity: ' + token.identity)
        this.setState({ username: token.identity })
        resolve(token)
      }).catch(() => {
        reject(Error("Failed to connect."))
      })
    })
  }


  createGeneralChannel = (chatClient) => {
    return new Promise((resolve, reject) => {
      this.addMessage({ body: 'Creating general channel...' })
      chatClient
        .createChannel({ uniqueName: 'dasby', friendlyName: 'Dasby' })
        .then(() => this.joinGeneralChannel(chatClient))
        .catch(() => reject(Error('Could not create general channel.')))
    })
  }

  handleNewMessage = (text) => {
    if (this.state.channel) {
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
