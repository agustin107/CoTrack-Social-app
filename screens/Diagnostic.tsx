import React, {
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSafeArea } from 'react-native-safe-area-context';
import BottomSheet from 'reanimated-bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';

type QuestResults = 'positive' | 'neutral' | 'negative';

const { height } = Dimensions.get('screen');

const initialState = {
  symptoms: new Map(),
  travel: undefined,
  confirmedContact: undefined,
  suspectedContact: undefined,
  age: undefined,
  illness: new Map(),
};

function reducer(state, newState) {
  return { ...state, ...newState };
}

// Workaround for RectButton not working inside the bottom sheet
function Touchable({ children, ...props }) {
  if (Platform.OS === 'ios') {
    return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
  }
  return <RectButton {...props}>{children}</RectButton>;
}

function QuestButton({ id, text, onPress, selected }) {
  const isSelected = !!selected.get(id);

  const handlePress = () => {
    onPress(id);
  };

  return (
    <RectButton
      style={[styles.button, isSelected && styles.activeButton]}
      onPress={handlePress}
    >
      <Text style={[styles.buttonText, isSelected && styles.activeButtonText]}>
        {text}
      </Text>
    </RectButton>
  );
}

function YesNoButtons({ id, onPress, state }) {
  const isYes = state === 'yes';
  const isNo = state === 'no';

  const handleYesPress = () => {
    onPress({ [id]: 'yes' });
  };
  const handleNoPress = () => {
    onPress({ [id]: 'no' });
  };
  return (
    <>
      <RectButton
        style={[styles.button, isYes && styles.activeButton]}
        onPress={handleYesPress}
      >
        <Text style={[styles.buttonText, isYes && styles.activeButtonText]}>
          Si
        </Text>
      </RectButton>
      <RectButton
        style={[styles.button, state === 'no' && styles.activeButton]}
        onPress={handleNoPress}
      >
        <Text style={[styles.buttonText, isNo && styles.activeButtonText]}>
          No
        </Text>
      </RectButton>
    </>
  );
}

interface QuestionaryProps {
  onShowResults: (value: QuestResults) => void;
}

