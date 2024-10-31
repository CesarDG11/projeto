import { View, Text, Stylesheet } from 'reactive-native'

export default function App(){
    return(
        <View style={styles.container}>
            <Text>PEDRO LINDO GOSTOSO</Text>
        </View>
    )
}

const styles = StyleSheet.create ({
    container:{
        flex:1,
        backgroundColor: "red"
    }
})