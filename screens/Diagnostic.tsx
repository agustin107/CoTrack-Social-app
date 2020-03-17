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
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  TextInput,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSafeArea } from 'react-native-safe-area-context';
import BottomSheet from 'reanimated-bottom-sheet';
import { useNavigation } from '@react-navigation/native';

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

function QuestButton({ id, text, onPress, selected }) {
  const isSelected = !!selected.get(id);

  const handlePress = () => {
    onPress(id);
  };
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.activeButton]}
      onPress={handlePress}
    >
      <Text style={[styles.buttonText, isSelected && styles.activeButtonText]}>
        {text}
      </Text>
    </TouchableOpacity>
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
      <TouchableOpacity
        style={[styles.button, isYes && styles.activeButton]}
        onPress={handleYesPress}
      >
        <Text style={[styles.buttonText, isYes && styles.activeButtonText]}>
          Si
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, state === 'no' && styles.activeButton]}
        onPress={handleNoPress}
      >
        <Text style={[styles.buttonText, isNo && styles.activeButtonText]}>
          No
        </Text>
      </TouchableOpacity>
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
      <TouchableOpacity style={styles.panelButton} onPress={handlePress}>
        <Text style={styles.panelButtonTitle}>REALIZAR DIAGNÓSTICO</Text>
      </TouchableOpacity>
    </View>
  );

  const bs = useRef<BottomSheet>();

  return (
    <>
      <ScrollView contentContainerStyle={styles.questContainer}>
        <Text style={styles.title}>
          Te haremos un par de preguntas pidiendo que detalles los síntomas que
          estás teniendo y también saber si creés haber estado en contacto con
          alguien infectado.
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
      <BottomSheet
        ref={bs}
        snapPoints={[80, 0]}
        renderContent={renderInner}
        initialSnap={1}
        // enabledGestureInteraction={false}
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
      <TouchableOpacity
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={() => navigation.navigate('Prevention')}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Consejos para la prevención
        </Text>
      </TouchableOpacity>
      <Text style={styles.cardSubTitle}>
        {`Si tus síntomas fueron cambiando, por favor volvé a realizar el autodiagnóstico y seguí las recomendaciones dadas.`}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={onShowQuest}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Realizar diagnóstico nuevamente
        </Text>
      </TouchableOpacity>
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
      <TouchableOpacity
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={() => navigation.navigate('Prevention')}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Consejos para la prevención
        </Text>
      </TouchableOpacity>
      <Text style={styles.cardSubTitle}>
        {`Si tus síntomas fueron cambiando, por favor volvé a realizar el autodiagnóstico y seguí las recomendaciones dadas.`}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={onShowQuest}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Realizar diagnóstico nuevamente
        </Text>
      </TouchableOpacity>
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
        {`Es muy posible que te hayas contagiado.`}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={() => navigation.navigate('Prevention')}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Consejos para la prevención
        </Text>
      </TouchableOpacity>
      <Text style={styles.cardSubTitle}>
        {`Si tus síntomas fueron cambiando, por favor volvé a realizar el autodiagnóstico y seguí las recomendaciones dadas.`}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.activeButton, { width: '80%' }]}
        onPress={onShowQuest}
      >
        <Text style={[styles.buttonText, styles.activeButtonText]}>
          Realizar diagnóstico nuevamente
        </Text>
      </TouchableOpacity>
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
    setVisible(false);
    setResults(value);
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
        <View style={[styles.container]}>
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
        </View>
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
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    paddingTop: 40,
    paddingHorizontal: 20,
    // borderWidth: 1,
    // width: 100,
    // height: 100,
  },
  cardTitle: { fontSize: 22, padding: 20 },
  cardSubTitle: { fontSize: 14, paddingTop: 20, textAlign: 'center' },
  cardButtons: {
    // flex: 1,
    flexDirection: 'row',
    // flexWrap: 'wrap',
    // flexGrow: 1,
    justifyContent: 'center',
    // paddingVertical: 30,
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
    // flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    // marginBottom: 50,
    // borderWidth: 1,
  },
  questButtons: {
    // flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  title: { paddingTop: 20 },
  subtitle: { paddingTop: 20, paddingBottom: 10 },
  button: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    minHeight: 50,
    width: '49%',
    // flexGrow: 1,
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
    // fontSize: 12,
    padding: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  activeButton: { backgroundColor: 'rgba(0,188,141,1)' },
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
    // padding: 13,
    borderRadius: 10,
    backgroundColor: 'rgba(0,188,141,1)',
    // marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
});
