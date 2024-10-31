import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, FlatList, ListRenderItem, ActivityIndicator, Share, ImageBackground, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const locations: string[] = ["Avenida Goiás", "Parque Flamboyant", "Setor Bueno", "Setor Marista", "Setor Sul", "Jardim Goiás", "Setor Oeste", "Parque Areião", "Setor Central", "Setor Pedro Ludovico", "Parque Vaca Brava", "Setor Aeroporto", "Setor Leste Universitário", "Setor Nova Suíça", "Jardim América", "Setor Marista", "Setor Goiânia 2", "Setor Campinas", "Setor Jardim Botânico", "Setor Jardim Novo Mundo", "Setor Novo Horizonte", "Setor Universitário", "Setor Leste", "Setor Sudoeste", "Parque Lago das Rosas", "Praça Cívica", "Catedral Metropolitana", "Praça do Sol", "Setor Bela Vista", "Setor Aeroporto", "Parque dos Buritis", "UniGoias"];

const App: React.FC = () => {
  const [localizacao, setLocalizacao] = useState<string>('');
  const [problema, setProblema] = useState<string>('');
  const [localizacaoAtual, setLocalizacaoAtual] = useState<string>('Aguardando...');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const obterLocalizacaoAtual = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permissão de acesso à localização foi negada');
      setLoading(false);
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    const localizacaoString = `Latitude: ${loc.coords.latitude}, Longitude: ${loc.coords.longitude}`;
    setLocalizacaoAtual(localizacaoString);
    setLocalizacao(localizacaoString);
    setLoading(false);
  };

  const reportarProblema = () => {
    if (localizacao === '' || problema === '') {
      Alert.alert('Erro', 'Por favor, insira a localização e selecione um problema.');
    } else {
      Alert.alert(
        'Problema Reportado',
        `Localização Inserida: ${localizacao}\nProblema: ${problema}`
      );
    }
  };

  const compartilharProblema = async () => {
    try {
      await Share.share({
        message: `Estou com um problema na minha região!\nLocalização: ${localizacao}\nProblema: ${problema}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o problema.');
    }
  };

  const renderLocationItem: ListRenderItem<string> = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setLocalizacao(item);
      setShowSuggestions(false);
    }}>
      <Text style={styles.locationItem}>{item}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    obterLocalizacaoAtual();
  }, []);

  return (
    <ImageBackground source={require('../../assets/images/background.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Informe sua localização:</Text>
        <TextInput
          placeholder="Digite sua localização"
          value={localizacao}
          onChangeText={(text) => {
            setLocalizacao(text);
            setShowSuggestions(text.length > 0);
          }}
          style={styles.input}
        />
        
        {showSuggestions && (
          <FlatList
            data={locations.filter(loc => loc.toLowerCase().includes(localizacao.toLowerCase()))}
            renderItem={renderLocationItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.suggestionsList}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={obterLocalizacaoAtual}>
          <Text style={styles.buttonText}>Utilizar minha localização atual</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#528a64" />}
        <Text style={styles.title}>Selecione o problema:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={problema}
            onValueChange={(itemValue: string) => setProblema(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione o problema" value="" />
            <Picker.Item label="Vazamento de água" value="Vazamento de água" />
            <Picker.Item label="Falta de água" value="Falta de água" />
            <Picker.Item label="Esgoto entupido" value="Esgoto entupido" />
            <Picker.Item label="Falta de coleta de lixo" value="Falta de coleta de lixo" />
          </Picker>
        </View>
        <TouchableOpacity style={styles.button} onPress={reportarProblema}>
          <Text style={styles.buttonText}>Reportar Problema</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={compartilharProblema}>
          <Text style={styles.buttonText}>Compartilhar Problema</Text>
        </TouchableOpacity>
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        {location && (
          <MapView
            style={styles.map}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Minha Localização"
              description={localizacaoAtual}
            />
          </MapView>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    borderRadius: 15,
    margin: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#333333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  suggestionsList: {
    position: 'absolute',
    top: 95, // Ajuste a posição para ficar logo abaixo do campo de entrada
    left: 20,
    right: 20,
    maxHeight: 100,
    borderColor: '#dddddd',
    backgroundColor: '#f9f9f9',
    zIndex: 1,
    borderRadius: 5,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: '#dddddd',
  },
  button: {
    backgroundColor: '#5f9ea0',
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#dddddd',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
    width: '100%',
  },
  map: {
    width: '100%',
    height: 150,
    marginTop: 20,
    borderRadius: 15,
  },
  error: {
    color: '#ff6347',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default App;
