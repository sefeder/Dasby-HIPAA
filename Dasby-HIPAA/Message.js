import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'react-native';


class Message extends Component {
    static propTypes = {
        author: PropTypes.string,
        body: PropTypes.string.isRequired,
        me: PropTypes.bool,
    }

    render() {
        return (
            <Text>
                {this.props.author && (
                    <span className="author">{this.props.author}:</span>
                )}
                {this.props.body}
            </Text>
         
        )
    }
}

export default Message
