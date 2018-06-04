import React, {Component} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';


doSomething = () => {

}
export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={doSomething}
          title="Learn More"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
        <Text>Welcome to Dasby!</Text>
        <Text>Hey Jenifer!!!!</Text>
        <Text>Shake your phone to open the developer menu.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
