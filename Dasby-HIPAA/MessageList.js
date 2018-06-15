import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Message from './Message'
import { View } from 'react-native';

class MessageList extends Component {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.object)
  }

  static defaultProps = {
    messages: [],
  }

  componentDidUpdate = () => {
    this.node.scrollTop = this.node.scrollHeight
  }

  render() {
    return (
      <View ref={(node) => (this.node = node)}>
        {this.props.messages.map((message, i) => (
          <Message key={i} {...message} />
        ))}
      </View>
    )
  }
}

export default MessageList