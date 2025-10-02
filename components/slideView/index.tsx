import { Slide } from '@/app/index';
import { timestampToTime } from '@/helpers/timestampToTime';
import React, { JSX } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import styles from './styles';

interface Props {
  slideId: number;
  slide: Slide;
  isAdvancedMode: boolean;
  isDarkMode: boolean;
  setCounterName: (name: string) => void;
  setDrinkName: (name: string) => void;
  increment: () => void;
  decrement: () => void;
  rotateIcon: () => void;
  clear: () => void;
}

export default function SlideView(props: Props): JSX.Element {
  const { slideId, slide, isDarkMode, isAdvancedMode, setCounterName, setDrinkName, increment, decrement, rotateIcon, clear } = props;

  return (
    <View key={slideId}>
      <View style={[styles.content, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        {isAdvancedMode ?
          <View style={styles.counterName}>
            <TextInput
              style={[styles.counterNameInput, { color: isDarkMode ? '#666' : '#ccc' }]}
              onChangeText={setCounterName}
              value={slide.counterName}
            />
          </View>
          : null}
        <TextInput
          style={[styles.drinkNameInput, { color: isDarkMode ? '#666' : '#ccc', marginTop: isAdvancedMode ? 0 : '20%' }]}
          onChangeText={setDrinkName}
          value={slide.drinkName}
        />
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={[styles.counter, { color: isDarkMode ? '#fff' : '#000' }]}>{slide.count}
          </Text>
          <Pressable onPress={rotateIcon}>
            <Text style={{ fontSize: 80, marginLeft: 10, color: isDarkMode ? '#fff' : '#000' }}>{String.fromCodePoint(props.slide.icon)}</Text>
          </Pressable>
        </View>
        <View style={[styles.buttons, { height: isAdvancedMode ? 84 : '30%' }]}>
          <TouchableOpacity onPress={increment}>
            <Text style={[styles.buttonPlus,
            { color: isDarkMode ? '#000' : '#fff' },
            { backgroundColor: isDarkMode ? '#fff' : '#555' },
            { borderColor: isDarkMode ? '#fff' : '#555' },
            ]}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={decrement}>
            <Text style={[styles.buttonMinus,
            { color: isDarkMode ? '#fff' : '#000' },
            { borderColor: isDarkMode ? '#fff' : '#555' },
            ]}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text
              style={[styles.buttonClear,
              { borderColor: isDarkMode ? '#fff' : '#555' },
              ]}
              onPress={
                () => Alert.alert(
                  "What!", "No more beers?",
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    { text: 'Clear', onPress: clear },
                  ],
                  { cancelable: true }
                )}
            >&#x1F5D1;</Text>
          </TouchableOpacity>
        </View>
        {isAdvancedMode ?
          <View style={styles.stats}>
            <ScrollView>
              <Text>
                {slide.drinks.map((drink, index) => (
                  <Text style={[styles.logItem, { color: isDarkMode ? '#666' : '#ccc' }]}
                    key={index}>{drink.name} @ {timestampToTime(drink.time)}{'\n'}</Text>
                ))}
              </Text>
            </ScrollView>
            <View style={styles.graph}>
              <BarChart
                data={slide.graph.map((ms) => ({ value: (ms.value / 1000 / 60) }))}
                frontColor={isDarkMode ? '#666' : '#ccc'}
                spacing={4}
                hideRules
                barWidth={100 / slide.graph.length}
                disablePress
                yAxisColor='transparent'
                yAxisTextStyle={{ color: isDarkMode ? '#666' : '#ccc' }}
                xAxisColor={isDarkMode ? '#666' : '#ccc'}
                height={120}
                noOfSections={5}
                yAxisLabelSuffix=' min'
              />
            </View>
          </View>
          : null}
      </View>
    </View >
  )
}