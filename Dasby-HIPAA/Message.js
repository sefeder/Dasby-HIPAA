import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native';


class Message extends Component {
    static propTypes = {
        author: PropTypes.string,
        body: PropTypes.string.isRequired,
        me: PropTypes.bool,
    }

    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                {this.props.username === this.props.author ? <Text style= { styles.me }> Me: </Text>: this.props.author && (<Text style={styles.author}>{this.props.author}:</Text>) }
                
                <Text> {this.props.body} </Text>
            </View>
         
        )
    }
}

const styles = StyleSheet.create({
    author: {
     color: 'red',
     fontWeight: 'bold'
    },
    me: {
    color: 'grey',
    fontWeight: 'bold'
    }
});

export default Message
