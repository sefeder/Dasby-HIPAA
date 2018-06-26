import React, { Component } from 'react'
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native';
import PropTypes from 'prop-types'
import t from 'tcomb-form-native'; // 0.6.9

const Form = t.form.Form;

const Message = t.struct({
    message: t.String,
});

class MessageForm extends Component {
    static propTypes = {
        onMessageSend: PropTypes.func.isRequired,
    }

    handleFormSubmit = (event) => {
        event.preventDefault()
        let value = this._form.getValue();
        console.log(value.message);
        this.props.onMessageSend(value.message)
    }

    
    render() {
        return (
            <View style={styles.form}>
                <Form type={Message} 
                    ref={c => this._form = c}/> 
                <TouchableHighlight
                    onPress={this.handleFormSubmit}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}> Send </Text>
                </TouchableHighlight>
            </View>
        )
    }

}
const styles = StyleSheet.create({
        form: {
            marginTop: 100
        },
        button: {
            backgroundColor: 'blue',
            borderRadius: 40,
            width: 300,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: 10
        },
        buttonText: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: 30
        }
});

export default MessageForm