function Questionary({ onShowResults }: QuestionaryProps) {
  const [state, setState] = useReducer(reducer, initialState);

  const onSelectSymptoms = useCallback(
    id => {
      const newSelected = new Map(state.symptoms);
      newSelected.set(id, !state.symptoms.get(id));

      setState({ symptoms: newSelected });
    },
    [state.symptoms],
  );

  const onSelectIllness = useCallback(
    id => {
      const newSelected = new Map(state.illness);
      newSelected.set(id, !state.illness.get(id));

      setState({ illness: newSelected });
    },
    [state.illness],
  );

  useEffect(() => {
    const hasSymptoms =
      state.symptoms.size > 0 &&
      Array.from(state.symptoms).find((s: [string, boolean]) => s[1]);
    const hasIllness =
      state.illness.size > 0 &&
      Array.from(state.illness).find((s: [string, boolean]) => s[1]);
    if (
      !!hasSymptoms &&
      !!hasIllness &&
      state?.travel &&
      state?.confirmedContact &&
      state?.suspectedContact &&
      state.age > 0
    ) {
      bs.current.snapTo(0);
    } else {
      bs.current.snapTo(1);
    }
  }, [state]);

  const handlePress = () => {
    onShowResults('negative');
  };

  const renderInner = () => (
    <View style={styles.panel}>
      <Touchable style={styles.panelButton} onPress={handlePress}>
        <Text style={styles.panelButtonTitle}>REALIZAR DIAGNÓSTICO</Text>
      </Touchable>
    </View>
  );

  const bs = useRef<BottomSheet>();

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
      >
        <ScrollView contentContainerStyle={styles.questContainer}>
          <Text style={styles.title}>
            Te haremos un par de preguntas pidiendo que detalles los síntomas
            que estás teniendo y también saber si creés haber estado en contacto
            con alguien infectado.
          </Text>
          <Text style={styles.subtitle}>Dolencias y síntomas</Text>
          <View style={styles.questButtons}>
            <QuestButton
              id="fever"
              text="Fiebre"
              onPress={onSelectSymptoms}
              selected={state.symptoms}
            />
            <QuestButton
              id="cough"
              text="Tos seca"
              onPress={onSelectSymptoms}
              selected={state.symptoms}
            />
            <QuestButton
              id="throat"
              text="Dolor de garganta"
              onPress={onSelectSymptoms}
              selected={state.symptoms}
            />
            <QuestButton
              id="breath"
              text="Dificultad para respirar"
              onPress={onSelectSymptoms}
              selected={state.symptoms}
            />
            <QuestButton
              id="headache"
              text="Dolor de cabeza"
              onPress={onSelectSymptoms}
              selected={state.symptoms}
            />
            <QuestButton
              id="diarrhea"
              text="Descompostura o diarrea"
              onPress={onSelectSymptoms}
              selected={state.symptoms}
            />
            <QuestButton
              id="tiredness"
              text="Cansancio general"
              onPress={onSelectSymptoms}
              selected={state.symptoms}
            />
          </View>
          <Text style={styles.subtitle}>Contacto cercano</Text>
          <Text style={styles.subtitle}>
            ¿Volviste de viaje de algún país con algún caso confirmado de
            coronavirus?
          </Text>
          <View style={styles.questButtons}>
            <YesNoButtons id="travel" onPress={setState} state={state.travel} />
          </View>
          <Text style={styles.subtitle}>
            ¿Tuviste contacto con alguien que haya sido confirmado como
            contagiado?
          </Text>
          <View style={styles.questButtons}>
            <YesNoButtons
              id="confirmedContact"
              onPress={setState}
              state={state.confirmedContact}
            />
          </View>
          <Text style={styles.subtitle}>
            ¿Tuviste contacto con alguien que sospeches se haya contagiado?
          </Text>
          <View style={styles.questButtons}>
            <YesNoButtons
              id="suspectedContact"
              onPress={setState}
              state={state.suspectedContact}
            />
          </View>
          <TextInput
            placeholder="Edad"
            onChangeText={text => setState({ age: text })}
            value={state.age}
            keyboardType="number-pad"
            style={styles.input}
          />
          <View style={styles.questButtons}>
            <QuestButton
              id="cancer"
              text="Cáncer"
              onPress={onSelectIllness}
              selected={state.illness}
            />
            <QuestButton
              id="cholesterol"
              text="Colesterol"
              onPress={onSelectIllness}
              selected={state.illness}
            />
            <QuestButton
              id="diabetes"
              text="Diabetes"
              onPress={onSelectIllness}
              selected={state.illness}
            />
            <QuestButton
              id="cardio"
              text="Enfermedades cardiovasculares"
              onPress={onSelectIllness}
              selected={state.illness}
            />
            <QuestButton
              id="respiratory"
              text="Enfermedades respiratorias"
              onPress={onSelectIllness}
              selected={state.illness}
            />
            <QuestButton
              id="ms"
              text="Esclerosis múltiple"
              onPress={onSelectIllness}
              selected={state.illness}
            />
            <QuestButton
              id="hypertension"
              text="Hipertensión arterial"
              onPress={onSelectIllness}
              selected={state.illness}
            />
            <QuestButton
              id="hyperthyroidism"
              text="Hipotiroidismo o hipertiroidismo"
              onPress={onSelectIllness}
              selected={state.illness}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomSheet
        ref={bs}
        snapPoints={[80, 0]}
        renderContent={renderInner}
        initialSnap={1}
        enabledBottomClamp
      />
    </>
  );
}

function PositiveResults({ onShowQuest }) {
  const navigation = useNavigation();
  return (
    <>
      <AntDesign name="smile-circle" size={50} color="#79BC6A" />
      <Text style={styles.cardTitle}>SIN RIESGOS</Text>
      <Text style={styles.cardSubTitle}>
        {`No contás con síntomas que puedan estar relacionados con el contagio de coronavirus, como así tampoco haber estado posiblemente expuesto a gente contagiada.\n\nTe proponemos repasar el listado de medidas preventivas para evitar el contagio y a compartir con otros esta información.`}
      </Text>
      <RectButton
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={() => navigation.navigate('Prevention')}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Consejos para la prevención
        </Text>
      </RectButton>
      <Text style={styles.cardSubTitle}>
        {`Si tus síntomas fueron cambiando, por favor volvé a realizar el autodiagnóstico y seguí las recomendaciones dadas.`}
      </Text>
      <RectButton
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={onShowQuest}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Realizar diagnóstico nuevamente
        </Text>
      </RectButton>
    </>
  );
}
function NeutralResults({ onShowQuest }) {
  const navigation = useNavigation();
  return (
    <>
      <AntDesign name="meho" size={50} color="#EEC20B" />
      <Text style={styles.cardTitle}>RIESGO MODERADO</Text>
      <Text style={styles.cardSubTitle}>
        {`Algunos de tus síntomas pueden estar asociados al contagio de coronavirus pero no son concluyentes para determinar si efectivamente estás infectado.\n\nTe proponemos repasar el listado de medidas preventivas para evitar el contagio y a compartir con otros esta información.`}
      </Text>
      <RectButton
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={() => navigation.navigate('Prevention')}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Consejos para la prevención
        </Text>
      </RectButton>
      <Text style={styles.cardSubTitle}>
        {`Si tus síntomas fueron cambiando, por favor volvé a realizar el autodiagnóstico y seguí las recomendaciones dadas.`}
      </Text>
      <RectButton
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={onShowQuest}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Realizar diagnóstico nuevamente
        </Text>
      </RectButton>
    </>
  );
}

