import React, { Component } from 'react'
import { StyleSheet, View, Button } from 'react-native';
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
            <View>
                <Form type={Message} 
                    ref={c => this._form = c}/> 
                <Button
                    title="Send"
                    onPress={this.handleFormSubmit}
                />
            </View>
        )
    }
}

export default MessageForm