function NegativeResults({ onShowQuest }) {
  const navigation = useNavigation();
  return (
    <>
      <AntDesign name="frown" size={50} color="#E50000" />
      <Text style={styles.cardTitle}>RIESGO ALTO</Text>
      <Text style={styles.cardSubTitle}>
        Es muy posible que te hayas contagiado de coronavirus.{`\n\n`}Podés
        llamar a alguno de los siguientes números de organismos oficiales para
        que te cuenten cómo proceder y recibir asistencia médica y psicológica:
        {`\n\n`}Ministerio de Salud en CABA: {`\n`}
      </Text>
      <Text
        style={{ color: '#007AFF' }}
        onPress={async () => {
          try {
            await Linking.openURL(`tel:148`);
          } catch (e) {
            Alert.alert('Error al intentar hacer la llamada');
          }
        }}
      >
        148
      </Text>
      <Text style={styles.cardSubTitle}>
        Ministerio de Salud en Argentina: {`\n`}
      </Text>
      <Text
        style={{ color: '#007AFF' }}
        onPress={async () => {
          try {
            await Linking.openURL(`tel:0800-222-1002`);
          } catch (e) {
            Alert.alert('Error al intentar hacer la llamada');
          }
        }}
      >
        0800-222-1002
      </Text>
      <Text style={styles.cardSubTitle}>
        opción 1{`\n\n`}Gobierno de la Ciudad de Buenos Aires:{`\n`}
      </Text>
      <Text
        style={{ color: '#007AFF' }}
        onPress={async () => {
          try {
            await Linking.openURL(`tel:0800-222-1002`);
          } catch (e) {
            Alert.alert('Error al intentar hacer la llamada');
          }
        }}
      >
        107
      </Text>
      <RectButton
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={() => navigation.navigate('Prevention')}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Consejos para la prevención
        </Text>
      </RectButton>
      <Text style={styles.cardSubTitle}>
        {`Si tus síntomas fueron cambiando, por favor volvé a realizar el autodiagnóstico y seguí las recomendaciones dadas.`}
      </Text>
      <RectButton
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={onShowQuest}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Realizar diagnóstico nuevamente
        </Text>
      </RectButton>
    </>
  );
}

export default function Diagnostic({ navigation }) {
  const insets = useSafeArea();
  const [translateY] = useState(new Animated.Value(height));
  const [visible, setVisible] = useState(true);
  const [results, setResults] = useState<undefined | QuestResults>();

  const onShowQuest = () => {
    Animated.timing(translateY, {
      toValue: height,
      easing: Easing.inOut(Easing.quad),
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(true));
  };
  const onShowResults = (value: QuestResults) => {
    setResults(value);
    setVisible(false);
    Animated.timing(translateY, {
      toValue: 0,
      easing: Easing.inOut(Easing.quad),
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!visible && (
        <ScrollView
          style={[styles.container]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.Text
            style={[
              styles.cardTitle,
              {
                opacity: translateY.interpolate({
                  inputRange: [0, height],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            Resultado
          </Animated.Text>
          <Animated.View style={[styles.card, { transform: [{ translateY }] }]}>
            {results === 'positive' && (
              <PositiveResults onShowQuest={onShowQuest} />
            )}
            {results === 'neutral' && (
              <NeutralResults onShowQuest={onShowQuest} />
            )}
            {results === 'negative' && (
              <NegativeResults onShowQuest={onShowQuest} />
            )}
          </Animated.View>
        </ScrollView>
      )}
      {visible && (
        <Animated.View
          style={{
            opacity: translateY.interpolate({
              inputRange: [0, height],
              outputRange: [0, 1],
            }),
          }}
        >
          <Questionary onShowResults={onShowResults} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  cardTitle: { fontSize: 22, padding: 20 },
  cardSubTitle: { fontSize: 14, paddingTop: 20, textAlign: 'center' },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  smileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 75,
    width: 120,
    height: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  smileButtonText: {
    fontSize: 18,
    paddingVertical: 10,
  },
  questContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  title: { paddingTop: 20 },
  subtitle: { paddingTop: 20, paddingBottom: 10 },
  button: {
    // flex: 1,
    flexDirection: 'row',
    minHeight: 50,
    width: '49%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  buttonText: {
    padding: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  activeButton: {
    backgroundColor: '#29C097',
  },
  activeButtonText: { color: '#fff' },
  input: {
    padding: 15,
    marginVertical: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgb(204,204,204)',
  },
  panel: {
    height: 80,
    padding: 20,
    backgroundColor: '#ffffffFA',
    // paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  panelButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#29C097',
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
});
